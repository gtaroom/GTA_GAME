import axios from 'axios';
import { ApiError } from '../../utils/api-error';
import { IPaymentGateway, PaymentGatewayConfig, CreateInvoiceParams, CreateWithdrawalParams, PaymentGatewayResponse } from './interfaces';
import crypto from 'crypto';

export class PlisioGateway implements IPaymentGateway {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://api.plisio.net/api/v1';
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PaymentGatewayResponse> {
    try {
      console.log(params,this.apiKey,"API KEY")
      const response = await axios.get(
        `${this.baseUrl}/invoices/new`,
        {
          params: {
            source_currency: 'USD', // Default to USD as source currency
            order_name:'Deposit',
            source_amount: params.amount,
            order_number: params.orderId,
            currency: params.currency,
            callback_url: params.callbackUrl,
            api_key: this.apiKey,
          }
        }
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.log(error)
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to create Plisio invoice"
      );
    }
  }

  async createWithdrawal(params: CreateWithdrawalParams): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/operations/withdraw`,
        { params:
          {
            amount: params.amount,
            currency: params.currency,
            to: params.address,
            api_key: this.apiKey,
          }
        },
      );
      console.log(response.data,"RESPONSE DATA")

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log(error,"ERROR")
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to create Plisio withdrawal"
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/${transactionId}`,
        {
          params: {
            api_key: this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to get Plisio transaction status"
      );
    }
  }

  async getBalance(currency: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/balance/${currency}`,
        {
          params: {
            api_key: this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to get Plisio balance"
      );
    }
  }

  async verifyWebhook(payload: any, signature: string): Promise<boolean> {
    const hmac = crypto.createHmac('sha256', this.apiKey);
    const calculatedSignature = hmac
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return calculatedSignature === signature;
  }
}
