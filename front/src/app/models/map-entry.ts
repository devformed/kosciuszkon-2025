import { LightEntry } from './light-entry';
import { PedestrianEntry } from './pedestrian-entry';

export interface MapEntry {
  lights: LightEntry[];
  pedestrians: PedestrianEntry[];
}
