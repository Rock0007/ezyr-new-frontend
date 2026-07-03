import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SelectionState = {
  selectedIds: string[];
  hoveredId: string | null;
};

const initialState: SelectionState = {
  selectedIds: [],
  hoveredId: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectOne: (state, action: PayloadAction<string>) => {
      state.selectedIds = [action.payload];
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    setHoveredId: (state, action: PayloadAction<string | null>) => {
      state.hoveredId = action.payload;
    },
  },
});

export const { selectOne, clearSelection, setHoveredId } =
  selectionSlice.actions;
export const selectionReducer = selectionSlice.reducer;
