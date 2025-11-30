import { baseUserApi } from "./baseUserApi";

export interface AffiliateName {
  first: string;
  middle?: string;
  last: string;
}

export interface Affiliate {
  _id: string;
  email: string;
  name: AffiliateName;
  company?: string;
  phone?: string;
  website?: string;
  socialMedia?: Record<string, string>; // Dynamic keys like "instagram", "facebook", "twitter", etc.
  audienceSize?: string;
  promotionMethods?: string[];
  status: "pending" | "approved" | "rejected";
  affiliateCode?: string;
  commissionRate?: number;
  totalEarnings?: number;
  totalReferrals?: number;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface AffiliatesResponse {
  affiliates: Affiliate[];
  pagination: Pagination;
}

interface AffiliateQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  search?: string;
}

interface AffiliateStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalEarnings: number;
  totalReferrals: number;
}

interface ApproveAffiliatePayload {
  commissionRate?: number;
  notes?: string;
}

interface RejectAffiliatePayload {
  rejectionReason?: string;
  notes?: string;
}

interface UpdateAffiliatePayload {
  commissionRate?: number;
  notes?: string;
  status?: "pending" | "approved" | "rejected";
}

export const affiliatesApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all affiliate applications
    getAllAffiliates: builder.query<AffiliatesResponse, AffiliateQueryParams>({
      query: ({ page = 1, limit = 10, status, search }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (status) {
          params.append('status', status);
        }
        
        if (search && search.trim() !== '') {
          params.append('search', search.trim());
        }
        
        return `/admin/affiliates?${params.toString()}`;
      },
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: AffiliatesResponse;
        message: string;
      }) => response.data,
      providesTags: ["Affiliates"],
    }),

    // Get single affiliate application
    getAffiliateById: builder.query<Affiliate, string>({
      query: (id) => `/admin/affiliates/${id}`,
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: Affiliate;
        message: string;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: "Affiliates", id }],
    }),

    // Approve affiliate application
    approveAffiliate: builder.mutation<Affiliate, { id: string; payload?: ApproveAffiliatePayload }>({
      query: ({ id, payload }) => ({
        url: `/admin/affiliates/${id}/approve`,
        method: "POST",
        body: payload || {},
      }),
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: { affiliate: Affiliate };
        message: string;
      }) => response.data.affiliate,
      invalidatesTags: (result, error, { id }) => [
        { type: "Affiliates", id },
        "Affiliates",
        "AffiliateStatistics",
      ],
    }),

    // Reject affiliate application
    rejectAffiliate: builder.mutation<Affiliate, { id: string; payload?: RejectAffiliatePayload }>({
      query: ({ id, payload }) => ({
        url: `/admin/affiliates/${id}/reject`,
        method: "POST",
        body: payload || {},
      }),
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: { affiliate: Affiliate };
        message: string;
      }) => response.data.affiliate,
      invalidatesTags: (result, error, { id }) => [
        { type: "Affiliates", id },
        "Affiliates",
        "AffiliateStatistics",
      ],
    }),

    // Update affiliate details
    updateAffiliate: builder.mutation<Affiliate, { id: string; payload: UpdateAffiliatePayload }>({
      query: ({ id, payload }) => ({
        url: `/admin/affiliates/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: Affiliate;
        message: string;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Affiliates", id },
        "Affiliates",
        "AffiliateStatistics",
      ],
    }),

    // Get affiliate statistics
    getAffiliateStatistics: builder.query<AffiliateStatistics, void>({
      query: () => `/admin/affiliates/stats`,
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: AffiliateStatistics;
        message: string;
      }) => response.data,
      providesTags: ["AffiliateStatistics"],
    }),
  }),
});

export const {
  useGetAllAffiliatesQuery,
  useGetAffiliateByIdQuery,
  useApproveAffiliateMutation,
  useRejectAffiliateMutation,
  useUpdateAffiliateMutation,
  useGetAffiliateStatisticsQuery,
} = affiliatesApi;

