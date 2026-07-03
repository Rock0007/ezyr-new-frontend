import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  CANVAS_GRID_MIN,
  clampGridSize,
  clampZoom,
  type CanvasPoint,
} from "@/features/builder/canvas";
import type { BuilderMode, BuilderViewport } from "@/types/builder";

type BuilderState = {
  mode: BuilderMode;
  viewport: BuilderViewport;
  zoom: number;
  isCanvasLocked: boolean;
  isLeftPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  isConsoleOpen: boolean;
  isGridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  canvasPan: CanvasPoint;
};

const initialState: BuilderState = {
  mode: "select",
  viewport: "desktop",
  zoom: 100,
  isCanvasLocked: false,
  isLeftPanelCollapsed: false,
  isRightPanelCollapsed: false,
  isConsoleOpen: false,
  isGridVisible: true,
  snapToGrid: true,
  gridSize: 24,
  canvasPan: { x: 220, y: 64 },
};

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<BuilderMode>) => {
      state.mode = action.payload;
    },
    setViewport: (state, action: PayloadAction<BuilderViewport>) => {
      state.viewport = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = clampZoom(action.payload);
    },
    zoomIn: (state, action: PayloadAction<number | undefined>) => {
      state.zoom = clampZoom(state.zoom + (action.payload ?? 10));
    },
    zoomOut: (state, action: PayloadAction<number | undefined>) => {
      state.zoom = clampZoom(state.zoom - (action.payload ?? 10));
    },
    setCanvasPan: (state, action: PayloadAction<CanvasPoint>) => {
      state.canvasPan = action.payload;
    },
    nudgeCanvasPan: (state, action: PayloadAction<CanvasPoint>) => {
      state.canvasPan = {
        x: state.canvasPan.x + action.payload.x,
        y: state.canvasPan.y + action.payload.y,
      };
    },
    resetCanvasViewport: (state) => {
      state.zoom = 100;
      state.canvasPan = initialState.canvasPan;
    },
    toggleCanvasLock: (state) => {
      state.isCanvasLocked = !state.isCanvasLocked;
    },
    toggleLeftPanel: (state) => {
      state.isLeftPanelCollapsed = !state.isLeftPanelCollapsed;
    },
    toggleRightPanel: (state) => {
      state.isRightPanelCollapsed = !state.isRightPanelCollapsed;
    },
    toggleConsole: (state) => {
      state.isConsoleOpen = !state.isConsoleOpen;
    },
    toggleGrid: (state) => {
      state.isGridVisible = !state.isGridVisible;
    },
    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },
    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = clampGridSize(action.payload);
      if (state.gridSize < CANVAS_GRID_MIN) {
        state.gridSize = CANVAS_GRID_MIN;
      }
    },
  },
});

export const {
  setMode,
  setCanvasPan,
  setGridSize,
  setViewport,
  setZoom,
  nudgeCanvasPan,
  resetCanvasViewport,
  toggleCanvasLock,
  toggleConsole,
  toggleGrid,
  toggleLeftPanel,
  toggleRightPanel,
  toggleSnapToGrid,
  zoomIn,
  zoomOut,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
