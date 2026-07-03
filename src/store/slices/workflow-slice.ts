import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type WorkflowState = {
  activeWorkflowId: string | null;
  isExecutionPanelOpen: boolean;
};

const initialState: WorkflowState = {
  activeWorkflowId: null,
  isExecutionPanelOpen: false,
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    setActiveWorkflowId: (state, action: PayloadAction<string | null>) => {
      state.activeWorkflowId = action.payload;
    },
    toggleExecutionPanel: (state) => {
      state.isExecutionPanelOpen = !state.isExecutionPanelOpen;
    },
  },
});

export const { setActiveWorkflowId, toggleExecutionPanel } =
  workflowSlice.actions;
export const workflowReducer = workflowSlice.reducer;
