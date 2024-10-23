import { createSlice } from "@reduxjs/toolkit";

interface ModalState {
  isOpen: boolean;
  type: "contact" | "group";
}

const initialState: ModalState = {
  isOpen: false,
  type: "contact",
};

const openContactModalSlice = createSlice({
  name: "openContactModal",
  initialState,
  reducers: {
    openContactModal: (state) => {
      state.isOpen = true;
    },
    closeContactModal: (state) => {
      state.isOpen = false;
    },
    setModalType: (state, action: { payload: "contact" | "group" }) => {
      state.type = action.payload;
    },
  },
});

export const { openContactModal, closeContactModal, setModalType } =
  openContactModalSlice.actions;

export default openContactModalSlice.reducer;
