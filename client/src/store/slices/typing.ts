import { createSlice } from "@reduxjs/toolkit";

interface TypingUser {
  userId: string;
  username: string;
}

interface TypingState {
  typingUsers: Record<string, TypingUser[]>; // Store as array of objects (userId and username)
}

const initialState: TypingState = {
  typingUsers: {},
};

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    startTyping: (state, action) => {
      const { roomId, userId, username } = action.payload;

      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }

      // Check if user already exists in the room's typing users
      const isUserAlreadyTyping = state.typingUsers[roomId].some(
        (user) => user.userId === userId
      );

      if (!isUserAlreadyTyping) {
        // Add userId and username
        state.typingUsers[roomId].push({ userId, username });
      }
    },
    stopTyping: (state, action) => {
      const { roomId, userId } = action.payload;

      if (state.typingUsers[roomId]) {
        // Remove the user from the array
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          (user) => user.userId !== userId
        );

        // If no users are left typing in this room, remove the room key
        if (state.typingUsers[roomId].length === 0) {
          delete state.typingUsers[roomId];
        }
      }
    },
  },
});

export const { startTyping, stopTyping } = typingSlice.actions;
export default typingSlice.reducer;
