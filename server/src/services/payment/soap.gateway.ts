import axios from 'axios';
import PaymentMethodModel from '../../models/payment-method.model';
import UserModel from '../../models/user.model';
import { ApiError } from '../../utils/api-error';
import { SoapPaymentGateway, PaymentGatewayConfig } from './interfaces';
import crypto from 'crypto';

export class SoapGateway implements SoapPaymentGateway {
    private apiKey: string;
    private baseUrl: string;
    private returnUrl: string;
    private secret: string;

    constructor(config: PaymentGatewayConfig) {
        this.apiKey = config.apiKey;
        this.secret = config.secret!;
        this.returnUrl = config.returnUrl!;
        this.baseUrl = config.environment === 'sandbox' 
            ? 'https://api-sandbox.paywithsoap.com'
            : 'https://api.paywithsoap.com';
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Creates a customer in Soap system if not exists
     * @param userId - User ID from our system
     * @returns customerId from Soap
     */
    private async createOrGetCustomer(userId: string): Promise<string> {
        // Check if user already has a Soap account
        const paymentMethod = await PaymentMethodModel.findOne({
            userId,
            type: 'soap',
            'details.soapAccountId': { $exists: true }
        });

        if (paymentMethod?.details.soapAccountId) {
            return paymentMethod.details.soapAccountId;
        }

        // Get user details
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Create customer in Soap
        const payload = {
            first_name: user.name.first,
            last_name: user.name.last,
            email:user.email,
            internal_id: userId.toString()
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/customers`,
                payload,
                { headers: this.getHeaders() }
            );
console.log(response,"RESPONSE FROM THEIR SIDE")
            const customerId = response.data.id;

            // Save Soap customer ID to payment method
            await PaymentMethodModel.findOneAndUpdate(
                { userId, type: 'soap' },
                {
                    $set: {
                        'details.soapAccountId': customerId,
                        status: 'active'
                    }
                },
                { upsert: true, new: true }
            );

            return customerId;
        } catch (error) {
            console.error('Error creating Soap customer:', error);
            throw new ApiError(500, 'Failed to create Soap customer');
        }
    }

    /**
     * Process deposit through Soap
     * @param amount - Amount to deposit
     * @param userId - User ID
     * @param productId - Product ID from Soap
     * @returns checkout URL and other details
     */
    async processDeposit(amount: number, userId: string, productId: string,returnUrl:string): Promise<any> {
        try {
            // Get or create customer
            const customerId = await this.createOrGetCustomer(userId);
console.log(customerId,"CUSTOMER ID")
            // Create checkout
            const payload = {
                customer_id: customerId,
                return_url:returnUrl || this.returnUrl,
                type: 'deposit',
                line_items: [{
                    product_id: productId,
                    quantity: productId==="pr_yZmbqYMbZE1kXR1AkDZF3NgVLfu2hBC1"?amount:1,
                    // quantity: productId==="pr_2KK9xSH958yHmJ5Vs6bQg9sY3Euc5Q3R"?amount:1,
                }]
            };
console.log(payload,"PAYLOAD")
            const response = await axios.post(
                `${this.baseUrl}/api/v1/checkouts`,
                payload,
                { headers: this.getHeaders() }
            );
console.log(response,"CHECKOUT RESPONSE")
            return {
                checkoutUrl: response.data.url,
                checkoutId: response.data.id
            };
        } catch (error) {
            console.error('Error processing Soap deposit:', error);
            throw new ApiError(500, 'Failed to process deposit');
        }
    }

    /**
     * Process withdrawal through Soap
     * @param amount - Amount to withdraw
     * @param userId - User ID
     * @param productId - Product ID from Soap
     * @returns checkout URL and other details
     */
    async processWithdrawal(amount: number, userId: string): Promise<any> {
        try {
            // Get or create customer
            const customerId = await this.createOrGetCustomer(userId);

            // Create checkout
            const payload = {
                customer_id: customerId,
                type: 'withdrawal',
                fixed_amount_cents:Number(amount*100),
                return_url:this.returnUrl
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v1/checkouts`,
                payload,
                { headers: this.getHeaders() }
            );

            return {
                checkoutUrl: response.data.url,
                checkoutId: response.data.id,
                status: response.data.status
            };
        } catch (error) {
            console.error('Error processing Soap withdrawal:', error);
            throw new ApiError(500, 'Failed to process withdrawal');
        }
    }


    /**
     * Verify webhook signature
     * @param payload - Webhook payload
     * @param signature - Webhook signature
     * @returns boolean indicating if signature is valid
     */
    verifyWebhook(payload: any, signature: string): boolean {
        if (!signature) {
            return false;
        }

        const parts = signature.split(",");
        const timestampPart = parts.find((p) => p.startsWith("t="));
        const signaturePart = parts.find((p) => p.startsWith("v1="));

        if (!timestampPart || !signaturePart) {
            return false;
        }

        const timestamp = timestampPart.split("=")[1];
        const receivedSignature = signaturePart.split("=")[1];
        const message = `${timestamp}.${JSON.stringify(payload)}`;
        
        const calculatedSignature = crypto
            .createHmac("sha256", this.secret)
            .update(message)
            .digest("hex");

        return crypto.timingSafeEqual(
            Buffer.from(receivedSignature, "hex"),
            Buffer.from(calculatedSignature, "hex")
        );
    }

    /**
     * Handle webhook events
     * @param event - Webhook event
     */
    async handleWebhook(event: any): Promise<void> {
        const { type, data } = event;

        if (type !== 'checkout.succeeded') {
            return;
        }

        // The actual transaction update logic should remain in the controller
        // This method is just for logging and any gateway-specific processing
        console.log('Processing Soap webhook:', {
            type,
            checkoutId: data.id,
            chargeStatus: data.charge?.status
        });
    }
} 