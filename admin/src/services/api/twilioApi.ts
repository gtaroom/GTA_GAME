import { baseUserApi } from "./baseUserApi";

// Types
export interface UserSegments {
  totalUsers: number;
  smsOptIn: number;
  activeSmsUsers: number;
  inactiveSmsUsers: number;
  vipSmsUsers: number;
}

export interface SendIndividualSmsRequest {
  to: string;
  message: string;
}

export interface SendBulkSmsRequest {
  segment: string; // 'all', 'active', 'inactive', 'vip'
  message: string;
}

export interface SmsHistory {
  id: string;
  type: "individual" | "bulk";
  to?: string;
  recipientCount?: number;
  message: string;
  status: "delivered" | "failed" | "pending";
  sentAt: string;
}

export const twilioApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user segments from database
    getUserSegments: builder.query<UserSegments, void>({
      query: () => "/sms-marketing/segments",
      transformResponse: (response: { data: UserSegments }) => response.data,
      providesTags: ["TwilioSegments"],
    }),

    // Send individual SMS
    sendIndividualSms: builder.mutation<
      { message: string },
      SendIndividualSmsRequest
    >({
      query: (body) => ({
        url: "/sms-marketing/send-individual",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TwilioHistory"],
    }),

    // Send bulk SMS
    sendBulkSms: builder.mutation<
      { message: string; recipientCount: number },
      SendBulkSmsRequest
    >({
      query: (body) => ({
        url: "/sms-marketing/send-bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TwilioHistory"],
    }),

    // Get SMS history
    getSmsHistory: builder.query<SmsHistory[], void>({
      query: () => "/sms-marketing/history",
      transformResponse: (response: { data: SmsHistory[] }) => response.data,
      providesTags: ["TwilioHistory"],
    }),
  }),
});

export const {
  useGetUserSegmentsQuery,
  useSendIndividualSmsMutation,
  useSendBulkSmsMutation,
  useGetSmsHistoryQuery,
} = twilioApi;
