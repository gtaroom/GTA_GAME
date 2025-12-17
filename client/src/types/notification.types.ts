/**
 * Notification Types
 * Defines all socket events and notification interfaces
 */

// Socket event names
export enum SocketEvents {
  // Connection/authentication events
  AUTHENTICATE = 'authenticate',
  DISCONNECT = 'disconnect',
  
  // Notification events (user-facing only)
  RECHARGE_STATUS_UPDATED = 'recharge_status_updated',
  WITHDRAWAL_STATUS_UPDATED = 'withdrawal_status_updated',
  PAYMENT_RECEIVED = 'payment_received',
  DEPOSIT_SUCCESS = 'deposit_success',
  
  // Game account events
  GAME_ACCOUNT_APPROVED = 'game_account_approved',
  GAME_ACCOUNT_REJECTED = 'game_account_rejected',
}

// Base notification interface
export interface BaseNotification {
  id: string;        // Unique notification ID
  _id?: string;      // MongoDB ID
  notificationId?: string; // Alternative ID field
  timestamp: Date;   // When the notification was created
  read: boolean;     // Whether the notification has been read
  type: string;      // Type of notification
  metadata?: any;    // Additional metadata
}

// Recharge/Withdrawal status notification
export interface RechargeStatusNotification extends BaseNotification {
  type: 'recharge_status_updated';
  requestId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed' | 'refunded' | 'returned';
  amount: number;
  message: string;
  gameName?: string;
}

export interface WithdrawalStatusNotification extends BaseNotification {
  type: 'withdrawal_status_updated';
  requestId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed' | 'refunded' | 'returned';
  amount: number;
  message: string;
  checkoutUrl?: string; // URL for completing the withdrawal process (when approved)
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
  amount: number;
  coins: number;
  transactionId?: string;
}

// Game account notification
export interface GameAccountApprovedNotification extends BaseNotification {
  type: 'game_account_approved';
  requestId: string;
  gameName: string;
  gameId: string;
  generatedUsername: string;
  generatedPassword: string;
}

export interface GameAccountRejectedNotification extends BaseNotification {
  type: 'game_account_rejected';
  requestId: string;
  gameName: string;
  gameId: string;
  adminNotes?: string;
}

// Union type of all notification types
export type Notification = 
  | RechargeStatusNotification
  | WithdrawalStatusNotification
  | PaymentNotification
  | DepositSuccessNotification
  | GameAccountApprovedNotification
  | GameAccountRejectedNotification;

// API Response types
export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  message?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification;
  message?: string;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}

