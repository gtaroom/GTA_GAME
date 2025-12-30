// Socket event names
export enum SocketEvents {
  // Connection/authentication events
  AUTHENTICATE = 'authenticate',
  DISCONNECT = 'disconnect',
  
  // Notification events
  RECHARGE_REQUEST = 'recharge_request',
  RECHARGE_STATUS_UPDATED = 'recharge_status_updated',
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  WITHDRAWAL_STATUS_UPDATED = 'withdrawal_status_updated',
  PAYMENT_RECEIVED = 'payment_received',
  GAME_ACCOUNT_REQUEST = 'game_account_request'
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
  type: 'withdrawal_request' | 'recharge_request';
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  gameName?: string;
  username?: string;
}

// Withdrawal status notification
export interface WithdrawalStatusNotification extends BaseNotification {
  type: 'withdrawal_status_updated' | 'recharge_status_updated';
  requestId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed' | 'refunded' | 'returned';
  amount: number;
  message: string;
  gameName?: string;
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

// Union type of all notification types
export type Notification = 
  | WithdrawalRequestNotification
  | WithdrawalStatusNotification
  | GameAccountRequestNotification
  | PaymentNotification; 