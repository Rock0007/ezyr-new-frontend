import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BuilderMode, BuilderViewport } from "@/types/builder";

type BuilderState = {
  mode: BuilderMode;
  viewport: BuilderViewport;
  zoom: number;
  isCanvasLocked: boolean;
  isLeftPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  isConsoleOpen: boolean;
};

const initialState: BuilderState = {
  mode: "select",
  viewport: "desktop",
  zoom: 100,
  isCanvasLocked: false,
  isLeftPanelCollapsed: false,
  isRightPanelCollapsed: false,
  isConsoleOpen: false,
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
      state.zoom = action.payload;
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
  },
});

export const {
  setMode,
  setViewport,
  setZoom,
  toggleCanvasLock,
  toggleConsole,
  toggleLeftPanel,
  toggleRightPanel,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
