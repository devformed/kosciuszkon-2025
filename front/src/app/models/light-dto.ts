import { LngLatLike } from 'mapbox-gl';
import { TimePeriod } from './time-period';

export interface LightDto {
  address: string | null;
  brightness: Map<TimePeriod, number> | null;
  pos: LngLatLike;
}
