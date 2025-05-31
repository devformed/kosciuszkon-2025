import { LngLatLike } from 'mapbox-gl';

export interface PedestrianEntry {
  uuid: string;
  position: LngLatLike;
}
