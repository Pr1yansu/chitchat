import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusState {
  onlineStatus: { userId: string; status: "online" | "offline" | "idle" }[];
}

const initialState: StatusState = {
  onlineStatus: [],
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setOnlineStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        onlineStatus: "online" | "offline" | "idle";
      }>
    ) => {
      const userIndex = state.onlineStatus.findIndex(
        (user) => user.userId === action.payload.userId
      );
      if (userIndex > -1) {
        // Update existing user status
        state.onlineStatus[userIndex].status = action.payload.onlineStatus;
      } else {
        // Add new user status
        state.onlineStatus.push({
          userId: action.payload.userId,
          status: action.payload.onlineStatus,
        });
      }
    },
  },
});

export const { setOnlineStatus } = statusSlice.actions;
export default statusSlice.reducer;
