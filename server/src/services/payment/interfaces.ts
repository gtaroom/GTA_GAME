export interface PaymentGatewayConfig {
  apiKey: string;
  secret?: string;
  returnUrl?: string;
  environment?: 'sandbox' | 'production';
}

export interface CreateInvoiceParams {
  amount: number;
  currency: string;
  orderId?: string;
  order_id?: string;
  pay_currency?: string;
  order_description?: string;
  successUrl?: string;
  failureUrl?: string;
  callbackUrl?: string;
}

export interface CreateWithdrawalParams {
  amount: number;
  currency: string;
  address: string;
  orderId: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  data: any;
  error?: string;
}

export interface IPaymentGateway {
  createInvoice(params: CreateInvoiceParams): Promise<PaymentGatewayResponse>;
  createWithdrawal(params: CreateWithdrawalParams): Promise<PaymentGatewayResponse>;
  getTransactionStatus(transactionId: string): Promise<PaymentGatewayResponse>;
  getBalance(currency: string): Promise<PaymentGatewayResponse>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
} 

export interface SoapPaymentGateway {
  processDeposit(amount: number, userId: string, productId: string,returnUrl?:string): Promise<any>;
  processWithdrawal(amount: number, userId: string): Promise<any>;
  verifyWebhook(payload: any, signature: string): boolean;
  handleWebhook(event: any): Promise<void>;
}