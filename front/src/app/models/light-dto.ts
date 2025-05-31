import { LngLatLike } from 'mapbox-gl';
import { TimePeriodSetting } from './time-period';

export interface LightDto {
  address: string | null;
  note: string | null;
  disableAfterSeconds: number | null;
  proximityActivationRadius: number | null;
  brightnessConfig: Array<TimePeriodSetting> | null;
  position: LngLatLike;
}
