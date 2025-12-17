// import express from 'express';
// import { verifyJWT } from '../middlewares/auth-middleware';
// import {
//   addPaymentMethod,
//   getPaymentMethods,
//   updatePaymentMethod,
//   deletePaymentMethod,
//   setDefaultPaymentMethod,
// } from '../controllers/payment-method.controller';

// const paymentMethodRouter = express.Router();

// // All routes require authentication
// paymentMethodRouter.use(verifyJWT);

// // Get all payment methods
// paymentMethodRouter.get('/', getPaymentMethods);

// // Add new payment method
// paymentMethodRouter.post('/', addPaymentMethod);

// // Update payment method
// paymentMethodRouter.patch('/:id', updatePaymentMethod);

// // Delete payment method
// paymentMethodRouter.delete('/:id', deletePaymentMethod);

// // Set default payment method
// paymentMethodRouter.post('/:id/default', setDefaultPaymentMethod);

// export default paymentMethodRouter; 