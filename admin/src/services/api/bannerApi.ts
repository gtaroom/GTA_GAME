import { baseUserApi } from "./baseUserApi";

export interface Banner {
  _id: string;
  uid: string;
  title: string;
  description: string;
  button: {
    text: string;
    href: string;
  };
  images: {
    background: string;
    main: string;
    cover?: string;
  };
  order: number;
  isActive: boolean;
}

export const bannerApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => "/banners",

      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && response.data) return response.data;
        return [];
      },
      providesTags: ["Banners"],
    }),

    createBanner: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/banners/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Banners"],
    }),

    updateBanner: builder.mutation<
      { message: string },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/banners/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banners"],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
