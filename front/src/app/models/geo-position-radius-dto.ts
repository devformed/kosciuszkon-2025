import { LngLatLike } from 'mapbox-gl';

export interface GeoPositionRadiusDto {
  position: LngLatLike;
  radius: number;
}
