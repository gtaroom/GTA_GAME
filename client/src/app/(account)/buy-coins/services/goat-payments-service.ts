/**
 * GoatPayments Service
 * Handles GoatPayments integration and payment processing
 */

import { GOAT_PAYMENTS_CONFIG, type PaymentTokenResponse, type PaymentMethodType, type GoatPaymentResult } from '../config/goat-payments';

declare global {
    interface Window {
        CollectJS: {
            configure: (config: any) => void;
            startPaymentRequest: () => void;
            closePaymentRequest: () => void;
            on: (event: string, callback: (data: any) => void) => void;
        };
    }
}

interface PaymentConfig {
    amount: number;
    currency?: string;
}

class GoatPaymentsService {
    private static instance: GoatPaymentsService;
    private isConfigured = false;
    private currentPaymentToken: string | null = null;
    private globalPaymentHandler: ((event: any) => void) | null = null;

    private constructor() {
        console.log('GoatPaymentsService initialized');
    }

    /**
     * Reset any UI elements rendered by CollectJS to allow re-rendering
     */
    private resetUIElements(): void {
        try {
            const appleContainer = document.querySelector(GOAT_PAYMENTS_CONFIG.applePaySelector) as HTMLElement | null;
            if (appleContainer) appleContainer.innerHTML = '';

            const googleContainer = document.querySelector(GOAT_PAYMENTS_CONFIG.googlePaySelector) as HTMLElement | null;
            if (googleContainer) googleContainer.innerHTML = '';
        } catch (e) {
            console.warn('⚠️ Failed clearing CollectJS UI containers', e);
        }
    }

    /**
     * Public reset to re-initialize payment safely between attempts
     */
    public reset(): void {
        this.isConfigured = false;
        this.clearToken();
        this.resetUIElements();
    }

    public static getInstance(): GoatPaymentsService {
        if (!GoatPaymentsService.instance) {
            GoatPaymentsService.instance = new GoatPaymentsService();
        }
        return GoatPaymentsService.instance;
    }

    /**
     * Load CollectJS script dynamically if not available
     */
    private async loadCollectJSScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector('script[src*="Collect.js"]');
            if (existingScript) {
                console.log('📜 CollectJS script already exists in DOM');
                resolve();
                return;
            }

            console.log('📜 Loading CollectJS script dynamically...');
            const script = document.createElement('script');
            script.src = 'https://goatpayments.transactiongateway.com/token/Collect.js';
            script.setAttribute('data-tokenization-key', '8Zbsgc-3r3c4A-92W7B6-hjM797');
            script.setAttribute('data-primary-color', '#37805B');
            script.setAttribute('data-theme', 'bootstrap');
            script.setAttribute('data-secondary-color', '#19C687');
            script.setAttribute('data-button-text', 'Pay Now');
            script.setAttribute('data-instruction-text', 'Enter your payment information');
            script.setAttribute('data-payment-type', 'cc');
            script.setAttribute('data-field-cvv-display', 'show');
            script.setAttribute('data-price', '1.00');
            script.setAttribute('data-currency', 'USD');
            script.setAttribute('data-country', 'US');
            script.setAttribute('data-field-apple-pay-selector', '.apple-pay-button');
            script.setAttribute('data-field-google-pay-selector', '.google-pay-button');
            
            script.onload = () => {
                console.log('✅ CollectJS script loaded successfully');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load CollectJS script');
                reject(new Error('Failed to load CollectJS script'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Check if CollectJS is loaded globally
     */
    public async waitForCollectJS(): Promise<void> {
        console.log('🔍 Checking for CollectJS availability...');
        
        if (window.CollectJS) {
            console.log('✅ CollectJS is already available');
            return Promise.resolve();
        }

        // Try to load script dynamically if not available
        try {
            await this.loadCollectJSScript();
        } catch (error) {
            console.warn('⚠️ Failed to load script dynamically, continuing with timeout check...');
        }

        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds total
            
            const checkCollectJS = () => {
                attempts++;
                console.log(`🔍 Attempt ${attempts}/${maxAttempts} - Checking for CollectJS...`);
                
                if (window.CollectJS) {
                    console.log('✅ CollectJS is now available');
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    console.error('❌ CollectJS not available after timeout');
                    console.error('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('collect')));
                    reject(new Error('CollectJS not available after timeout'));
                    return;
                }
                
                setTimeout(checkCollectJS, 100);
            };
            
            checkCollectJS();
        });
    }

    /**
     * Configure CollectJS with payment settings
     */
    private configureCollectJS(config: PaymentConfig): void {
        if (this.isConfigured) {
            console.log('⚠️ CollectJS already configured, reconfiguring with latest settings');
            // Allow reconfiguration to force re-render of buttons
            this.isConfigured = false;
        }

        const collectConfig = {
            callback: (response: PaymentTokenResponse) => {
                console.log('✅ Payment token received:', response);
                
                // Determine payment method
                let paymentMethod: PaymentMethodType = 'card';
                if (response.tokenType === 'applePay' || (response.wallet && response.wallet.cardNetwork && response.tokenType !== 'googlePay')) {
                    paymentMethod = 'applepay';
                } else if (response.tokenType === 'googlePay' || (response.wallet && response.wallet.cardNetwork && response.tokenType === 'googlePay')) {
                    paymentMethod = 'googlepay';
                }
                
                // Store token and dispatch event
                this.currentPaymentToken = response.token;
                window.dispatchEvent(new CustomEvent('goat-payment-success', {
                    detail: { response, paymentMethod }
                }));
            },
            price: config.amount.toString(),
            currency: config.currency || GOAT_PAYMENTS_CONFIG.currency,
            country: GOAT_PAYMENTS_CONFIG.country,
            fields: {
                cvv: {
                    display: GOAT_PAYMENTS_CONFIG.fieldCvvDisplay
                },
                googlePay: {
                    selector: GOAT_PAYMENTS_CONFIG.googlePaySelector,
                    shippingAddressRequired: true,
                    billingAddressRequired: true,
                    emailRequired: true,
                    buttonType: 'buy',
                    buttonColor: 'default',
                    buttonLocale: 'en'
                },
                applePay: {
                    selector: GOAT_PAYMENTS_CONFIG.applePaySelector,
                    requiredBillingContactFields: ['postalAddress', 'name'],
                    contactFields: ['email'],
                    type: 'buy',
                    style: {
                        'button-style': 'black',
                        'height': '40px',
                        'border-radius': '8px'
                    }
                }
            }
        };

        window.CollectJS.configure(collectConfig);

        // Attach close handler to stop loading when user cancels
        if (window.CollectJS.on) {
            window.CollectJS.on('close', () => {
                console.log('🚪 CollectJS modal closed by user');
                window.dispatchEvent(new CustomEvent('collectjs-modal-closed'));
            });
            window.CollectJS.on('error', (error: any) => {
                console.error('❌ CollectJS error:', error);
                window.dispatchEvent(new CustomEvent('collectjs-error', { detail: { error } }));
            });
        }
        this.isConfigured = true;
        console.log('✅ CollectJS configured successfully');
    }

    /**
     * Initialize credit/debit card payment
     */
    public async initializeCardPayment(config: PaymentConfig): Promise<GoatPaymentResult> {
        try {
            this.reset();
            await this.waitForCollectJS();
            this.configureCollectJS(config);

            if (window.CollectJS.startPaymentRequest) {
                window.CollectJS.startPaymentRequest();
                return { success: true };
            } else {
                return { success: false, error: 'Payment system not available' };
            }
        } catch (error) {
            console.error('Error initializing card payment:', error);
            return { success: false, error: 'Failed to initialize payment' };
        }
    }

    /**
     * Initialize Apple Pay
     */
    public async initializeApplePay(config: PaymentConfig): Promise<GoatPaymentResult> {
        try {
            this.reset();
            await this.waitForCollectJS();
            this.configureCollectJS(config);

            // Basic runtime availability check (Safari + ApplePaySession API)
            const isApplePayAvailable = typeof (window as any).ApplePaySession === 'function';
            if (!isApplePayAvailable) {
                return { success: false, error: 'Apple Pay not available on this device' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error initializing Apple Pay:', error);
            return { success: false, error: 'Failed to initialize Apple Pay' };
        }
    }

    /**
     * Initialize Google Pay
     */
    public async initializeGooglePay(config: PaymentConfig): Promise<GoatPaymentResult> {
        try {
            this.reset();
            await this.waitForCollectJS();
            this.configureCollectJS(config);

            // Basic runtime availability check via Payment Request API presence
            const isPaymentRequestSupported = 'PaymentRequest' in window;
            if (!isPaymentRequestSupported) {
                return { success: false, error: 'Google Pay not available on this device' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error initializing Google Pay:', error);
            return { success: false, error: 'Failed to initialize Google Pay' };
        }
    }

    /**
     * Set up global payment success handler
     */
    public setupPaymentHandler(handler: (event: any) => void): void {
        this.removePaymentHandler();
        this.globalPaymentHandler = handler;
        window.addEventListener('goat-payment-success', this.globalPaymentHandler);
        console.log('🔧 Payment handler set up');
    }

    /**
     * Remove payment handler
     */
    public removePaymentHandler(): void {
        if (this.globalPaymentHandler) {
            window.removeEventListener('goat-payment-success', this.globalPaymentHandler);
            this.globalPaymentHandler = null;
            console.log('🗑️ Payment handler removed');
        }
    }

    /**
     * Get current payment token
     */
    public getCurrentToken(): string | null {
        return this.currentPaymentToken;
    }

    /**
     * Clear current payment token
     */
    public clearToken(): void {
        this.currentPaymentToken = null;
        console.log('🗑️ Payment token cleared');
    }

    /**
     * Close payment modal
     */
    public closeModal(): void {
        if (window.CollectJS && window.CollectJS.closePaymentRequest) {
            window.CollectJS.closePaymentRequest();
        }
    }

    /**
     * Update payment amount dynamically
     */
    public updateAmount(amount: number): void {
        const scriptTag = document.querySelector('script[data-tokenization-key]') as HTMLScriptElement;
        if (scriptTag) {
            scriptTag.setAttribute('data-price', amount.toString());
            console.log(`💰 Updated payment amount to $${amount.toFixed(2)}`);
        }
    }
}

export const goatPaymentsService = GoatPaymentsService.getInstance();
