import { PaymentGatewayFactory } from './gateway.factory';

export const initializePaymentGateways = () => {
  // Initialize Plisio Gateway
  PaymentGatewayFactory.createGateway('plisio', {
    apiKey: process.env.PLISIO_API_KEY as string,
    environment: 'production'
  });

  PaymentGatewayFactory.createGateway('soap', {
    apiKey: process.env.SOAP_API_KEY as string,
    secret: process.env.SOAP_WEBHOOK_SECRET as string,
    environment: 'production',
    returnUrl: process.env.SOAP_RETURN_URL as string
  });

  // Initialize NowPayments Gateway
  PaymentGatewayFactory.createGateway('nowpayments', {
    apiKey: process.env.NOWPAYMENTS_API_KEY as string,
    secret: process.env.NOWPAYMENTS_IPN_SECRET as string,
    environment:  'production' ,
    returnUrl: process.env.NOWPAYMENTS_CALLBACK_URL as string
  });

  // Initialize Goat Payments Gateway
  PaymentGatewayFactory.createGateway('goat', {
    apiKey: '', // Not used for Goat
    username: process.env.GOAT_PAYMENTS_USERNAME as string,
    password: process.env.GOAT_PAYMENTS_PASSWORD as string,
    environment: 'production'
  });

  // Initialize CentryOS Gateway
  PaymentGatewayFactory.createGateway('centryos', {
    apiKey: process.env.CENTRYOS_API_KEY as string,
    secret: process.env.CENTRYOS_WEBHOOK_SECRET as string,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    returnUrl: process.env.CENTRYOS_RETURN_URL as string
  });

  // Add other payment gateway initializations here if needed
}; 