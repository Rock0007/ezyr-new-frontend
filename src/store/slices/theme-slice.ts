import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ThemeState = {
  colorMode: "light" | "dark" | "system";
  primaryColor: string;
  radius: number;
};

const initialState: ThemeState = {
  colorMode: "light",
  primaryColor: "#0f8ca8",
  radius: 6,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setColorMode: (state, action: PayloadAction<ThemeState["colorMode"]>) => {
      state.colorMode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
  },
});

export const { setColorMode, setPrimaryColor } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
