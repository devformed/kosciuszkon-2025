import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environment/environment';
import { LightEntry } from 'src/app/models/light-entry';
import { Pedestrian } from 'src/app/models/pedestrian';
import * as turf from '@turf/turf';
import { LightMapBridgeService } from 'src/app/service/light-map-bridge.service';
import { LightService } from 'src/app/service/light.service';
import { pedestrians } from 'src/app/mock-data/mock-data';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @Input({ required: true }) mapEntry: LightEntry[] = [];
  @Output() lampSelected = new EventEmitter<string>();
  map!: mapboxgl.Map;
  pedestrians: Pedestrian[] = pedestrians;
  pedestrianMarkers = new Map<string, mapboxgl.Marker>();

  constructor(
    private lightMapBridgeService: LightMapBridgeService,
    private lightService: LightService
  ) {}

  ngOnInit(): void {
    this.initMap();
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.996448, 50.083719],
      zoom: 15,
      accessToken: environment.mapbox.accessToken,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.map.resize();
      this.mapEntry.forEach((light) => {
        const marker = new mapboxgl.Marker({ color: 'yellow' })
          .setLngLat(light.position)
          .addTo(this.map);

        marker.getElement().addEventListener('click', () => {
          if (light.proximityActivationRadius) {
            const radius = light.proximityActivationRadius ?? 30;
            this.lightMapBridgeService.setRadius(radius);
            this.lightMapBridgeService.setSelected(light.uuid);
            this.drawCircle(this.convertToArray(light.position), radius);
          }
          this.lampSelected.emit(light.uuid);
        });
      });

      this.lightMapBridgeService.selectedUuid$.subscribe((uuid) => {
        if (!uuid) {
          this.removeCircle();
          return;
        }

        const light = this.mapEntry.find((l) => l.uuid === uuid);
        if (light) {
          const center = this.convertToArray(light.position);
          const radius = this.lightMapBridgeService.currentRadius;

          this.drawCircle(center, radius);
        }
      });

      this.lightMapBridgeService.radius$.subscribe((r) => {
        const uuid = this.lightMapBridgeService.currentSelectedUuid;
        if (!uuid) return;
        const light = this.mapEntry.find((l) => l.uuid === uuid);
        if (light) {
          const center = this.convertToArray(light.position);
          this.drawCircle(center, r);
        }
      });

      this.startPedestrianSimulation(this.mapEntry);
    });
  }

  startPedestrianSimulation(lights: LightEntry[]) {
    this.pedestrianMarkers = new Map<string, mapboxgl.Marker>();

    this.pedestrians.forEach((pedestrian) => {
      const marker = this.createPedestrianMarker(pedestrian);
      this.pedestrianMarkers.set(pedestrian.id, marker);
    });

    setInterval(() => {
      (this.pedestrians ?? []).forEach((pedestrian) => {
        pedestrian.stepIndex += pedestrian.direction;

        if (
          pedestrian.stepIndex >= pedestrian.path.length - 1 ||
          pedestrian.stepIndex <= 0
        ) {
          pedestrian.direction *= -1;
          pedestrian.lapCount++;

          if (pedestrian.lapCount >= pedestrian.maxLaps * 2) {
            pedestrian.active = false;

            const marker = this.pedestrianMarkers.get(pedestrian.id);
            if (marker) {
              marker.remove();
              this.pedestrianMarkers.delete(pedestrian.id);
            }

            console.log(`🚶 ${pedestrian.id} zakończył trasę`);
            return;
          }
        }

        pedestrian.position = pedestrian.path[pedestrian.stepIndex];

        const marker = this.pedestrianMarkers.get(pedestrian.id);
        marker?.setLngLat(pedestrian.position);

        lights.forEach((light) => {
          const lightPos = this.convertToArray(light.position);
          const distance = turf.distance(lightPos, pedestrian.position, {
            units: 'meters',
          });

          if (distance <= (light.proximityActivationRadius ?? 50)) {
            this.lightService
              .sendMotionDetected(light.uuid, pedestrian.id)
              .subscribe({
                next: () =>
                  console.log(
                    `🚶 Motion detected at ${light.uuid} by ${pedestrian.id}`
                  ),
                error: (err) => console.error(err),
              });
          }
        });
      });
    }, 50);
  }

  createPedestrianMarker(pedestrian: Pedestrian): mapboxgl.Marker {
    const el = document.createElement('div');
    el.className = 'pedestrian-marker';
    el.title = pedestrian.id;
    el.innerText = '🚶';
    el.style.fontSize = '24px';

    return new mapboxgl.Marker(el)
      .setLngLat(pedestrian.position)
      .addTo(this.map);
  }

  removeCircle() {
    if (!this.map) return;

    if (this.map.getLayer('circle-layer')) {
      this.map.removeLayer('circle-layer');
    }

    if (this.map.getSource('circle')) {
      this.map.removeSource('circle');
    }
  }

  getBrightnessConfig(uuid: string): string {
    const currentTime = new Date();
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    const light = this.mapEntry.find((light) => light.uuid === uuid);

    if (!light) {
      return `No light found with ID: ${uuid}`;
    }

    light.brightnessConfig.forEach((timeRange) => {
      const fromMinutes = this.timeToMinutes(timeRange.from);
      const toMinutes = this.timeToMinutes(timeRange.to);

      const inRange =
        fromMinutes <= toMinutes
          ? currentMinutes >= fromMinutes && currentMinutes <= toMinutes
          : currentMinutes >= fromMinutes || currentMinutes <= toMinutes;

      if (inRange) {
        return `Brightness at ${this.formatTime(currentTime)} - ${
          timeRange.brightness * 100
        }%`;
      }
      return 'No brightness defined for current time.';
    });
    return 'No brightness defined for current time.';
  }

  drawCircle(center: [number, number], radiusMeters: number) {
    const radiusKm = radiusMeters / 1000;

    const circle = turf.circle(center, radiusKm, {
      steps: 64,
      units: 'kilometers',
    });

    if (this.map.getSource('circle')) {
      this.map.removeLayer('circle-layer');
      this.map.removeSource('circle');
    }

    this.map.addSource('circle', {
      type: 'geojson',
      data: circle,
    });

    this.map.addLayer({
      id: 'circle-layer',
      type: 'fill',
      source: 'circle',
      paint: {
        'fill-color': '#00aaff',
        'fill-opacity': 0.3,
      },
    });
  }

  private convertToArray(pos: mapboxgl.LngLatLike): [number, number] {
    if (Array.isArray(pos)) return pos;
    if ('lng' in pos && 'lat' in pos) return [pos.lng, pos.lat];
    if ('lon' in pos && 'lat' in pos) return [pos.lon, pos.lat];
    throw new Error('Unsupported LngLatLike format');
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  }
}
