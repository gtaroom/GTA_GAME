import { IPaymentGateway, PaymentGatewayConfig, SoapPaymentGateway } from './interfaces';
import { PlisioGateway } from './plisio.gateway';
import { SkrillGateway } from './skrill.gateway';
import { SoapGateway } from './soap.gateway';
import { NowPaymentsGateway } from './nowpayments.gateway';
import { GoatGateway, GoatPaymentGatewayConfig } from './goat.gateway';
import { CentryOSGateway } from './centryos.gateway';

export type PaymentGatewayType = 'plisio' | 'skrill' | 'stripe' | 'paypal' | 'crypto' | 'soap' | 'nowpayments' | 'goat' | 'centryos';

export class PaymentGatewayFactory {
  private static gateways: Map<PaymentGatewayType, IPaymentGateway | SoapPaymentGateway | GoatGateway | CentryOSGateway> = new Map();

  static createGateway(type: PaymentGatewayType, config: PaymentGatewayConfig | GoatPaymentGatewayConfig): IPaymentGateway | SoapPaymentGateway | GoatGateway | CentryOSGateway {
    if (this.gateways.has(type)) {
      return this.gateways.get(type)!;
    }

    let gateway: IPaymentGateway | SoapPaymentGateway | GoatGateway | CentryOSGateway;

    switch (type) {
      case 'soap':
        gateway = new SoapGateway(config);
        break;
      case 'plisio':
        gateway = new PlisioGateway(config);
        break;
      case 'skrill':
        gateway = new SkrillGateway(config);
        break;
      case 'nowpayments':
        gateway = new NowPaymentsGateway(config);
        break;
      case 'goat':
        gateway = new GoatGateway(config as GoatPaymentGatewayConfig);
        break;
      case 'centryos':
        gateway = new CentryOSGateway(config);
        break;
      // Add other gateways here
      default:
        throw new Error(`Unsupported payment gateway type: ${type}`);
    }

    this.gateways.set(type, gateway);
    return gateway;
  }

  static getGateway(type: PaymentGatewayType): IPaymentGateway | SoapPaymentGateway | GoatGateway | CentryOSGateway {
    const gateway = this.gateways.get(type);
    if (!gateway) {
      throw new Error(`Payment gateway ${type} not initialized`);
    }
    return gateway;
  }
} 