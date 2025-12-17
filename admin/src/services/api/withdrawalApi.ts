import { baseUserApi } from "./baseUserApi";

interface WithdrawalUser {
  name: {
    first: string;
    middle: string;
    last: string;
  };
  _id: string;
  email: string;
}

export interface WithdrawalRequest {
  _id: string;
  userId: WithdrawalUser;
  amount: number;
  walletAddress?: string;
  walletCurrency?: string;
  gameName?:string;
  username?:string;
  paymentGateway: "soap" | "plisio" | "payouts";
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

interface WithdrawalResponse {
  withdrawalRequests: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WithdrawalQueryParams {
  page: number;
  limit: number;
  status?: string;
  paymentGateway?: string;
  email?: string;
}

export const withdrawalApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllWithdrawals: builder.query<WithdrawalResponse, WithdrawalQueryParams>({
      query: ({ page, limit, status, paymentGateway, email }) => {
        // Create a URLSearchParams object for proper query string formatting
        const params = new URLSearchParams();
        
        // Add required parameters
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        // Add optional parameters only if they have values
        if (status && status.trim() !== '') {
          params.append('status', status);
        }
        
        if (paymentGateway && paymentGateway.trim() !== '') {
          params.append('paymentGateway', paymentGateway);
        }
        
        if (email && email.trim() !== '') {
          params.append('email', email);
        }
        
        // Return the properly formatted URL
        return `/withdrawal-requests/admin/all?${params.toString()}`;
      },
      transformResponse: (response: { data: WithdrawalResponse }) => response.data,
      providesTags: ["Withdrawals"],
    }),
    
    approveWithdrawal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/withdrawal-requests/admin/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Withdrawals"],
    }),
    
    rejectWithdrawal: builder.mutation<void, { id: string; adminComment: string }>({
      query: ({ id, adminComment }) => ({
        url: `/withdrawal-requests/admin/${id}/reject`,
        method: "PATCH",
        body: { adminComment }
      }),
      invalidatesTags: ["Withdrawals"],
    }),
    
    markWithdrawalProcessed: builder.mutation<void, string>({
      query: (id) => ({
        url: `/withdrawal-requests/admin/${id}/mark-processed`,
        method: "PATCH",
      }),
      invalidatesTags: ["Withdrawals"],
    }),
  }),
});

export const { 
  useGetAllWithdrawalsQuery, 
  useApproveWithdrawalMutation, 
  useRejectWithdrawalMutation, 
  useMarkWithdrawalProcessedMutation 
} = withdrawalApi; 