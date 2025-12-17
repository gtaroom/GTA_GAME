'use client';
import NeonBox from '@/components/neon/neon-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useTransactions } from '@/hooks/useTransactions';
import { redeemCoupon } from '@/lib/api/wallet';
import { useAuth } from '@/contexts/auth-context';
import { useKYCVerification } from '@/hooks/useKYCVerification';
import { useState } from 'react';
import AccountPageTitle from '../../profile/components/account-page-title';
import { SecBox } from './sec-box';

export default function RedeemCouponCode() {
    const { sm, xl } = useBreakPoint();
    const { refresh: refreshWalletBalance } = useWalletBalance();
    const { user } = useAuth();
    const { redirectToKYC } = useKYCVerification();
    const { refresh: refreshTransactions } = useTransactions();
    
    const [couponCode, setCouponCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const ELEMENT_SIZE = xl ? 'lg' : sm ? 'md' : 'sm';

    interface InputSettingsProps {
        size: 'sm' | 'md' | 'lg';
        glowColor: string;
        glowSpread: number;
        backgroundColor: string;
        backgroundOpacity: number;
        borderColor: string;
    }

    const inputSettings: InputSettingsProps = {
        size: ELEMENT_SIZE,
        glowColor: 'var(--color-red-500)',
        glowSpread: 0.5,
        backgroundColor: 'var(--color-red-500)',
        backgroundOpacity: 0.08,
        borderColor: 'var(--color-white)',
    };

    const handleRedeemCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        // Check KYC verification first
        if (!user?.isKYC) {
            // Redirect to KYC verification with current page as return URL
            const currentUrl = window.location.pathname + window.location.search;
            redirectToKYC({ 
                redirectUrl: currentUrl,
                showToast: true,
                toastMessage: 'KYC verification is required to redeem coupons. Redirecting to verification...'
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await redeemCoupon({ code: couponCode.trim() });
            
            if (response.success) {
                // Refresh wallet balance to show updated balance (used in header, buy-redeem, etc.)
                refreshWalletBalance();
                
                // Refresh transaction history to show the new transaction
                refreshTransactions();
                
                setSuccess(response.message || 'Coupon redeemed successfully!');
                setCouponCode(''); // Clear the input
            } else {
                setError(response.message || 'Failed to redeem coupon');
            }
        } catch (err) {
            console.error('Coupon redemption error:', err);
            setError(err instanceof Error ? err.message : 'Failed to redeem coupon. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCouponCode(e.target.value);
        // Clear errors when user starts typing
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleRedeemCoupon();
        }
    };

    return (
        <>
            <section>
                <AccountPageTitle className='max-lg:text-center max-lg:mb-8 mb-10'>
                    Redeem Coupon Code
                </AccountPageTitle>
                <NeonBox
                    glowColor='--color-red-500'
                    glowSpread={0.5}
                    backgroundColor='--color-red-500'
                    backgroundOpacity={0.1}
                    className='xxl:p-10 lg:p-8 md:p-6 p-5 rounded-lg flex flex-col items-start justify-between backdrop-blur-2xl'
                >
                    <SecBox title='Enter Coupon Code*' color='--color-red-500'>
                        <div className='w-full'>
                            <Input
                                className='sm:mb-4 xs:mb-2 mb-1'
                                type='text'
                                placeholder='Enter your coupon code'
                                value={couponCode}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                {...inputSettings}
                            />
                            
                            {/* Error Message */}
                            {error && (
                                <div className='text-red-400 text-sm mt-2 flex items-center gap-2'>
                                    <span className='text-red-500'>⚠</span>
                                    {error}
                                </div>
                            )}
                            
                            {/* Success Message */}
                            {success && (
                                <div className='text-green-400 text-sm mt-2 flex items-center gap-2'>
                                    <span className='text-green-500'>✓</span>
                                    {success}
                                </div>
                            )}
                        </div>
                    </SecBox>
                    <Button 
                        variant='secondary' 
                        size={ELEMENT_SIZE}
                        onClick={handleRedeemCoupon}
                        disabled={isLoading || !couponCode.trim()}
                        className='w-full sm:w-auto'
                    >
                        {isLoading ? 'Redeeming...' : 'Redeem Code'}
                    </Button>
                </NeonBox>
            </section>
        </>
    );
}
