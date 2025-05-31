import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environment/environment';
import { LampData } from '../models/models';

@Component({
  standalone: true,
  selector: 'app-map-view',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  map!: mapboxgl.Map;
  lampData: LampData = sampleLampData;

  ngOnInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.94, 50.05],
      zoom: 13,
      accessToken: environment.mapbox.accessToken,
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.lampData.lights.forEach((ligth) => {
      new mapboxgl.Marker({ color: 'yellow' })
        .setLngLat(ligth.coordinates)
        .setPopup(
          new mapboxgl.Popup().setText(`Lamp ${ligth.id}: ${ligth.brightness}%`)
        )
        .addTo(this.map);
    });
  }
}

export const sampleLampData: LampData = {
  lights: [
    {
      id: 'LAT-01',
      brightness: 75,
      coordinates: [19.94, 50.05],
    },
    {
      id: 'LAT-02',
      brightness: 100,
      coordinates: [19.95, 50.055],
    },
  ],
  pedestrians: [
    {
      id: 'PED-01',
      coordinates: [19.94, 50.05],
    },
    {
      id: 'PED-02',
      coordinates: [19.95, 50.055],
    },
  ],
};
