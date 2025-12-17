import express from 'express';
import {
  createPayment,
  getAvailableCurrencies,
  getMinimumPaymentAmount,
  getPaymentStatus,
  getPriceEstimate
} from '../controllers/crypto.controller';
import { verifyJWT } from '../middlewares/auth-middleware';

const cryptoRouter = express.Router();

// Public endpoints (no authentication required)
cryptoRouter.get('/currencies', getAvailableCurrencies);

// Protected endpoints (authentication required)
cryptoRouter.post('/min-amount', verifyJWT, getMinimumPaymentAmount);
cryptoRouter.post('/estimate', verifyJWT, getPriceEstimate);
cryptoRouter.post('/create-payment', verifyJWT, createPayment);
cryptoRouter.post('/payment-status', verifyJWT, getPaymentStatus);

// Webhook - handled by wallet controller but with verification middleware
// The wallet controller already has a route for this in wallet.route.ts, 

export default cryptoRouter; 