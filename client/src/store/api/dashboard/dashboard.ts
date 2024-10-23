import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DashboardUsers } from "@/types";

const baseURL = import.meta.env.VITE_API_URL;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseURL, credentials: "include" }),
  endpoints: (builder) => ({
    getDashboardUsers: builder.query<
      DashboardUsers[],
      {
        start?: string;
        end?: string;
      }
    >({
      query: ({ start, end }) => {
        let url = "/api/dashboard/users?";
        if (start) url += `start=${start}`;
        if (end) url += `&end=${end}`;
        return url;
      },
    }),
    getDashboardChats: builder.query<
      DashboardUsers[],
      {
        start?: string;
        end?: string;
      }
    >({
      query: ({ start, end }) => {
        let url = "/api/dashboard/get/chats?";
        if (start) url += `start=${start}`;
        if (end) url += `&end=${end}`;
        return url;
      },
    }),
    getDashboardRooms: builder.query<
      DashboardUsers[],
      {
        start?: string;
        end?: string;
      }
    >({
      query: ({ start, end }) => {
        let url = "/api/dashboard/get/rooms?";
        if (start) url += `start=${start}`;
        if (end) url += `&end=${end}`;
        return url;
      },
    }),
  }),
});

export const {
  useGetDashboardUsersQuery,
  useGetDashboardChatsQuery,
  useGetDashboardRoomsQuery,
} = dashboardApi;
