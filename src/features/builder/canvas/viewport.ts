import type { CanvasPoint, CanvasZoomOptions } from "./types";

export const CANVAS_ZOOM_MIN = 10;
export const CANVAS_ZOOM_MAX = 400;
export const CANVAS_ZOOM_STEP = 10;
export const CANVAS_GRID_MIN = 4;
export const CANVAS_GRID_MAX = 96;
export const CANVAS_STAGE_SIZE = {
  width: 4800,
  height: 3200,
};

export function clampZoom(value: number): number {
  return Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, Math.round(value)));
}

export function clampGridSize(value: number): number {
  return Math.min(CANVAS_GRID_MAX, Math.max(CANVAS_GRID_MIN, Math.round(value)));
}

export function screenToCanvasPoint({
  point,
  viewportRect,
  pan,
  zoom,
}: {
  point: CanvasPoint;
  viewportRect: DOMRect;
  pan: CanvasPoint;
  zoom: number;
}): CanvasPoint {
  const scale = zoom / 100;

  return {
    x: (point.x - viewportRect.left - pan.x) / scale,
    y: (point.y - viewportRect.top - pan.y) / scale,
  };
}

export function getPanForZoomAtPoint({
  currentZoom,
  nextZoom,
  pan,
  viewportRect,
  focalPoint,
}: CanvasZoomOptions): CanvasPoint {
  const boundedZoom = clampZoom(nextZoom);
  const canvasPoint = screenToCanvasPoint({
    point: focalPoint,
    viewportRect,
    pan,
    zoom: currentZoom,
  });
  const nextScale = boundedZoom / 100;

  return {
    x: focalPoint.x - viewportRect.left - canvasPoint.x * nextScale,
    y: focalPoint.y - viewportRect.top - canvasPoint.y * nextScale,
  };
}

export function getViewportCenter(rect: DOMRect): CanvasPoint {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function addPoints(first: CanvasPoint, second: CanvasPoint): CanvasPoint {
  return {
    x: first.x + second.x,
    y: first.y + second.y,
  };
}

export function subtractPoints(
  first: CanvasPoint,
  second: CanvasPoint,
): CanvasPoint {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
  };
}

export function snapPointToGrid(point: CanvasPoint, gridSize: number): CanvasPoint {
  const size = clampGridSize(gridSize);

  return {
    x: Math.round(point.x / size) * size,
    y: Math.round(point.y / size) * size,
  };
}
