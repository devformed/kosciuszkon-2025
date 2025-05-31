import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environment/environment';
import { MapEntry } from '../../models/map-entry';
import { TimePeriodSetting } from '../../models/time-period';
import { LightService } from 'src/app/service/light.service';
import { LightEntry } from 'src/app/models/light-entry';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @Output() lampSelected = new EventEmitter<string>();
  map!: mapboxgl.Map;
  mapEntry: LightEntry[] = sampleLampData;

  constructor(private lightService: LightService) {}

  ngOnInit(): void {
    this.lightService
      .getNearest({ position: { lng: 19.94, lat: 50.05 }, radius: 9000 })
      .subscribe((lights) => {
        this.mapEntry = lights;
        this.initMap();
      });
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.94, 50.05],
      zoom: 13,
      accessToken: environment.mapbox.accessToken,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.mapEntry.forEach((ligth) => {
      const marker = new mapboxgl.Marker({ color: 'yellow' })
        .setLngLat(ligth.position)
        // .setPopup(
        //   new mapboxgl.Popup().setText(
        //     `${this.getBrightnessConfig(ligth.uuid)}`
        //   )
        // )
        .addTo(this.map);

      marker.getElement().addEventListener('click', () => {
        this.lampSelected.emit(ligth.uuid);
      });
    });
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
          : currentMinutes >= fromMinutes || currentMinutes <= toMinutes; // obsługa zakresów przez północ

      if (inRange) {
        return `Brightness at ${this.formatTime(currentTime)} - ${
          timeRange.brightness * 100
        }%`;
      }
      return 'No brightness defined for current time.';
    });
    return 'No brightness defined for current time.';
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
