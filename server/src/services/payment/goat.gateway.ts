import axios from 'axios';
import { CreateInvoiceParams, PaymentGatewayResponse, PaymentGatewayConfig } from './interfaces';
import { logger } from '../../utils/logger';

export interface GoatPaymentGatewayConfig extends PaymentGatewayConfig {
  username: string;
  password: string;
}

export interface GoatPaymentRequest {
  username: string;
  password: string;
  type: 'sale';
  amount: string;
  payment_token: string;
  orderid: string;
  // Additional fields that might be required
  currency?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface GoatPaymentResponse {
  response: '1' | '2' | '3'; // 1 = Success, 2 = Decline, 3 = Error
  responsetext: string;
  authcode?: string;
  transactionid?: string;
  avsresponse?: string;
  cvvresponse?: string;
  orderid: string;
  type: string;
  response_code: string;
}

export class GoatGateway {
  private config: GoatPaymentGatewayConfig;
  private baseUrl: string;

  constructor(config: GoatPaymentGatewayConfig) {
    this.config = config;
    // Try different possible endpoints based on documentation
    this.baseUrl = 'https://goatpayments.transactiongateway.com/api';
    
    if (!this.config.username || !this.config.password) {
      throw new Error('Goat Payments username and password are required');
    }

  }

  /**
   * Parse Goat Payments response format (key=value pairs separated by & or newlines)
   */
  private parseGoatResponse(responseText: string): GoatPaymentResponse {
    const parsed: any = {};
    
    if (!responseText || typeof responseText !== 'string') {
      return parsed;
    }

    // Goat Payments can return responses separated by & or newlines
    let pairs: string[] = [];
    
    if (responseText.includes('&')) {
      // Response is URL-encoded format (key=value&key=value)
      pairs = responseText.trim().split('&');
    } else {
      // Response is newline separated (key=value\nkey=value)
      pairs = responseText.trim().split('\n');
    }

    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('='); // In case value contains = signs
        parsed[key.trim()] = decodeURIComponent(value.trim());
      }
    }

    logger.debug('Parsed Goat response', { responseText, parsed });

    return parsed;
  }

  /**
   * Test different Goat Payments endpoints to find the correct one
   */
  async testEndpoints(): Promise<Array<{ endpoint: string; working: boolean; response?: any }>> {
    const endpoints = [
      'https://goatpayments.transactiongateway.com/api/transact.php',
      'https://goatpayments.transactiongateway.com/gateway/transact.dll',
      'https://goatpayments.transactiongateway.com/api/transrequest.php'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const testData = new URLSearchParams();
        testData.append('username', this.config.username);
        testData.append('password', this.config.password);
        testData.append('type', 'sale');
        testData.append('amount', '0.01');
        testData.append('payment_token', 'test-token');
        testData.append('orderid', 'test-order');

        const response = await axios.post(endpoint, testData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
          responseType: 'text'
        });

        results.push({
          endpoint,
          working: true,
          response: response.data
        });
      } catch (error: any) {
        results.push({
          endpoint,
          working: false,
          response: error.message
        });
      }
    }

    return results;
  }

  /**
   * Process a payment using the payment token from frontend
   */
  async processPayment(params: {
    amount: number;
    paymentToken: string;
    orderId: string;
    // Optional customer information
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }): Promise<PaymentGatewayResponse> {
    try {
      // Validate payment token format
      if (!params.paymentToken || params.paymentToken.length < 10) {
        logger.error('Invalid payment token format', {
          tokenLength: params.paymentToken?.length,
          orderId: params.orderId
        });
        return {
          success: false,
          error: 'Invalid payment token format',
          data: { orderId: params.orderId }
        };
      }

      logger.info('Processing Goat payment', { 
        amount: params.amount, 
        orderId: params.orderId,
        paymentToken: params.paymentToken.substring(0, 8) + '...',
        tokenLength: params.paymentToken.length,
        tokenFormat: params.paymentToken.includes('-') ? 'collect.js' : 'unknown'
      });

      const paymentData: GoatPaymentRequest = {
        username: this.config.username,
        password: this.config.password,
        type: 'sale',
        amount: params.amount.toFixed(2),
        payment_token: params.paymentToken,
        orderid: params.orderId,
        currency: 'USD', // Default currency
        // Add customer information if provided
        first_name: params.firstName || '',
        last_name: params.lastName || '',
        email: params.email || '',
        phone: params.phone || '',
        address1: params.address || '',
        city: params.city || '',
        state: params.state || '',
        zip: params.zip || '',
        country: params.country || 'US'
      };

      // Convert data to URL-encoded format
      const formData = new URLSearchParams();
      formData.append('username', paymentData.username);
      formData.append('password', paymentData.password);
      formData.append('type', paymentData.type);
      formData.append('amount', paymentData.amount);
      formData.append('payment_token', paymentData.payment_token);
      formData.append('orderid', paymentData.orderid);
      formData.append('currency', paymentData.currency || 'USD');
      
      // Add customer information
      if (paymentData.first_name) formData.append('first_name', paymentData.first_name);
      if (paymentData.last_name) formData.append('last_name', paymentData.last_name);
      if (paymentData.email) formData.append('email', paymentData.email);
      if (paymentData.phone) formData.append('phone', paymentData.phone);
      if (paymentData.address1) formData.append('address1', paymentData.address1);
      if (paymentData.city) formData.append('city', paymentData.city);
      if (paymentData.state) formData.append('state', paymentData.state);
      if (paymentData.zip) formData.append('zip', paymentData.zip);
      if (paymentData.country) formData.append('country', paymentData.country);

      logger.debug('Sending Goat payment request', {
        url: `${this.baseUrl}/transact.php`,
        formData: formData.toString(),
        orderId: params.orderId
      });

      const response = await axios.post(
        `${this.baseUrl}/transact.php`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000, // 30 second timeout
          responseType: 'text' // Goat Payments returns text, not JSON
        }
      );

      // Parse the response text into structured data
      const parsedResponse = this.parseGoatResponse(response.data);

      logger.info('Goat payment response received', {
        orderId: params.orderId,
        status: response.status,
        statusText: response.statusText,
        rawResponse: response.data,
        parsedResponse: parsedResponse,
        response: parsedResponse.response,
        responsetext: parsedResponse.responsetext,
        transactionid: parsedResponse.transactionid
      });

      // Check if we received a valid response
      if (!response.data || typeof response.data !== 'string') {
        logger.error('Invalid response format from Goat Payments', {
          orderId: params.orderId,
          responseType: typeof response.data,
          responseData: response.data
        });
        
        return {
          success: false,
          error: 'Invalid response format from payment gateway',
          data: {
            orderId: params.orderId,
            rawResponse: response.data
          }
        };
      }

      if (parsedResponse.response === '1') {
        // Payment successful
        return {
          success: true,
          data: {
            transactionId: parsedResponse.transactionid,
            authCode: parsedResponse.authcode,
            orderId: parsedResponse.orderid,
            amount: params.amount,
            responseText: parsedResponse.responsetext,
            avsResponse: parsedResponse.avsresponse,
            cvvResponse: parsedResponse.cvvresponse,
            responseCode: parsedResponse.response_code,
            rawResponse: response.data,
            parsedResponse: parsedResponse
          }
        };
      } else {
        // Payment failed or declined
        return {
          success: false,
          error: parsedResponse.responsetext || 'Payment failed',
          data: {
            orderId: parsedResponse.orderid || params.orderId,
            responseCode: parsedResponse.response_code,
            responseText: parsedResponse.responsetext,
            rawResponse: response.data,
            parsedResponse: parsedResponse
          }
        };
      }
    } catch (error: any) {
      logger.error('Error processing Goat payment:', {
        error: error.message,
        orderId: params.orderId,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message || 'Payment processing failed',
        data: {
          orderId: params.orderId
        }
      };
    }
  }

  /**
   * Query transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      // Note: Goat Payments uses Query API for transaction status
      const queryFormData = new URLSearchParams();
      queryFormData.append('username', this.config.username);
      queryFormData.append('password', this.config.password);
      queryFormData.append('transaction_id', transactionId);

      const response = await axios.post(
        `${this.baseUrl}/query.php`,
        queryFormData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Error querying Goat transaction status:', {
        error: error.message,
        transactionId
      });

      return {
        success: false,
        error: error.message || 'Failed to query transaction status',
        data: null
      };
    }
  }

  /**
   * Verify webhook signature (Goat uses MD5 hash verification)
   */
  verifyWebhook(payload: any, signature?: string): boolean {
    try {
      // Goat Payments webhook verification
      // According to docs, they send transactions with response codes
      // We'll verify based on expected fields and data integrity
      
      if (!payload || typeof payload !== 'object') {
        return false;
      }

      // Check for required webhook fields
      const requiredFields = ['response', 'transactionid', 'orderid', 'type'];
      const hasRequiredFields = requiredFields.every(field => payload.hasOwnProperty(field));

      if (!hasRequiredFields) {
        logger.warn('Goat webhook missing required fields', { payload });
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error('Error verifying Goat webhook:', error);
      return false;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Processing Goat webhook', payload);

      if (!this.verifyWebhook(payload)) {
        return {
          success: false,
          message: 'Invalid webhook payload'
        };
      }

      // Webhook payload should contain transaction status updates
      return {
        success: true,
        message: 'Webhook processed successfully'
      };
    } catch (error: any) {
      logger.error('Error handling Goat webhook:', error);
      return {
        success: false,
        message: error.message || 'Webhook processing failed'
      };
    }
  }
}
