'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { PAYMENT_METHODS } from '../config/payment-methods';
import { usePaymentModal } from '../hooks/usePaymentModal';
import GoatPaymentsModal from './goat-payments-modal';
import type { CoinPackage, PaymentModalProps } from '../types';

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

const PaymentMethodButton = ({ 
    method, 
    isSelected, 
    onSelect 
}: { 
    method: typeof PAYMENT_METHODS[0]; 
    isSelected: boolean; 
    onSelect: () => void; 
}) => {
    const { lg } = useBreakPoint();

    return (
        <Button
            neon
            variant='neon'
            size={lg ? 'lg' : 'md'}
            glowColor={method.color}
            glowSpread={isSelected ? 1.2 : 0.8}
            backgroundColor={method.color}
            backgroundOpacity={method.available ? (isSelected ? 0.2 : 0.1) : 0.05}
            neonBoxClass='rounded-md transition-all duration-200'
            className={cn(
                'w-full flex flex-col items-center gap-3 p-6 h-auto min-h-[160px] transition-all duration-200 relative',
                !method.available && 'opacity-50 cursor-not-allowed',
                isSelected && 'ring-2 ring-white/50 shadow-lg scale-[1.02]',
                method.available && !isSelected && 'hover:scale-[1.01] hover:shadow-md'
            )}
            onClick={onSelect}
            disabled={!method.available}
        >
            <NeonIcon
                icon={method.icon}
                size={lg ? 32 : 28}
                glowColor={method.color}
                glowSpread={isSelected ? 1.5 : 1}
            />
            <div className='text-center w-full px-4'>
                <div className={cn(
                    'font-bold text-lg mb-3 transition-colors duration-200',
                    isSelected ? 'text-white' : 'text-white/90'
                )}>
                    {method.label}
                </div>
                <div className={cn(
                    'text-sm leading-relaxed transition-colors duration-200 break-words hyphens-auto whitespace-normal',
                    isSelected ? 'text-white/90' : 'text-white/70'
                )}>
                    {method.description}
                </div>
            </div>
            {isSelected && (
                <div className='absolute top-3 right-3 z-10'>
                    <div className='w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg'>
                        <NeonIcon
                            icon='lucide:check'
                            size={12}
                            glowColor='--color-green-500'
                        />
                    </div>
                </div>
            )}
        </Button>
    );
};

export default function PaymentModal({ isOpen, onClose, selectedPackage }: PaymentModalProps) {
    const { sm, xl } = useBreakPoint();
    const [isGoatPaymentsOpen, setIsGoatPaymentsOpen] = useState(false);
    
    const {
        selectedPaymentMethod,
        isProcessing,
        isRedirecting,
        error,
        selectPaymentMethod,
        processPayment,
        clearError,
    } = usePaymentModal();

    const handlePaymentMethodSelect = (method: typeof PAYMENT_METHODS[0]) => {
        if (method.id === 'goatpayments') {
            // Close this modal to avoid backdrop/focus conflicts with CollectJS
            onClose();
            setIsGoatPaymentsOpen(true);
            return;
        }
        selectPaymentMethod(method);
    };

    const handleProceedToPayment = async () => {
        if (!selectedPackage) return;
        await processPayment(selectedPackage);
    };

    const handleClose = () => {
        clearError();
        setIsGoatPaymentsOpen(false);
        onClose();
    };

    const handleGoatPaymentsClose = () => {
        setIsGoatPaymentsOpen(false);
    };

    return (
        <>
            {/* Full-Screen Redirecting Overlay */}
            {isRedirecting && (
                <div className='fixed inset-0 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center z-[9999]'>
                    <div className='text-center space-y-8 px-4 max-w-md mx-auto'>
                        {/* Animated Loading Spinner */}
                        <div className='relative w-32 h-32 mx-auto'>
                            <div className='absolute inset-0 border-4 border-blue-500/20 rounded-full'></div>
                            <div className='absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin'></div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <NeonIcon
                                    icon='lucide:arrow-right'
                                    size={48}
                                    glowColor='--color-blue-500'
                                    glowSpread={1.5}
                                />
                            </div>
                        </div>
                        
                        <div className='space-y-3'>
                            <NeonText
                                as='h2'
                                className='text-3xl font-bold'
                                glowColor='--color-blue-500'
                                glowSpread={0.8}
                            >
                                Redirecting to Payment Gateway
                            </NeonText>
                            <p className='text-gray-400 text-lg'>
                                Please wait while we redirect you to complete your payment...
                            </p>
                        </div>

                        {/* Loading Progress Bar */}
                        <div className='w-full max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden mx-auto'>
                            <div className='h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse bg-[length:200%_100%]'></div>
                        </div>

                        {/* Loading Indicator */}
                        <div className='flex items-center justify-center gap-2 text-blue-400'>
                            <div 
                                className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                style={{ animationDelay: '0ms' }}
                            ></div>
                            <div 
                                className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                style={{ animationDelay: '150ms' }}
                            ></div>
                            <div 
                                className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                style={{ animationDelay: '300ms' }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

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
                        Coin Package Details
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

                    {/* Payment Methods Section */}
                    <NeonText
                        as='h4'
                        className='h4-title text-center pt-2 mb-6'
                    >
                        Select Payment Method
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

                    {/* Payment Methods Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl'>
                        {PAYMENT_METHODS.map((method) => (
                            <div key={method.id} className='relative'>
                                <PaymentMethodButton
                                    method={method}
                                    isSelected={selectedPaymentMethod?.id === method.id}
                                    onSelect={() => handlePaymentMethodSelect(method)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proceed Button */}
                <div className='flex justify-center lg:mb-4 mb-2 px-4'>
                    <Button
                        variant='secondary'
                        size={xl ? 'lg' : sm ? 'md' : 'sm'}
                        onClick={handleProceedToPayment}
                        disabled={!selectedPaymentMethod || isProcessing || isRedirecting}
                        className='w-full max-w-xs'
                    >
                        {isProcessing ? (
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Processing...
                            </div>
                        ) : (
                            'Proceed To Payment'
                        )}
                    </Button>
                </div>
            </DialogContent>
            
            {/* GoatPayments Modal */}
            <GoatPaymentsModal
                isOpen={isGoatPaymentsOpen}
                onClose={handleGoatPaymentsClose}
                selectedPackage={selectedPackage}
            />
        </Dialog>
        </>
    );
}