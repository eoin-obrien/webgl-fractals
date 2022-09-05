import { Vector2Tuple } from "three";

export const scalePoint = (
  point: Vector2Tuple,
  scale: number
): Vector2Tuple => {
  return [point[0] * scale, point[1] * scale];
};

export const deltaFromEvent = (
  event: MouseEvent,
  resolution: Vector2Tuple,
  scale: number = 1
): Vector2Tuple => {
  const [width, height] = resolution;
  const delta: Vector2Tuple = [
    event.clientX - width / 2,
    height / 2 - event.clientY,
  ];
  return scalePoint(delta, scale);
};

export const getScale = (resolution: Vector2Tuple, zoom: number): number => {
  return 1.0 / zoom / Math.min(...resolution);
};

export const translate = (
  point: Vector2Tuple,
  delta: Vector2Tuple,
  scale: number = 1
): Vector2Tuple => {
  const scaledDelta = scalePoint(delta, scale);
  return [point[0] + scaledDelta[0], point[1] + scaledDelta[1]];
};
