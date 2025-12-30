import { baseUserApi } from "./baseUserApi";

interface IPromotionalEmail {
    subject: string;
    content: string;
  }
export const emailManagement = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    sendPromotionalMails: builder.mutation<void,IPromotionalEmail >({
          query: (data) => ({
            url: `/user/notifications`,
            method: "POST",
            body: {...data},
          }),
        }),
})
});

export const {useSendPromotionalMailsMutation } = emailManagement;
