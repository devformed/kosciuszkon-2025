import { Pedestrian } from '../models/pedestrian';

function interpolate(
  a: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function generateInterpolatedPath(
  points: [number, number][],
  steps: number
): [number, number][] {
  const segments: [number, number][][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push([points[i], points[i + 1]]);
  }

  const totalSegments = segments.length;
  const stepsPerSegment = Math.floor(steps / totalSegments);
  const remainder = steps % totalSegments;

  const result: [number, number][] = [];

  segments.forEach(([start, end], index) => {
    const stepsForThisSegment = stepsPerSegment + (index < remainder ? 1 : 0);
    for (let i = 0; i < stepsForThisSegment; i++) {
      const t = i / stepsForThisSegment;
      result.push(interpolate(start, end, t));
    }
  });

  result.push(points[points.length - 1]); // add final point
  return result;
}

const rawPoints: [number, number][] = [
  [19.996271, 50.083715],
  [19.99706, 50.084775],
  [19.997317, 50.085392],
  [19.996795, 50.086704],
];

const interpolatedPath = generateInterpolatedPath(rawPoints, 100);

export const pedestrians: Pedestrian[] = [
  {
    id: 'ped-krk-01',
    position: interpolatedPath[0],
    stepIndex: 0,
    path: interpolatedPath,
    direction: 1,
    lapCount: 0,
    maxLaps: 1,
    active: true,
  },
];
