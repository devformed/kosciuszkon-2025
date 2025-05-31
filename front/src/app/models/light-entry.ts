import { LngLatLike } from 'mapbox-gl';
import { TimePeriodSetting } from './time-period';

export interface LightEntry {
  uuid: string;
  brightness: number;
  note: string | null;
  address: string;
  position: LngLatLike;
  disableAfterSeconds: number | null;
  proximityActivationRadius: number | null;
  brightnessConfig: Array<TimePeriodSetting>;
}
