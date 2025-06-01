export interface Pedestrian {
  id: string;
  position: [number, number];
  path: [number, number][];
  stepIndex: number;
  direction: 1 | -1;
  lapCount: number;
  maxLaps: number;
  active: boolean;
}
