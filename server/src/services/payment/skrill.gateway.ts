import axios from 'axios';
import { ApiError } from '../../utils/api-error';
import { IPaymentGateway, PaymentGatewayConfig, CreateInvoiceParams, CreateWithdrawalParams, PaymentGatewayResponse } from './interfaces';
import crypto from 'crypto';

export class SkrillGateway implements IPaymentGateway {
  private apiKey: string;
  private secret: string;
  private baseUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.apiKey = config.apiKey;
    this.secret = config.secret!;
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://api.skrill.com/v1'
      : 'https://api.skrill.com/v1';
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          amount: params.amount,
          currency: params.currency,
          order_id: params.orderId,
          success_url: params.successUrl,
          failure_url: params.failureUrl,
          webhook_url: params.callbackUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to create Skrill payment"
      );
    }
  }

  async createWithdrawal(params: CreateWithdrawalParams): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payouts`,
        {
          amount: params.amount,
          currency: params.currency,
          order_id: params.orderId,
          recipient: {
            email: params.address, // For Skrill, the address is the email
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to create Skrill withdrawal"
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to get Skrill transaction status"
      );
    }
  }

  async getBalance(currency: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/balance`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to get Skrill balance"
      );
    }
  }

  async verifyWebhook(payload: any, signature: string): Promise<boolean> {  
    const hmac = crypto.createHmac('sha256', this.secret);
    const calculatedSignature = hmac
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return calculatedSignature === signature;
  }
} 