import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environment/environment';
import { LightEntry } from 'src/app/models/light-entry';
import { Pedestrian } from 'src/app/models/pedestrian';
import * as turf from '@turf/turf';
import { LightMapBridgeService } from 'src/app/service/light-map-bridge.service';
import { LightService } from 'src/app/service/light.service';
import { pedestrians } from 'src/app/mock-data/mock-data';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/service/websocket.service';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `
    <div>
      <div id="map" class="map-container"></div>
    </div>
  `,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnDestroy {
  @Input({ required: true }) mapEntry: LightEntry[] = [];
  @Output() lampSelected = new EventEmitter<string>();
  map!: mapboxgl.Map;
  pedestrians: Pedestrian[] = pedestrians;
  pedestrianMarkers = new Map<string, mapboxgl.Marker>();
  private lightMarkers = new Map<string, mapboxgl.Marker>();
  private wsSubscription?: Subscription;

  constructor(
    private lightMapBridgeService: LightMapBridgeService,
    private lightService: LightService,
    private ws: WebsocketService
  ) {}

  ngOnInit(): void {
    if (!this.wsSubscription) {
      this.wsSubscription = this.ws
        .listenToRegion(19.996448, 50.083719)
        .subscribe((light) => {
          this.updateLightMarker(light);
        });
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.9448923671489, 50.0646277319454],
      zoom: 15,
      accessToken: environment.mapbox.accessToken,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.map.resize();
      this.writeMarkers();

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

      // this.startPedestrianSimulation(this.mapEntry);
    });

    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.lightService
        .getNearest({
          position: { lng: center.lng, lat: center.lat },
          radius: 200,
        })
        .subscribe((lights) => {
          this.mapEntry = lights;
          this.writeMarkers();
        });
    });
  }

  writeMarkers() {
    this.mapEntry.forEach((light) => {
      const el = this.createLightMarkerElement(light.brightness);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(light.position)
        .addTo(this.map);

      this.lightMarkers.set(light.uuid, marker);

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
  }

  updateLightMarker(light: LightEntry) {
    const marker = this.lightMarkers.get(light.uuid);
    if (!marker) return;

    const el = marker.getElement();
    el.style.backgroundColor = this.brightnessToColor(light.brightness);

    marker.setLngLat(light.position);
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
              pedestrian.path = [[0, 0]];
              pedestrian.position = [0, 0];
              marker.remove();
              this.pedestrianMarkers.delete(pedestrian.id);
            }

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
              .subscribe();
          }
        });
      });
    }, 50);
  }

  brightnessToColor(brightness: number): string {
    if (brightness > 0.66) return '#00ff00';
    if (brightness > 0.1) return '#ffff00';
    return '#ff0000';
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

  private createLightMarkerElement(brightness: number): HTMLElement {
    const el = document.createElement('div');
    el.style.backgroundColor = this.brightnessToColor(brightness);
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid black';
    return el;
  }
}
