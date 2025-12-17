import { IWithdrawalRequest } from '../models/withdrawal-request.model';

// Socket event names
export enum SocketEvents {
  // Connection/authentication events
  AUTHENTICATE = 'authenticate',
  DISCONNECT = 'disconnect',
  
  // Notification events
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  RECHARGE_REQUEST = 'recharge_request',
  WITHDRAWAL_STATUS_UPDATED = 'withdrawal_status_updated',
  RECHARGE_STATUS_UPDATED = 'recharge_status_updated',
  PAYMENT_RECEIVED = 'payment_received',
  DEPOSIT_SUCCESS = 'deposit_success',
  
  // Game account events
  GAME_ACCOUNT_REQUEST = 'game_account_request',
  GAME_ACCOUNT_APPROVED = 'game_account_approved',
  GAME_ACCOUNT_REJECTED = 'game_account_rejected',
}

// Base notification interface
export interface BaseNotification {
  id: string;        // Unique notification ID
  timestamp: Date;   // When the notification was created
  read: boolean;     // Whether the notification has been read
  type: string;      // Type of notification
}

// Withdrawal request notification
export interface WithdrawalRequestNotification extends BaseNotification {
  type: 'withdrawal_request';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  gameName?: string;
  username?: string;
}

// Recharge request notification
export interface RechargeRequestNotification extends BaseNotification {
  type: 'recharge_request';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  gameName: string;
  username?: string;
}

// Withdrawal status notification
export interface WithdrawalStatusNotification extends BaseNotification {
  type: 'withdrawal_status_updated';
  requestId: string;
  status: IWithdrawalRequest['status'];
  amount: number;
  message: string;
}

// Recharge status notification
export interface RechargeStatusNotification extends BaseNotification {
  type: 'recharge_status_updated';
  requestId: string;
  status: string;
  amount: number;
  message: string;
}

// Payment notification
export interface PaymentNotification extends BaseNotification {
  type: 'payment_received';
  transactionId: string;
  amount: number;
  currency: string;
  paymentGateway: string;
}

// Deposit success notification
export interface DepositSuccessNotification extends BaseNotification {
  type: 'deposit_success';
  transactionId: string;
  amount: number;
  coins: number;
  paymentGateway: string;
}

// Game account request notification
export interface GameAccountRequestNotification extends BaseNotification {
  type: 'game_account_request';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  gameName: string;
  gameId: string;
}

// Game account approved notification
export interface GameAccountApprovedNotification extends BaseNotification {
  type: 'game_account_approved';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  gameName: string;
  gameId: string;
  generatedUsername: string;
  generatedPassword: string;
}

// Game account rejected notification
export interface GameAccountRejectedNotification extends BaseNotification {
  type: 'game_account_rejected';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  gameName: string;
  gameId: string;
  adminNotes?: string;
}

// Union type of all notification types
export type Notification = 
  | WithdrawalRequestNotification
  | WithdrawalStatusNotification
  | RechargeRequestNotification
  | RechargeStatusNotification
  | PaymentNotification
  | DepositSuccessNotification
  | GameAccountRequestNotification
  | GameAccountApprovedNotification
  | GameAccountRejectedNotification; 