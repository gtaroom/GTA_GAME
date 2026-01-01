import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut } from "../../redux/slices/AuthSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_APP_API_URL}/api/v1`,
  credentials: "include", // ✅ Automatically send cookies
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    try {
      await baseQuery(
        { url: "/user/refresh-token", method: "POST" },
        api,
        extraOptions
      );
      result = await baseQuery(args, api, extraOptions); // Retry request
    } catch (error) {
      api.dispatch(logOut()); // Logout user if refresh fails
    }
  }

  return result;
};

export const baseUserApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Data",
    "Balance",
    "Dashboard",
    "Entries",
    "Withdrawals",
    "Recharges",
    "Coupons",
    "GameAccounts",
    "Roles",
    "RolePermissions",
    "UserManagement",
    "UserStatistics",
    "RoleStatistics",
    "Transactions",
    "SystemHealth",
    "Affiliates",
    "AffiliateStatistics",
        "SpinWheelConfig",
    "SpinWheelValidation",
    "SpinWheelStats",
    "AffiliateWithdrawals",
    "AffiliateWithdrawalStats",
    "UserDetails",
    "Mailchimp",
    "MailchimpLists",
    "MailchimpSubscribers",
    "MailchimpCampaigns",
    "MailchimpSegments",
    "MailchimpHistory",
    "Twilio",
    "TwilioNumbers",
    "TwilioSms",
    "TwilioCalls",
    "TwilioSegments",
    "TwilioHistory",
    "LegalDocuments",
    "Banners",
  ],
  endpoints: () => ({}),
});
