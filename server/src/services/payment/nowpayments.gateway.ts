import axios from 'axios';
import crypto from 'crypto';
import { 
  IPaymentGateway, 
  PaymentGatewayConfig, 
  CreateInvoiceParams, 
  PaymentGatewayResponse,
  CreateWithdrawalParams
} from './interfaces';
import { logger } from '../../utils/logger';

export class NowPaymentsGateway implements IPaymentGateway {
  private readonly apiKey: string;
  // private readonly ipnSecret: string;
  private readonly baseUrl: string;
  // private readonly ipnCallbackUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.apiKey = config.apiKey;
    // this.ipnSecret = config.secret || '';
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://api-sandbox.nowpayments.io/v1' 
      : 'https://api.nowpayments.io/v1';
    // this.ipnCallbackUrl = config.returnUrl || '';
  }

  private async makeRequest(
    method: 'get' | 'post',
    endpoint: string,
    data?: any
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      logger.debug(`Making ${method} request to NowPayments: ${url}`, { data });
      
      const response = method === 'get'
        ? await axios.get(url, { headers })
        : await axios.post(url, data, { headers });
      
      return response.data;
    } catch (error: any) {
      logger.error('NowPayments API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PaymentGatewayResponse> {
    try {
      // Prepare the payload for NowPayments API
      const payload: any = {
        price_amount: params.amount,
        price_currency: params.currency,
        pay_currency: params.pay_currency || params.currency, // Use pay_currency if provided
        order_id: params.order_id || params.orderId, // Use order_id if provided
        order_description: params.order_description || `Payment for order ${params.orderId || params.order_id}`
      };

      // Only add these optional fields if provided
    //   if (params.callbackUrl || this.ipnCallbackUrl) {
    //     payload.ipn_callback_url = params.callbackUrl || this.ipnCallbackUrl;
    //   }
      
    //   if (params.successUrl) {
    //     payload.success_url = params.successUrl;
    //   }
      
    //   if (params.failureUrl) {
    //     payload.cancel_url = params.failureUrl;
    //   }

      logger.debug('Creating NowPayments invoice with payload:', payload);
      const response = await this.makeRequest('post', '/payment', payload);
      
      return {
        success: true,
        data: {
          ...response,
          invoice_url: response.invoice_url || response.payment_url
        }
      };
    } catch (error: any) {
      logger.error('Error creating NowPayments invoice:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to create invoice'
      };
    }
  }

  async createWithdrawal(params: CreateWithdrawalParams): Promise<PaymentGatewayResponse> {
    try {
      const payload = {
        currency: params.currency,
        address: params.address,
        amount: params.amount,
        // ipn_callback_url: this.ipnCallbackUrl,
        external_id: params.orderId
      };

      const response = await this.makeRequest('post', '/withdrawal', payload);
      
      return {
        success: true,
        data: {
          ...response,
          withdrawal_url: response.payment_url || '',
          id: response.id || response.withdrawal_id
        }
      };
    } catch (error: any) {
      logger.error('Error creating NowPayments withdrawal:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to create withdrawal'
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.makeRequest('get', `/payment/${transactionId}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      logger.error(`Error getting NowPayments transaction status for ${transactionId}:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get transaction status'
      };
    }
  }

  async getBalance(currency: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.makeRequest('get', '/balance');
      const currencyBalance = response.currencies.find((c: any) => c.currency.toLowerCase() === currency.toLowerCase());
      
      return {
        success: true,
        data: currencyBalance || { available_balance: 0, currency }
      };
    } catch (error: any) {
      logger.error(`Error getting NowPayments balance for ${currency}:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get balance'
      };
    }
  }

  verifyWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      // NowPayments uses a different webhook verification process
      // They recommend comparing a hash of the payload with the ipn secret
      // const payloadString = JSON.stringify(payload);
      // const hmac = crypto
      //   .createHmac('sha512', this.ipnSecret)
      //   .update(payloadString)
      //   .digest('hex');
      
      // return Promise.resolve(hmac === signature);
      return Promise.resolve(true);
    } catch (error) {
      logger.error('Error verifying NowPayments webhook:', error);
      return Promise.resolve(false);
    }
  }

  // Additional methods for NowPayments-specific functionality

  async getAvailableCurrencies(): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.makeRequest('get', '/currencies');
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      logger.error('Error getting NowPayments available currencies:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get available currencies'
      };
    }
  }

  async getMinimumPaymentAmount(fromCurrency: string, toCurrency: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.makeRequest('get', `/min-amount?currency_from=${fromCurrency}&currency_to=${toCurrency}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      logger.error(`Error getting NowPayments minimum amount for ${fromCurrency}->${toCurrency}:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get minimum payment amount'
      };
    }
  }

  async getEstimatedAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.makeRequest('get', `/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      logger.error(`Error getting NowPayments estimate for ${amount} ${fromCurrency}->${toCurrency}:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to get estimated amount'
      };
    }
  }
} 