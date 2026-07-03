import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BuilderHistoryEntry } from "@/features/builder/history";

type HistoryState = {
  past: BuilderHistoryEntry[];
  future: BuilderHistoryEntry[];
};

const initialState: HistoryState = {
  past: [],
  future: [],
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    pushHistory: (state, action: PayloadAction<BuilderHistoryEntry>) => ({
      past: [...state.past, action.payload],
      future: [],
    }),
    undoHistory: (state) => {
      const entry = state.past.at(-1);

      if (!entry) {
        return state;
      }

      return {
        past: state.past.slice(0, -1),
        future: [entry, ...state.future],
      };
    },
    redoHistory: (state) => {
      const [entry, ...future] = state.future;

      if (!entry) {
        return state;
      }

      return {
        past: [...state.past, entry],
        future,
      };
    },
    resetHistory: () => initialState,
  },
});

export const { pushHistory, redoHistory, resetHistory, undoHistory } =
  historySlice.actions;
export const historyReducer = historySlice.reducer;
