import { IUser, IUserBonus } from "../../types";
import { baseUserApi } from "./baseUserApi";

interface Pagination{
    page:number;
    limit:number;
    totalPages:number;
    totalUsers:number
}

interface AllUsersResponse{
    pagination:Pagination;
    users:IUser[]
}

interface AllBonusUsersResponse{
    pagination:Pagination;
    users:IUserBonus[]
}
export const usersApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // getAllUsers: builder.query<AllUsersResponse, { page: number; limit: number,search:string,filter:string }>({
    //   query: ({ page, limit,search, filter }) => `/user/all?page=${page}&limit=${limit}&search=${search}&filter=${filter}`,
    //   transformResponse: (response: { data: AllUsersResponse }) => response.data,
    //   providesTags: ["Data"],
    // }),
    getUsersBonus: builder.query<AllBonusUsersResponse, {page:number, limit:number,search:string,field:string,direction:string}>({
      query: ({ page, limit,search,field,direction }) => `/user/balances?page=${page}&limit=${limit}&search=${search}&field=${field}&direction=${direction}`,
      transformResponse: (response: { data: AllBonusUsersResponse }) => response.data,
      providesTags: ["Balance"],
    }),
    updateUserBonus: builder.mutation<IUserBonus, Partial<IUserBonus>>({
        query: (user) => ({
          url: `/user/update-balance/${user?.userId?._id ?? ''}`,
          method: "PUT",
          body: {...user},
        }),
        invalidatesTags: ["Balance"],
      }),

  }),
});

export const { useGetUsersBonusQuery,useUpdateUserBonusMutation } = usersApi;
