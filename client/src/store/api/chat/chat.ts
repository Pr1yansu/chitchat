import { ChatMessage, Room } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface GETHistory {
  roomId?: string;
}

interface ChatHistoryResponse {
  success: boolean;
  data: ChatMessage[];
}

interface GroupRequest {
  name: string;
  description: string;
  avatar?: string;
  members?: string[];
  isGroup?: boolean;
}

interface GroupResponse {
  success: boolean;
  message: string;
}

export interface SingleGrpResponse {
  success: boolean;
  data: Room;
}

const baseURL = import.meta.env.VITE_API_URL;

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseURL, credentials: "include" }),
  endpoints: (builder) => ({
    getChatHistory: builder.query<ChatHistoryResponse, GETHistory>({
      query: ({ roomId }) => `/api/chat/history/${roomId}`,
    }),
    sendMessage: builder.mutation<void, Partial<ChatMessage>>({
      query: (messageData) => ({
        url: "/api/chat/send",
        method: "POST",
        body: messageData,
      }),
    }),
    createGroup: builder.mutation<GroupResponse, GroupRequest>({
      query: (roomData) => ({
        url: "/api/chat/room",
        method: "POST",
        body: roomData,
      }),
    }),
    getRoomById: builder.query<
      SingleGrpResponse,
      { roomId: string | undefined }
    >({
      query: ({ roomId }) => `/api/chat/room/${roomId}`,
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useCreateGroupMutation,
  useGetRoomByIdQuery,
} = chatApi;
