import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProjectSummary } from "@/types/project";

type ProjectState = {
  activeProject: ProjectSummary;
  isDirty: boolean;
};

const initialState: ProjectState = {
  activeProject: {
    id: "northstar-capital-os",
    name: "Northstar Capital OS",
    status: "draft",
    updatedAt: "2026-07-04T00:00:00.000Z",
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
