import { LngLatLike } from 'mapbox-gl';
import { TimePeriod } from './time-period';

export interface LightDto {
  address: string | null;
  note: string | null;
  disableAfterSeconds: number | null;
  proximityActivationRadius: number | null;
  brightness: Map<TimePeriod, number> | null;
  position: LngLatLike;
}
