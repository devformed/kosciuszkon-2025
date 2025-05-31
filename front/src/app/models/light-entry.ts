import { LngLatLike } from 'mapbox-gl';
import { TimePeriod } from './time-period';

export interface LightEntry {
  uuid: string;
  brightness: number;
  note: string;
  address: string;
  position: LngLatLike;
  disableAfterSeconds: number | null;
  proximityActivationRadius: number | null;
  brightnessConfig: Map<TimePeriod, number>;
}
