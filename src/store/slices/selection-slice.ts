import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SelectionBounds,
  SelectionMode,
  SelectionStateShape,
  SelectionValidationResult,
} from "@/features/builder/selection";

type SetSelectionPayload = {
  selectedIds: string[];
  activeNodeId?: string | null;
  focusedNodeId?: string | null;
  lastSelectedNodeId?: string | null;
  selectionMode?: SelectionMode;
};

const initialState: SelectionStateShape = {
  activeNodeId: "home-section",
  selectedIds: ["home-section"],
  hoveredId: null,
  focusedNodeId: "home-section",
  selectionBounds: null,
  selectionMode: "single",
  lastSelectedNodeId: "home-section",
};

function applySelectionResult(
  state: SelectionStateShape,
  result: SelectionValidationResult,
): void {
  state.selectedIds = result.selectedIds;
  state.activeNodeId = result.activeNodeId;
  state.focusedNodeId = result.focusedNodeId;
  state.lastSelectedNodeId = result.lastSelectedNodeId;
  state.selectionMode = result.selectionMode;
  state.selectionBounds = null;
}

function resolveMode(selectedIds: readonly string[]): SelectionMode {
  if (selectedIds.length === 0) {
    return "none";
  }

  return selectedIds.length === 1 ? "single" : "multi";
}

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectOne: (state, action: PayloadAction<string>) => {
      state.activeNodeId = action.payload;
      state.selectedIds = [action.payload];
      state.focusedNodeId = action.payload;
      state.lastSelectedNodeId = action.payload;
      state.selectionBounds = null;
      state.selectionMode = "single";
    },
    setSelection: (state, action: PayloadAction<SetSelectionPayload>) => {
      const activeNodeId =
        action.payload.activeNodeId ?? action.payload.selectedIds.at(-1) ?? null;

      state.selectedIds = action.payload.selectedIds;
      state.activeNodeId = activeNodeId;
      state.focusedNodeId = action.payload.focusedNodeId ?? activeNodeId;
      state.lastSelectedNodeId =
        action.payload.lastSelectedNodeId ?? activeNodeId;
      state.selectionMode =
        action.payload.selectionMode ?? resolveMode(action.payload.selectedIds);
      state.selectionBounds = null;
    },
    applySelection: (
      state,
      action: PayloadAction<SelectionValidationResult>,
    ) => {
      applySelectionResult(state, action.payload);
    },
    toggleSelected: (state, action: PayloadAction<string>) => {
      const selectedIds = state.selectedIds.includes(action.payload)
        ? state.selectedIds.filter((id) => id !== action.payload)
        : [...state.selectedIds, action.payload];
      const activeNodeId = selectedIds.at(-1) ?? null;

      state.selectedIds = selectedIds;
      state.activeNodeId = activeNodeId;
      state.focusedNodeId = activeNodeId;
      state.lastSelectedNodeId = activeNodeId;
      state.selectionBounds = null;
      state.selectionMode = resolveMode(selectedIds);
    },
    removeSelectedIds: (state, action: PayloadAction<string[]>) => {
      const removedIds = new Set(action.payload);
      const selectedIds = state.selectedIds.filter((id) => !removedIds.has(id));
      const activeNodeId =
        state.activeNodeId && selectedIds.includes(state.activeNodeId)
          ? state.activeNodeId
          : selectedIds.at(-1) ?? null;

      state.selectedIds = selectedIds;
      state.activeNodeId = activeNodeId;
      state.focusedNodeId =
        state.focusedNodeId && !removedIds.has(state.focusedNodeId)
          ? state.focusedNodeId
          : activeNodeId;
      state.lastSelectedNodeId =
        state.lastSelectedNodeId && !removedIds.has(state.lastSelectedNodeId)
          ? state.lastSelectedNodeId
          : activeNodeId;
      state.selectionBounds = null;
      state.selectionMode = resolveMode(selectedIds);
    },
    clearSelection: (state) => {
      state.activeNodeId = null;
      state.selectedIds = [];
      state.focusedNodeId = null;
      state.selectionBounds = null;
      state.selectionMode = "none";
      state.lastSelectedNodeId = null;
    },
    setHoveredId: (state, action: PayloadAction<string | null>) => {
      state.hoveredId = action.payload;
    },
    setFocusedNodeId: (state, action: PayloadAction<string | null>) => {
      state.focusedNodeId = action.payload;
    },
    setSelectionBounds: (
      state,
      action: PayloadAction<SelectionBounds | null>,
    ) => {
      state.selectionBounds = action.payload;
    },
    setSelectionMode: (state, action: PayloadAction<SelectionMode>) => {
      state.selectionMode = action.payload;
    },
  },
});

export const {
  applySelection,
  clearSelection,
  removeSelectedIds,
  selectOne,
  setFocusedNodeId,
  setHoveredId,
  setSelection,
  setSelectionBounds,
  setSelectionMode,
  toggleSelected,
} = selectionSlice.actions;
export const selectionReducer = selectionSlice.reducer;
