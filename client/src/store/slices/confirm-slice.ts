import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  description: string;
}

const initialState: ConfirmState = {
  isOpen: false,
  title: "",
  description: "",
};

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    openConfirm: (
      state,
      action: PayloadAction<{ title: string; description: string }>
    ) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.description = action.payload.description;
    },
    closeConfirm: (state) => {
      state.isOpen = false;
      state.title = "";
      state.description = "";
    },
  },
});

export const { openConfirm, closeConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;
