import axios from 'axios';
import PaymentMethodModel from '../../models/payment-method.model';
import UserModel from '../../models/user.model';
import { ApiError } from '../../utils/api-error';
import { SoapPaymentGateway, PaymentGatewayConfig } from './interfaces';
import crypto from 'crypto';

export class CentryOSGateway implements SoapPaymentGateway {
    private apiClientId: string;
    private apiClientSecret: string;
    private baseUrl: string;
    private returnUrl: string;
    private secret: string;
    private accountBaseUrl: string;

    constructor(config: PaymentGatewayConfig) {
        this.apiClientId = config.apiKey; // Using apiKey as Client ID
        this.apiClientSecret = config.secret!; // Using secret as Client Secret
        this.secret = config.secret!; // For webhook verification
        this.returnUrl = config.returnUrl!;
        this.baseUrl = 'https://api.liquidity.walletos.xyz';
        this.accountBaseUrl = 'https://api.accounts.walletos.xyz';
    }

    /**
     * Generate JWT access token using API Client ID and Secret
     */
    private async generateAccessToken(): Promise<string> {
        try {
            // Validate credentials
            if (!this.apiClientId || !this.apiClientSecret) {
                throw new ApiError(500, 'Missing CentryOS API credentials');
            }

            // Create Basic Auth header with Client ID and Secret
            const credentials = Buffer.from(`${this.apiClientId}:${this.apiClientSecret}`).toString('base64');
            
            console.log('Generating CentryOS access token with:', {
                clientId: this.apiClientId,
                clientSecret: this.apiClientSecret ? `${this.apiClientSecret.substring(0, 4)}...` : 'missing',
                accountBaseUrl: this.accountBaseUrl
            });
            
            const response = await axios.post(
                `${this.accountBaseUrl}/v1/ext/jwt/generate-token`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('CentryOS access token generated successfully',response.data.data.token);
            return response.data.data.token;
        } catch (error: any) {
            console.error('Error generating CentryOS access token:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to generate access token');
        }
    }

    private async getHeaders() {
        // const accessToken = await this.generateAccessToken();
        const accessToken = process.env.CENTRYOS_ACCESS_TOKEN;
        
        if (!accessToken) {
            throw new ApiError(500, 'Missing CENTRYOS_ACCESS_TOKEN in environment variables');
        }
        
        return {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Process deposit through CentryOS payment links
     * @param amount - Amount to deposit
     * @param userId - User ID
     * @param returnUrl - Optional custom return URL
     * @returns payment URL and other details
     */
    async processDeposit(amount: number, userId: string, returnUrl?: string): Promise<any> {
        try {
            // Get user details for payment link name
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            // Create payment link directly
            const payload = {
                currency: 'USD',
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
                name: `Deposit for ${user.name.first} ${user.name.last}`,
                amount: amount,
                redirectTo: returnUrl || this.returnUrl,
                amountLocked: true,
                customerPays: false,
                isOpenLink: false, // Single use link
                // externalId: userId.toString(), // Link to your user
                customUrlPath: 'GTOA',
                acceptedPaymentOptions: [
                    'cashapp',
                    'google_pay',
                    'apple_pay'
                ],
                dataCollections: []
            };

            console.log('CentryOS Deposit Payload:', payload);

            const headers = await this.getHeaders();
            console.log('CentryOS Headers:', { Authorization: `${headers.Authorization.substring(0, 20)}...` });

            const response = await axios.post(
                `${this.baseUrl}/v1/ext/collections/payment-link`,
                payload,
                { headers }
            );

            console.log('CentryOS Deposit Response:', response.data);

            return {
                id: response.data.data.application.id,
                paymentUrl: response.data.data.url,
                paymentId: response.data.data.application.token,
                expiredAt: response.data.data.application.expiredAt
            };
        } catch (error: any) {
            console.error('Error creating CentryOS payment link:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to create payment link');
        }
    }

    /**
     * Process withdrawal through CentryOS
     * @param amount - Amount to withdraw
     * @param userId - User ID
     * @returns payment URL and other details
     */
    async processWithdrawal(amount: number, userId: string): Promise<any> {
        try {
            // Get user details for payment link name
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            const payload = {
                currency: 'USD',
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                name: `Withdrawal for ${user.name.first} ${user.name.last}`,
                amount: amount,
                redirectTo: this.returnUrl,
                amountLocked: true,
                customerPays: false,
                isOpenLink: false,
                acceptedPaymentOptions: ['card', 'bank_transfer'],
                externalId: userId.toString()
            };

            console.log('CentryOS Withdrawal Payload:', payload);

            const headers = await this.getHeaders();
            const response = await axios.post(
                `${this.baseUrl}/v1/ext/collections/payment-link`,
                payload,
                { headers }
            );

            console.log('CentryOS Withdrawal Response:', response.data);

            return {
                paymentUrl: response.data.data.url,
                paymentId: response.data.data.application.token,
                status: 'pending'
            };
        } catch (error: any) {
            console.error('Error creating CentryOS withdrawal link:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to create withdrawal link');
        }
    }

    /**
     * Verify webhook signature using SHA-512 HMAC
     * @param payload - Raw request body (string)
     * @param signature - Webhook signature from headers
     * @returns boolean indicating if signature is valid
     */
    verifyWebhook(payload: string, signature: string): boolean {
        if (!signature || !this.secret) {
            return false;
        }

        try {
            console.log('CentryOS Webhook Signature:', signature);
            // Create SHA-512 HMAC hash of the raw request body
            const calculatedSignature = crypto
                .createHmac('sha512', this.secret)
                .update(payload, 'utf8')
                .digest('hex');
                console.log('CentryOS Webhook Signature:', calculatedSignature);

            // Compare signatures using timing-safe comparison
            return crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(calculatedSignature, 'hex')
            );
        } catch (error) {
            console.error('Error verifying CentryOS webhook signature:', error);
            return false;
        }
    }

    /**
     * Handle webhook events
     * @param event - Webhook event
     */
    async handleWebhook(event: any): Promise<void> {
        const { eventType, status, payload } = event;

        console.log('Processing CentryOS webhook:', {
            eventType,
            status,
            transactionId: payload?.transactionId,
            amount: payload?.amount,
            entityId: payload?.entityId
        });

        // Handle different webhook events
        if (eventType === 'COLLECTION' && status === 'SUCCESS') {
            console.log('Payment completed for user:', payload?.entityId);
            // The actual transaction update logic should remain in the controller
        } else if (eventType === 'COLLECTION' && status === 'FAILED') {
            console.log('Payment failed for user:', payload?.entityId);
        }
    }
}
