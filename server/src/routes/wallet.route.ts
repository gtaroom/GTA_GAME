import express from 'express';
import {
  getWallet,
  createDeposit,
  createWithdrawal,
  getTransactions,
  handlePaymentWebhook,
  handleSoapWebhook,
  handleNowPaymentsWebhook,
  handleGoatWebhook,
  handleCentryOSWebhook,
  processGoatPayment,
  testGoatToken,
  testGoatEndpoints,
  testCentryOSIntegration,
  getDashboardTransactions
} from '../controllers/wallet.controller';
import upload from '../services/multer.service';
import { verifyJWT } from '../middlewares/auth-middleware';
import { canViewAllTransactions } from '../middlewares/permission-middleware';
import { rawBodyFromParsedMiddleware } from '../middlewares/raw-body.middleware';

const walletRouter = express.Router();

// Regular wallet routes
walletRouter.get('/balance', verifyJWT, getWallet);
walletRouter.post('/deposit', verifyJWT, createDeposit);
walletRouter.post('/withdraw', verifyJWT, createWithdrawal);
walletRouter.get('/transactions', verifyJWT, getTransactions);

// Goat Payments routes
walletRouter.post('/goat/process', verifyJWT, processGoatPayment);
walletRouter.post('/goat/test-token', verifyJWT, testGoatToken);
walletRouter.get('/goat/test-endpoints', verifyJWT, testGoatEndpoints);

// CentryOS test route
walletRouter.post('/centryos/test', verifyJWT, testCentryOSIntegration);

// Backward compatibility - redirect old route to new Goat route
walletRouter.post('/process', verifyJWT, processGoatPayment);

walletRouter.get('/transactions/admin', verifyJWT, canViewAllTransactions, getDashboardTransactions);

// Soap-specific routes
walletRouter.post('/webhook/soap', handleSoapWebhook);

// Nowpayments webhook - with signature verification but no JWT check
walletRouter.post('/webhook/nowpayments', handleNowPaymentsWebhook);

// Goat Payments webhook - no JWT check needed for webhooks
walletRouter.post('/webhook/goat', upload.none(), handleGoatWebhook);

// CentryOS webhook - no JWT check needed for webhooks, needs raw body for signature verification
walletRouter.post('/webhook/centryos', rawBodyFromParsedMiddleware, handleCentryOSWebhook);

// Other payment gateway webhooks
walletRouter.post('/webhook/:paymentGateway', upload.none(), handlePaymentWebhook);


export default walletRouter; 