import { IUserEntry } from "../../types";
import { baseUserApi } from "./baseUserApi";

interface Pagination{
    page:number;
    limit:number;
    totalPages:number;
    totalEntires:number
}

interface AllUsersResponse{
    pagination:Pagination;
    users:IUserEntry[]
}

export const entriesApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsersEntry: builder.query<AllUsersResponse, { month: string}>({
      query: ({ month }) => `/entries?month=${month}`,
      transformResponse: (response: { data: AllUsersResponse }) => response.data,
      providesTags: ["Entries"],
    }),  
    updateWinner: builder.mutation<IUserEntry, Partial<IUserEntry>>({
          query: (user) => ({
            url: `/entries/winner/${user?._id ?? ''}`, 
            method: "PATCH"
          }),
          invalidatesTags: ["Entries"],
        }),
  }),
  
});

export const {  useGetAllUsersEntryQuery , useUpdateWinnerMutation} = entriesApi;
