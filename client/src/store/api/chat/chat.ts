import { ChatMessage, Room, User } from "@/types";
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

export interface MembersByIDsResponse {
  success: boolean;
  data: User[];
}

export interface ChangeStatusResponse {
  success: boolean;
  message: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

export interface AddMemberResponse {
  success: boolean;
  message: string;
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
    getMembersByIds: builder.query<
      MembersByIDsResponse,
      { members: string[] | undefined }
    >({
      query: ({ members }) => `/api/chat/members/${members}`,
    }),
    changeAdmin: builder.mutation<
      ChangeStatusResponse,
      { roomId: string; userId: string }
    >({
      query: ({ roomId, userId }) => ({
        url: `/api/chat/room/${roomId}/change-admin/${userId}`,
        method: "PUT",
      }),
    }),
    removeMember: builder.mutation<
      RemoveMemberResponse,
      { roomId: string; userId: string }
    >({
      query: ({ roomId, userId }) => ({
        url: `/api/chat/room/${roomId}/remove/${userId}`,
        method: "DELETE",
      }),
    }),
    addMember: builder.mutation<
      AddMemberResponse,
      { roomId: string; userIds: string[] }
    >({
      query: ({ roomId, userIds }) => ({
        url: `/api/chat/room/${roomId}/add`,
        method: "POST",
        body: { userIds },
      }),
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useCreateGroupMutation,
  useGetRoomByIdQuery,
  useGetMembersByIdsQuery,
  useChangeAdminMutation,
  useLazyGetRoomByIdQuery,
  useRemoveMemberMutation,
  useAddMemberMutation,
} = chatApi;
