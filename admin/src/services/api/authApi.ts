import { IUser } from "../../types";
import { baseUserApi } from "./baseUserApi";

export const authApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDetails: builder.query<IUser, void>({
      query: () => "/user",
      transformResponse: (response: { data: IUser }) => response.data,
      providesTags: ["User"],
    }),
  }),
});

export const {useGetUserDetailsQuery } = authApi;
