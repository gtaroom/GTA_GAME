'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useGoatPayments } from '../hooks/useGoatPayments';
import type { CoinPackage, GoatPaymentsModalProps } from '../types';

const PackGoldCoinBox = ({
    totalAmount,
    label,
}: {
    totalAmount: number;
    label?: string;
}) => (
    <div className='flex flex-col xs:items-start items-center gap-2'>
        <div className='flex items-center gap-2'>
            <Image
                src='/coins/gold-coin.svg'
                height={28}
                width={28}
                alt='GC Icon'
                className='lg:w-[28px] w-[24px]'
            />
            <span className='lg:text-3xl text-2xl font-extrabold text-yellow-400'>
                {totalAmount}
            </span>
        </div>
        <span className='lg:text-lg text-base font-normal'>{label}</span>
    </div>
);

export default function GoatPaymentsModal({ isOpen, onClose, selectedPackage }: GoatPaymentsModalProps) {
    const { sm, xl } = useBreakPoint();
    const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'applepay' | 'googlepay' | null>(null);
	const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
			(/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
		const hasApplePayApi = typeof (window as any).ApplePaySession === 'function';
		setIsApplePayAvailable(isAppleDevice && hasApplePayApi);
	}, []);
    
    const {
        isLoading,
        error,
        processCardPayment,
        processApplePay,
        processGooglePay,
        clearError,
    } = useGoatPayments();

    const handlePaymentTypeSelect = (type: 'card' | 'applepay' | 'googlepay') => {
        setSelectedPaymentType(type);
        clearError();
    };

    const handleProceedToPayment = async () => {
        if (!selectedPackage || !selectedPaymentType) return;

        if (selectedPaymentType === 'applepay') {
            // Quick availability notice
            if (typeof (window as any).ApplePaySession !== 'function') {
                alert('Apple Pay is not available on this device/browser.');
                return;
            }
        }

        switch (selectedPaymentType) {
            case 'card':
                await processCardPayment(selectedPackage);
                handleClose()
                break;
            case 'applepay':
                await processApplePay(selectedPackage);
                break;
            case 'googlepay':
                await processGooglePay(selectedPackage);
                break;
        }
    };

    const handleClose = () => {
        clearError();
        setSelectedPaymentType(null);
        onClose();
    };

	const paymentTypes = useMemo(() => {
		return [
			{
				id: 'card' as const,
				label: 'Credit/Debit Card',
				icon: 'lucide:credit-card',
				description: 'Pay with your credit or debit card',
				color: '--color-blue-500',
			},
			{
				id: 'applepay' as const,
				label: 'Apple Pay',
				icon: 'lucide:smartphone',
				description: isApplePayAvailable ? 'Pay securely with Apple Pay' : 'Available only on Apple devices',
				color: '--color-gray-500',
			},
			{
				id: 'googlepay' as const,
				label: 'Google Pay',
				icon: 'lucide:smartphone',
				description: 'Pay securely with Google Pay',
				color: '--color-green-500',
			},
		];
	}, [isApplePayAvailable]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className='lg:max-w-[900px]! max-w-[calc(100%-20px)]! max-h-[90vh] overflow-y-auto'
                neonBoxClass='max-sm:p-4! max-md:px-2!'
            >
                <DialogTitle asChild>
                    <NeonText
                        as='h4'
                        className='max-sm:max-w-[236px] max-sm:mx-auto h4-title text-center pt-2 sm:pt-4 mb-6'
                    >
                        GoatPayments - Secure Payment
                    </NeonText>
                </DialogTitle>

                <div className='md:px-4 px-2 lg:mb-8 mb-6 flex flex-col items-center'>
                    {/* Package Details */}
                    <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.1}
                        className='pt-6 pb-8 xl:px-12 lg:px-10 px-6 rounded-lg text-center xl:mb-6 md:mb-4 mb-3 w-full max-w-md'
                    >
                        <NeonText
                            as='span'
                            className='h2-title mb-6 block'
                            glowColor='--color-yellow-500'
                            glowSpread={0.5}
                        >
                            {selectedPackage?.price}
                        </NeonText>
                        <div className='flex lg:items-start items-center max-xs:flex-col xs:gap-6 gap-4 justify-center'>
                            <PackGoldCoinBox
                                totalAmount={selectedPackage?.totalGC || 0}
                                label='Gold Coins'
                            />
                            {selectedPackage?.bonusGC && selectedPackage.bonusGC > 0 && (
                                <>
                                    <NeonIcon
                                        icon='entypo:plus'
                                        size={xl ? 42 : 32}
                                        glowColor='--color-yellow-500'
                                    />
                                    <PackGoldCoinBox
                                        totalAmount={selectedPackage.bonusGC}
                                        label='Bonus Coins'
                                    />
                                </>
                            )}
                        </div>
                    </NeonBox>

                    {/* Payment Type Selection */}
                    <NeonText
                        as='h4'
                        className='h4-title text-center pt-2 mb-6'
                    >
                        Choose Payment Method
                    </NeonText>

                    {/* Error Message */}
                    {error && (
                        <div className='w-full max-w-2xl mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg'>
                            <div className='text-red-400 text-sm flex items-center gap-2'>
                                <NeonIcon
                                    icon='lucide:alert-circle'
                                    size={16}
                                    glowColor='--color-red-500'
                                />
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Payment Types Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl'>
			{paymentTypes.map((type) => {
				const isDisabled = type.id === 'applepay' && !isApplePayAvailable;
				return (
                            <Button
                                key={type.id}
                                neon
                                variant='neon'
                                size={xl ? 'lg' : 'md'}
                                glowColor={type.color}
                                glowSpread={selectedPaymentType === type.id ? 1.2 : 0.8}
                                backgroundColor={type.color}
						backgroundOpacity={isDisabled ? 0.06 : selectedPaymentType === type.id ? 0.2 : 0.1}
                                neonBoxClass='rounded-md transition-all duration-200'
                                className={cn(
							'w-full flex flex-col items-center gap-2 p-4 h-auto min-h-[100px] transition-all duration-200 relative',
							selectedPaymentType === type.id && !isDisabled && 'ring-2 ring-white/50 shadow-lg scale-[1.02]',
							!isDisabled && (!selectedPaymentType || selectedPaymentType !== type.id) ? 'hover:scale-[1.01] hover:shadow-md' : 'opacity-60 cursor-not-allowed'
                                )}
						disabled={isDisabled}
						onClick={() => {
							if (isDisabled) return;
							handlePaymentTypeSelect(type.id);
						}}
                            >
                                <NeonIcon
                                    icon={type.icon}
                                    size={xl ? 28 : 24}
                                    glowColor={type.color}
							glowSpread={!isDisabled && selectedPaymentType === type.id ? 1.5 : 1}
                                />
                                <div className='text-center'>
                                    <div className={cn(
                                        'font-bold text-base mb-1 transition-colors duration-200',
								isDisabled ? 'text-white/60' : selectedPaymentType === type.id ? 'text-white' : 'text-white/90'
                                    )}>
                                        {type.label}
                                    </div>
                                    <div className={cn(
                                        'text-xs leading-tight transition-colors duration-200',
								isDisabled ? 'text-white/60' : selectedPaymentType === type.id ? 'text-white/90' : 'text-white/70'
                                    )}>
                                        {type.description}
                                    </div>
                                </div>
						{!isDisabled && selectedPaymentType === type.id && (
                                    <div className='absolute top-2 right-2'>
                                        <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                                            <NeonIcon
                                                icon='lucide:check'
                                                size={14}
                                                glowColor='--color-green-500'
                                            />
                                        </div>
                                    </div>
                                )}
                            </Button>
				);
			})}
                    </div>

                    {/* Payment Buttons for Apple Pay and Google Pay */}
                    {selectedPaymentType && (
                        <div className='w-full max-w-2xl mt-6'>
                            {selectedPaymentType === 'applepay' && (
                                <div className='apple-pay-button mb-4'>
                                    {/* Apple Pay button will be rendered here by Collect.js */}
                                </div>
                            )}
                            {selectedPaymentType === 'googlepay' && (
                                <div className='google-pay-button mb-4'>
                                    {/* Google Pay button will be rendered here by Collect.js */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Proceed Button */}
                <div className='flex justify-center lg:mb-4 mb-2 px-4'>
                    <Button
                        variant='secondary'
                        size={xl ? 'lg' : sm ? 'md' : 'sm'}
                        onClick={handleProceedToPayment}
                        disabled={!selectedPaymentType || isLoading}
                        className='w-full max-w-xs'
                    >
                        {isLoading ? (
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Processing...
                            </div>
                        ) : (
                            `Pay ${selectedPackage?.price} - ${selectedPaymentType === 'card' ? 'Credit/Debit Card' : selectedPaymentType === 'applepay' ? 'Apple Pay' : 'Google Pay'}`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
