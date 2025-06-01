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
import * as turf from '@turf/turf';
import { LightMapBridgeService } from 'src/app/service/light-map-bridge.service';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @Output() lampSelected = new EventEmitter<string>();
  map!: mapboxgl.Map;
  @Input({ required: true }) mapEntry: LightEntry[] = [];

  constructor(private lightMapBridgeService: LightMapBridgeService) {}

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
            this.drawCircle(this.convertToArray(light.position), 30);
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
    });
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

export const sampleLampData: LightEntry[] = [
  {
    uuid: '123e4567-e89b-12d3-a456-426655440000',
    note: 'note',
    brightness: 0.9,
    disableAfterSeconds: 1,
    proximityActivationRadius: 1,
    address: 'ul. Kwiatowa 5, Kraków',
    brightnessConfig: [
      { from: '06:00', to: '18:00', brightness: 0.9 },
      { from: '18:00', to: '23:59', brightness: 0.4 },
    ],
    position: {
      lng: 19.935,
      lat: 50.0647,
    },
  },
  {
    uuid: '987f6543-e21c-45a6-b789-123456780000',
    note: 'note',
    brightness: 0.5,
    disableAfterSeconds: 1,
    proximityActivationRadius: 1,
    address: 'ul. Słoneczna 10, Kraków',
    brightnessConfig: [
      { from: '00:00', to: '06:00', brightness: 0.1 },
      { from: '18:00', to: '23:59', brightness: 1.0 },
    ],
    position: {
      lng: 19.9402,
      lat: 50.0678,
    },
  },
];
