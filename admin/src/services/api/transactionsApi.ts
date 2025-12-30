import { baseUserApi } from "./baseUserApi";

export interface TransactionRecord {
  _id: string;
  userId: {
    _id: string;
    name: {
      first: string;
      middle: string;
      last: string;
    };
    email: string;
  };
  walletId: {
    _id: string;
    balance: number;
  };
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway?: 'plisio' | 'stripe' | 'paypal' | 'crypto' | 'soap' | 'nowpayments' | 'payouts';
  gatewayTransactionId?: string;
  gatewayInvoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: TransactionRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionsQueryParams {
  page: number;
  limit: number;
  type?: string;
}

export const transactionsApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionsResponse, TransactionsQueryParams>({
      query: ({ page, limit, type }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (type && type.trim() !== '') params.append('type', type);
        return `/wallet/transactions/admin?${params.toString()}`;
      },
      transformResponse: (response: { data: TransactionsResponse }) => response.data,
      providesTags: ["Transactions"],
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionsApi;

