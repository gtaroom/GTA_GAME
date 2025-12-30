import { baseUserApi } from './baseUserApi';
import { ICoupon, ICouponCreatePayload, ICouponListResponse, ICouponUpdatePayload } from '../../types';

export const couponsApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // List coupons
    getCoupons: builder.query<ICouponListResponse, { 
      page?: number; 
      limit?: number; 
      isActive?: boolean; 
      search?: string;
    }>({
      query: (params) => ({
        url: '/coupons/admin/list',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: ICouponListResponse }) => response.data,
      providesTags: ['Coupons'],
    }),

    // Get single coupon
    getCoupon: builder.query<{ data: ICoupon }, string>({
      query: (id) => `/coupons/admin/${id}`,
      transformResponse: (response: { data: { data: ICoupon } }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Coupons', id }],
    }),

    // Create coupon
    createCoupon: builder.mutation<{ data: ICoupon }, ICouponCreatePayload>({
      query: (body) => ({
        url: '/coupons/admin/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: { data: ICoupon } }) => response.data,
      invalidatesTags: ['Coupons'],
    }),

    // Update coupon
    updateCoupon: builder.mutation<{ data: ICoupon }, { id: string; data: ICouponUpdatePayload }>({
      query: ({ id, data }) => ({
        url: `/coupons/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: { data: { data: ICoupon } }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coupons', id },
        'Coupons',
      ],
    }),

    // Delete coupon
    deleteCoupon: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/coupons/admin/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { data: { message: string } }) => response.data,
      invalidatesTags: ['Coupons'],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;

export const couponsApiMiddleware = couponsApi.middleware; 