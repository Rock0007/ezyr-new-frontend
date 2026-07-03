import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProjectSummary } from "@/types/project";

type ProjectState = {
  activeProject: ProjectSummary;
  isDirty: boolean;
};

const initialState: ProjectState = {
  activeProject: {
    id: "ezyr-demo-project",
    name: "Untitled Ezyr App",
    status: "draft",
    updatedAt: new Date(0).toISOString(),
  },
  isDirty: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    renameProject: (state, action: PayloadAction<string>) => {
      state.activeProject.name = action.payload;
      state.isDirty = true;
    },
    markSaved: (state) => {
      state.isDirty = false;
    },
  },
});

export const { renameProject, markSaved } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;
