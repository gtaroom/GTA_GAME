/**
 * Wallet API Models
 * 
 * This module defines TypeScript interfaces for wallet-related data structures
 * used in API requests and responses.
 */

/**
 * Base response interface for wallet operations
 */
export interface WalletResponse {
  success: boolean;
  message: string;
}

/**
 * Balance information from the API
 */
export interface BalanceResponse extends WalletResponse {
  data: {
    balance: number;
    currency: string;
    lastUpdated: string;
  };
}

/**
 * Transaction type enumeration
 */
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  BONUS = 'bonus',
  GAME_WIN = 'game_win',
  GAME_LOSS = 'game_loss',
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Transaction Models
 * Defines interfaces for transaction-related data structures
 */

/**
 * Transaction model representing a transaction in the system
 */
export interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'coupon';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  userId: string;
  gatewayInvoiceId: string;
  description?: string;
  paymentMethod?: string;
  metadata?: {
    [key: string]: any;
  };
  fee?: number;
}

/**
 * Transaction list response from the API
 */
export interface TransactionListResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}

/**
 * Transaction query parameters
 */
export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: 'deposit' | 'withdrawal' | undefined;
  status?: 'completed' | 'pending' | 'failed' | 'cancelled' | undefined;
  startDate?: string;
  endDate?: string;
}

/**
 * Deposit request payload
 */
export interface DepositRequest {
  amount: number;
  paymentGateway: string;
  currency?: string;
  productId?: string;
  returnUrl?: string;
  response?: any;
}

/**
 * Deposit response
 */
export interface DepositResponse extends WalletResponse {
  data: {
    invoiceUrl: string;
    invoiceId: string;
  };
}

/**
 * Withdrawal request payload
 */
export interface WithdrawalRequest {
  amount: number;
  paymentGateway: string;
  username?: string;
  gameName?: string;
  address?: string;
  currency?: string;
}

/**
 * Withdrawal response
 */
export interface WithdrawalResponse extends WalletResponse {
  data: {
    invoiceUrl: string;
    invoiceId: string;
  };
}

/**
 * Game recharge request payload
 */
export interface GameRechargeRequest {
  gameName: string;
  amount: number;
  username: string;
}

/**
 * Game recharge response
 */
export interface GameRechargeResponse extends WalletResponse {
  data: {
    requestId: string;
  };
}
