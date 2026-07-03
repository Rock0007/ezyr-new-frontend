import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/base-api";
import { builderReducer } from "@/store/slices/builder-slice";
import { historyReducer } from "@/store/slices/history-slice";
import { projectReducer } from "@/store/slices/project-slice";
import { selectionReducer } from "@/store/slices/selection-slice";
import { themeReducer } from "@/store/slices/theme-slice";
import { workflowReducer } from "@/store/slices/workflow-slice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    builder: builderReducer,
    selection: selectionReducer,
    project: projectReducer,
    history: historyReducer,
    theme: themeReducer,
    workflow: workflowReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
