import { Attachment } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  messageId: string;
  fromUserId: string;
  message: string;
  type: string;
  attachments?: Attachment[];
  timestamp: string;
  status: "sent" | "delivered" | "seen";
  username: string;
  avatar?: string;
  roomId: string;
}

interface ChatState {
  messages: ChatMessage[];
  typingUsers: string[];
}

const initialState: ChatState = {
  messages: [],
  typingUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        status: "sent" | "delivered" | "seen";
      }>
    ) => {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.messageId === action.payload.messageId
            ? { ...msg, status: action.payload.status }
            : msg
        ),
      };
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },

    clearMessages: () => {
      return initialState;
    },
  },
});

export const { addMessage, updateMessageStatus, clearMessages, setMessages } =
  chatSlice.actions;

export default chatSlice.reducer;
