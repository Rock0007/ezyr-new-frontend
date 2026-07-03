import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type HistoryEntry = {
  id: string;
  label: string;
  createdAt: string;
};

type HistoryState = {
  past: HistoryEntry[];
  future: HistoryEntry[];
};

const initialState: HistoryState = {
  past: [],
  future: [],
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    pushHistory: (state, action: PayloadAction<HistoryEntry>) => {
      state.past.push(action.payload);
      state.future = [];
    },
    resetHistory: () => initialState,
  },
});

export const { pushHistory, resetHistory } = historySlice.actions;
export const historyReducer = historySlice.reducer;
