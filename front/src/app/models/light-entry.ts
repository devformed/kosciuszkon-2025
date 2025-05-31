import { LngLatLike } from 'mapbox-gl';
import { TimePeriod } from './time-period';

export interface LightEntry {
  uuid: string;
  brightness: Map<TimePeriod, number>;
  pos: LngLatLike;
}
