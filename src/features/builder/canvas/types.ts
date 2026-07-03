export type CanvasPoint = {
  x: number;
  y: number;
};

export type CanvasViewportState = {
  zoom: number;
  pan: CanvasPoint;
  isGridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
};

export type CanvasZoomOptions = {
  currentZoom: number;
  nextZoom: number;
  pan: CanvasPoint;
  viewportRect: DOMRect;
  focalPoint: CanvasPoint;
};
