import { LngLatLike } from 'mapbox-gl';

export interface LampData {
  lights: Light[];
  pedestrians: Pedestrian[];
}

export interface Light {
  id: string;
  brightness: number;
  coordinates: LngLatLike;
}

export interface Pedestrian {
  id: string;
  coordinates: LngLatLike;
}
