import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SelectionState = {
  selectedIds: string[];
  hoveredId: string | null;
};

const initialState: SelectionState = {
  selectedIds: ["home-section"],
  hoveredId: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectOne: (state, action: PayloadAction<string>) => {
      state.selectedIds = [action.payload];
    },
    toggleSelected: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.includes(action.payload)
        ? state.selectedIds.filter((id) => id !== action.payload)
        : [...state.selectedIds, action.payload];
    },
    removeSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = state.selectedIds.filter(
        (id) => !action.payload.includes(id),
      );
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    setHoveredId: (state, action: PayloadAction<string | null>) => {
      state.hoveredId = action.payload;
    },
  },
});

export const {
  clearSelection,
  removeSelectedIds,
  selectOne,
  setHoveredId,
  toggleSelected,
} = selectionSlice.actions;
export const selectionReducer = selectionSlice.reducer;
