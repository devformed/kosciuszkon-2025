import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environment/environment';
import { MapEntry } from '../../models/map-entry';
import { TimePeriod } from '../../models/time-period';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @Output() lampSelected = new EventEmitter<string>();
  map!: mapboxgl.Map;
  mapEntry: MapEntry = sampleLampData;

  ngOnInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.94, 50.05],
      zoom: 13,
      accessToken: environment.mapbox.accessToken,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.mapEntry.lights.forEach((ligth) => {
      const marker = new mapboxgl.Marker({ color: 'yellow' })
        .setLngLat(ligth.pos)
        .setPopup(
          new mapboxgl.Popup().setText(
            `${this.getBrightnessForTime(ligth.uuid)}`
          )
        )
        .addTo(this.map);

      marker.getElement().addEventListener('click', () => {
        this.lampSelected.emit(ligth.uuid);
      });
    });
  }

  getBrightnessForTime(uuid: string): string {
    const currentTime = new Date();
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    const light = this.mapEntry.lights.find((light) => light.uuid === uuid);

    if (!light) {
      return `No light found with ID: ${uuid}`;
    }

    for (const [timeRange, brightness] of light.brightness.entries()) {
      const fromMinutes = this.timeToMinutes(timeRange.from);
      const toMinutes = this.timeToMinutes(timeRange.to);

      const inRange =
        fromMinutes <= toMinutes
          ? currentMinutes >= fromMinutes && currentMinutes <= toMinutes
          : currentMinutes >= fromMinutes || currentMinutes <= toMinutes; // obsługa zakresów przez północ

      if (inRange) {
        return `Brightness at ${this.formatTime(currentTime)} - ${
          brightness * 100
        }%`;
      }
    }

    return `No brightness defined for current time.`;
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

export const sampleLampData: MapEntry = {
  lights: [
    {
      uuid: '123e4567-e89b-12d3-a456-426655440000',
      address: 'ul. Kwiatowa 5, Kraków',
      brightness: new Map<TimePeriod, number>([
        [{ from: '06:00', to: '18:00' }, 0.9],
        [{ from: '18:00', to: '23:59' }, 0.4],
      ]),
      pos: {
        lng: 19.935,
        lat: 50.0647,
      },
    },
    {
      uuid: '987f6543-e21c-45a6-b789-123456780000',
      address: 'ul. Słoneczna 10, Kraków',
      brightness: new Map<TimePeriod, number>([
        [{ from: '00:00', to: '06:00' }, 0.1],
        [{ from: '18:00', to: '23:59' }, 1.0],
      ]),
      pos: {
        lng: 19.9402,
        lat: 50.0678,
      },
    },
  ],
  pedestrians: [
    {
      uuid: 'abc12345-def6-7890-ab12-34567890cdef',
      position: {
        lng: 19.9365,
        lat: 50.0653,
      },
    },
    {
      uuid: 'fedcba98-7654-3210-fedc-ba9876543210',
      position: {
        lng: 19.939,
        lat: 50.0665,
      },
    },
  ],
};
