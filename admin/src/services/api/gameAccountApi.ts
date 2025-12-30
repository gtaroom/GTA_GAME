import { baseUserApi } from "./baseUserApi";

interface GameAccountUser {
  name: {
    first: string;
    middle: string;
    last: string;
  };
  _id: string;
  email: string;
}

interface GameInfo {
  _id: string;
  name: string;
}

export interface GameAccountRequest {
  _id: string;
  userId: GameAccountUser;
  gameId: GameInfo;
  gameName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  generatedUsername?: string;
  generatedPassword?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRequests: number;
}

interface GameAccountResponse {
  accountRequests: GameAccountRequest[];
  pagination: Pagination;
}

interface GameAccountQueryParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

interface ApproveRequestPayload {
  generatedUsername: string;
  generatedPassword: string;
  adminNotes?: string;
}

interface RejectRequestPayload {
  adminNotes: string;
}

export const gameAccountApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAccountRequests: builder.query<GameAccountResponse, GameAccountQueryParams>({
      query: ({ page, limit, status, search }) => {
        const params = new URLSearchParams();
        
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (status && status.trim() !== '') {
          params.append('status', status);
        }
        
        if (search && search.trim() !== '') {
          params.append('search', search);
        }
        
        return `/game-accounts/admin/requests?${params.toString()}`;
      },
      transformResponse: (response: { data: GameAccountResponse }) => response.data,
      providesTags: ["GameAccounts"],
    }),
    
    approveAccountRequest: builder.mutation<{ data: unknown }, { requestId: string; payload: ApproveRequestPayload }>({
      query: ({ requestId, payload }) => ({
        url: `/game-accounts/admin/approve/${requestId}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: ["GameAccounts"],
    }),
    
    rejectAccountRequest: builder.mutation<{ data: unknown }, { requestId: string; payload: RejectRequestPayload }>({
      query: ({ requestId, payload }) => ({
        url: `/game-accounts/admin/reject/${requestId}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: ["GameAccounts"],
    }),
  }),
});

export const { 
  useGetAllAccountRequestsQuery, 
  useApproveAccountRequestMutation, 
  useRejectAccountRequestMutation 
} = gameAccountApi; 