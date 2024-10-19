import { ChatMessage } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface GETHistory {
  otherUserId: string;
}

interface ChatHistoryResponse {
  success: boolean;
  data: ChatMessage[];
}

const baseURL = import.meta.env.VITE_API_URL;

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseURL, credentials: "include" }),
  endpoints: (builder) => ({
    getChatHistory: builder.query<ChatHistoryResponse, GETHistory>({
      query: ({ otherUserId }) => `/api/chat/history/${otherUserId}`,
    }),
    sendMessage: builder.mutation<void, Partial<ChatMessage>>({
      query: (messageData) => ({
        url: "/api/chat/send",
        method: "POST",
        body: messageData,
      }),
    }),
  }),
});

export const { useGetChatHistoryQuery, useSendMessageMutation } = chatApi;
