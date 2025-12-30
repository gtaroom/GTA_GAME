import { baseUserApi } from "./baseUserApi";

interface RechargeUser {
 name: {
        first: string;
        middle: string;
        last: string;
      };
  _id: string;
  email: string;
}

export interface RechargeRequest {
  _id: string;
  userId: RechargeUser;
  gameName: string;
  username: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "failed";
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface RechargeResponse {
  rechargeRequests: RechargeRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RechargeQueryParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export const rechargeApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRechargeRequests: builder.query<RechargeResponse, RechargeQueryParams>({
      query: ({ page, limit, status, search }) => {
        // Create a URLSearchParams object for proper query string formatting
        const params = new URLSearchParams();
        
        // Add required parameters
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        // Add optional parameters only if they have values
        if (status && status.trim() !== '') {
          params.append('status', status);
        }
        
        if (search && search.trim() !== '') {
          params.append('search', search);
        }
        
        // Return the properly formatted URL
        return `/recharge-requests?${params.toString()}`;
      },
      transformResponse: (response: { data: RechargeResponse }) => response.data,
      providesTags: ["Recharges"],
    }),
    
    approveRechargeRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recharge-requests/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Recharges"],
    }),
    
    rejectRechargeRequest: builder.mutation<void, { id: string; adminComment: string }>({
      query: ({ id, adminComment }) => ({
        url: `/recharge-requests/${id}/reject`,
        method: "PATCH",
        body: { adminComment }
      }),
      invalidatesTags: ["Recharges"],
    }),
  }),
});

export const { 
  useGetAllRechargeRequestsQuery, 
  useApproveRechargeRequestMutation, 
  useRejectRechargeRequestMutation 
} = rechargeApi; 