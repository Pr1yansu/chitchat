import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Room, User } from "@/types";

interface ErrorResponse {
  message: string;
}

interface UserResponse {
  message: string;
  user?: User;
}

interface UsersResponse {
  message: string;
  users: User[];
}

export interface UserContactedUserResponse {
  sender: User;
  receiver: User;
  message: string;
  room: Room;
}

const baseUrl = `${import.meta.env.VITE_API_URL}/api/auth`;

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl, credentials: "include" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    createUser: builder.mutation<UserResponse, Partial<User>>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
    login: builder.mutation<UserResponse, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: "/login",
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
    logout: builder.mutation<UserResponse, void>({
      query: () => ({ url: "/logout", method: "POST" }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string }) => {
        return response;
      },
    }),
    getProfile: builder.query<UserResponse, void>({
      query: () => ({ url: "/profile" }),
    }),
    getAllUsers: builder.query<UsersResponse, void>({
      query: () => ({ url: "/all" }),
    }),
    addContact: builder.mutation<UserResponse, { contactId: string }>({
      query: ({ contactId }) => ({
        url: `/add/contact/${contactId}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
    getUserContactedUserById: builder.query<
      UserContactedUserResponse,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/contact/${userId}`,
      }),
    }),
    getUserByIds: builder.mutation<UsersResponse, { userIds: string[] }>({
      query: ({ userIds }) => ({
        url: "/users",
        method: "POST",
        body: { userIds },
      }),
    }),
    updateUser: builder.mutation<UserResponse, Partial<User>>({
      query: (body) => ({
        url: "/update",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
    changePassword: builder.mutation<
      UserResponse,
      { newPassword: string; confirmPassword: string; currentPassword: string }
    >({
      query: ({ confirmPassword, newPassword, currentPassword }) => ({
        url: "/password/change",
        method: "PUT",
        body: { confirmPassword, newPassword, currentPassword },
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
    banUser: builder.mutation<UserResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/ban/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["User"],
      transformErrorResponse: (response) => {
        const error = response.data as ErrorResponse;
        return error.message;
      },
      transformResponse: (response: { message: string; user?: User }) => {
        return response;
      },
    }),
  }),
});

export const {
  useCreateUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetAllUsersQuery,
  useAddContactMutation,
  useGetUserContactedUserByIdQuery,
  useGetUserByIdsMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useBanUserMutation,
} = userApi;
