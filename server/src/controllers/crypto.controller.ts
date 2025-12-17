import { Request, Response } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';
import { PaymentGatewayFactory } from '../services/payment/gateway.factory';
import { logger } from '../utils/logger';
import { getUserFromRequest } from '../utils/get-user';
import crypto from 'crypto';
import WalletModel from '../models/wallet.model';
import TransactionModel from '../models/transaction.model';
import { NowPaymentsGateway } from '../services/payment/nowpayments.gateway';

// Get available cryptocurrencies
export const getAvailableCurrencies = asyncHandler(async (req: Request, res: Response) => {
  try {
    const gateway = PaymentGatewayFactory.getGateway('nowpayments') as NowPaymentsGateway;
    const result = await gateway.getAvailableCurrencies();

    if (!result.success) {
      throw new ApiError(500, result.error || 'Failed to fetch available currencies');
    }

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        currencies: result.data.currencies
      }, "Available cryptocurrencies retrieved successfully")
    );
  } catch (error: any) {
    logger.error('Error fetching available cryptocurrencies:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to fetch available currencies');
  }
});

// Get minimum payment amount
export const getMinimumPaymentAmount = asyncHandler(async (req: Request, res: Response) => {
  const { currency_from, currency_to } = req.body;

  if (!currency_from || !currency_to) {
    throw new ApiError(400, 'Both currency_from and currency_to are required');
  }

  try {
    const gateway = PaymentGatewayFactory.getGateway('nowpayments') as NowPaymentsGateway;
    const result = await gateway.getMinimumPaymentAmount(currency_from, currency_to);

    if (!result.success) {
      throw new ApiError(500, result.error || 'Failed to fetch minimum payment amount');
    }

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        min_amount: result.data.min_amount
      }, "Minimum payment amount retrieved successfully")
    );
  } catch (error: any) {
    logger.error('Error fetching minimum payment amount:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to fetch minimum payment amount');
  }
});

// Get price estimate
export const getPriceEstimate = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency_from, currency_to } = req.body;

  if (!amount || !currency_from || !currency_to) {
    throw new ApiError(400, 'Amount, currency_from, and currency_to are required');
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new ApiError(400, 'Amount must be a positive number');
  }

  try {
    const gateway = PaymentGatewayFactory.getGateway('nowpayments') as NowPaymentsGateway;
    const result = await gateway.getEstimatedAmount(Number(amount), currency_from, currency_to);

    if (!result.success) {
      throw new ApiError(500, result.error || 'Failed to fetch price estimate');
    }

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        estimated_amount: result.data.estimated_amount
      }, "Price estimate retrieved successfully")
    );
  } catch (error: any) {
    logger.error('Error fetching price estimate:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to fetch price estimate');
  }
});

// Create payment
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { 
    price_amount, 
    price_currency = 'usd', 
    pay_currency,
    order_id,
    order_description
  } = req.body;
  
  const { _id: userId } = getUserFromRequest(req);

  if (!price_amount || !pay_currency) {
    throw new ApiError(400, 'Price amount and pay currency are required');
  }

  if (isNaN(Number(price_amount)) || Number(price_amount) <= 0) {
    throw new ApiError(400, 'Price amount must be a positive number');
  }

  try {
    // Find or create wallet for user
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      logger.info(`Creating new wallet for user ${userId} during crypto payment flow`);
      wallet = await WalletModel.create({
        userId,
        balance: 0,
      });
    }

    // Use the provided order_id or generate a new one if not provided
    const orderId = order_id || crypto.randomBytes(16).toString('hex');
    
    // Get gateway instance
    const gateway = PaymentGatewayFactory.getGateway('nowpayments') as NowPaymentsGateway;
    
    // Create invoice with the format from the frontend
    const result = await gateway.createInvoice({
      amount: Number(price_amount),
      currency: price_currency,
      pay_currency,
      order_id: orderId,
      order_description,
      successUrl: `${process.env.CLIENT_URL}/wallet/success`,
      failureUrl: `${process.env.CLIENT_URL}/wallet/failure`,
      callbackUrl: `${process.env.WEBHOOK_CALLBACK_URL}/nowpayments`,
    });

    if (!result.success) {
      throw new ApiError(500, result.error || 'Failed to create payment');
    }

    // Create transaction record
    const transaction = await TransactionModel.create({
      userId,
      walletId: wallet._id,
      type: 'deposit',
      amount: Number(price_amount),
      currency: price_currency,
      status: 'pending',
      paymentGateway: 'nowpayments',
      gatewayInvoiceId: orderId,
      gatewayTransactionId: result.data.payment_id || result.data.id,
      metadata: {
        ...result.data,
        order_description
      },
    });
    
    logger.info(`Crypto payment transaction created: ${transaction._id} for user ${userId}, amount=${price_amount}, currency=${pay_currency}`);

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        payment_id: result.data.payment_id || result.data.id,
        payment_status: result.data.payment_status || 'waiting',
        pay_address: result.data.pay_address,
        pay_amount: result.data.pay_amount,
        pay_currency: result.data.pay_currency || pay_currency,
        price_amount: Number(price_amount),
        price_currency,
        created_at: result.data.created_at || new Date().toISOString(),
        updated_at: result.data.updated_at || new Date().toISOString(),
        purchase_id: result.data.purchase_id || transaction._id.toString(),
        order_id: orderId,
        order_description,
        invoice_url: result.data.invoice_url
      }, "Crypto payment created successfully")
    );
  } catch (error: any) {
    logger.error('Error creating crypto payment:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to create crypto payment');
  }
});

// Check payment status
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    throw new ApiError(400, 'Payment ID is required');
  }

  try {
    const gateway = PaymentGatewayFactory.getGateway('nowpayments') as NowPaymentsGateway;
    const result = await gateway.getTransactionStatus(payment_id);

    if (!result.success) {
      throw new ApiError(500, result.error || 'Failed to check payment status');
    }

    // Find transaction in database
    const transaction = await TransactionModel.findOne({
      paymentGateway: 'nowpayments',
      gatewayTransactionId: payment_id
    });

    if (!transaction) {
      logger.warn(`Transaction not found for payment ID ${payment_id}`);
    } else {
      // Return combined data from API and our database
      return res.status(200).json(
        new ApiResponse(200, {
          success: true,
          payment_id: result.data.payment_id,
          payment_status: result.data.payment_status,
          pay_address: result.data.pay_address,
          pay_amount: result.data.pay_amount,
          pay_currency: result.data.pay_currency,
          price_amount: result.data.price_amount,
          price_currency: result.data.price_currency,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          purchase_id: result.data.purchase_id || transaction._id.toString(),
          order_id: result.data.order_id,
          order_description: transaction.metadata?.order_description || 'Payment',
          transaction_status: transaction.status
        }, "Payment status retrieved successfully")
      );
    }

    // Return API data only if no transaction found
    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        ...result.data
      }, "Payment status retrieved successfully")
    );
  } catch (error: any) {
    logger.error('Error checking payment status:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to check payment status');
  }
});
