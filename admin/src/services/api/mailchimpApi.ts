import { baseUserApi } from "./baseUserApi";

// Types
export interface UserSegments {
  totalUsers: number;
  emailOptIn: number;
  smsOptIn: number;
  activeUsers: number;
  inactiveUsers: number;
  vipUsers: number;
}

export interface SendIndividualEmailRequest {
  to: string;
  subject: string;
  message: string;
}

export interface SendEmailCampaignRequest {
  subject: string;
  segment: string; // 'all', 'active', 'inactive', 'vip'
  htmlContent: string;
}

export interface EmailHistory {
  id: string;
  type: "individual" | "campaign";
  subject: string;
  recipientCount?: number;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

export const mailchimpApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user segments from database
    getUserSegments: builder.query<UserSegments, void>({
      query: () => "/email-marketing/segments",
      transformResponse: (response: { data: UserSegments }) => response.data,
      providesTags: ["MailchimpSegments"],
    }),

    // Send individual email
    sendIndividualEmail: builder.mutation<
      { message: string },
      SendIndividualEmailRequest
    >({
      query: (body) => ({
        url: "/email-marketing/send-individual",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MailchimpHistory"],
    }),

    // Send email campaign
    sendEmailCampaign: builder.mutation<
      { message: string; recipientCount: number },
      SendEmailCampaignRequest
    >({
      query: (body) => ({
        url: "/email-marketing/send-campaign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MailchimpHistory"],
    }),

    // Get email history
    getEmailHistory: builder.query<EmailHistory[], void>({
      query: () => "/email-marketing/history",
      transformResponse: (response: { data: EmailHistory[] }) => response.data,
      providesTags: ["MailchimpHistory"],
    }),
  }),
});

export const {
  useGetUserSegmentsQuery,
  useSendIndividualEmailMutation,
  useSendEmailCampaignMutation,
  useGetEmailHistoryQuery,
} = mailchimpApi;
