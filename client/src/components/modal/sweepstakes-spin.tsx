import { Input } from '@/components/ui/input';
import type { InputStylePreset } from '@/types/content.types';
import Image from 'next/image';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DialogContent, DialogTitle, DialogClose } from '../ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useState, useEffect, useRef } from 'react';
import { http } from '@/lib/api/http';
import { Link } from 'next-transition-router';
import { updateProfile } from '@/lib/api/auth';

interface FormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    agreed: boolean;
    noPurchase: boolean;
    acceptMarketing: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
    agreed?: string;
    noPurchase?: string;
    acceptMarketing?: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export default function SweepstakesSpinModal() {
    const { user, refetchUser } = useAuth();
    const { refresh: refreshWallet } = useWalletBalance();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        address: '',
        phone: '',
        agreed: false,
        noPurchase: false,
        acceptMarketing: false,
    });
    
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [shouldClose, setShouldClose] = useState(false);

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            const fullName = [user.name?.first, user.name?.middle, user.name?.last]
                .filter(Boolean)
                .join(' ');
            
            setFormData(prev => ({
                ...prev,
                name: fullName,
                email: user.email || '',
            }));
        }
    }, [user]);

    // Auto-close modal after success
    useEffect(() => {
        if (shouldClose && closeButtonRef.current) {
            closeButtonRef.current.click();
            setShouldClose(false);
        }
    }, [shouldClose]);

    const inputSettings: InputStylePreset = {
        size: 'md',
        glowColor: 'var(--color-purple-500)',
        glowSpread: 0.5,
        backgroundColor: 'var(--color-purple-500)',
        backgroundOpacity: 0.08,
        borderColor: 'var(--color-white)',
    };

    // Validation functions
    const validateName = (name: string): string | undefined => {
        if (!name.trim()) return 'Full name is required';
        if (name.trim().length < 2) return 'Name must be at least 2 characters';
        if (name.trim().length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
        return undefined;
    };

    const validateAddress = (address: string): string | undefined => {
        if (!address.trim()) return 'Address is required';
        if (address.trim().length < 5) return 'Address must be at least 5 characters';
        if (address.trim().length > 200) return 'Address must be less than 200 characters';
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone.trim()) return 'Phone number is required';
        
        // Remove all non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');
        
        // Check if it's a valid US phone number (10 digits)
        if (digitsOnly.length !== 10) {
            return 'Phone number must be 10 digits (US format)';
        }
        
        // Check if it starts with valid US area code (not 0 or 1)
        const areaCode = digitsOnly.substring(0, 3);
        if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
            return 'Invalid US area code';
        }
        
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        newErrors.name = validateName(formData.name);
        newErrors.email = validateEmail(formData.email);
        newErrors.address = validateAddress(formData.address);
        newErrors.phone = validatePhone(formData.phone);
        
        if (!formData.agreed) {
            newErrors.agreed = 'Please accept the Official Rules and Terms & Conditions';
        }
        
        if (!formData.noPurchase) {
            newErrors.noPurchase = 'Please acknowledge the No Purchase Necessary terms';
        }
        
        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        
        // Clear messages when user starts typing
        if (successMessage) {
            setSuccessMessage(null);
        }
        if (apiError) {
            setApiError(null);
        }
    };

    const formatPhoneNumber = (value: string): string => {
        // Remove all non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        
        // Limit to 10 digits
        const limitedDigits = digitsOnly.slice(0, 10);
        
        // Format as (XXX) XXX-XXXX
        if (limitedDigits.length >= 6) {
            return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
        } else if (limitedDigits.length >= 3) {
            return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
        } else if (limitedDigits.length > 0) {
            return `(${limitedDigits}`;
        }
        
        return limitedDigits;
    };

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhoneNumber(value);
        handleInputChange('phone', formatted);
    };

    const handleMarketingChange = async (checked: boolean) => {
        handleInputChange('acceptMarketing', checked);
        
        // If user opts in, update their profile immediately (only if not already opted in)
        if (checked && !user?.isSmsOpted && !user?.isOpted) {
            try {
                await updateProfile({
                    isSmsOpted: true,
                    isOpted: true,
                    acceptSMSMarketing: true,
                });
                // Refresh user data to reflect the change
                await refetchUser();
            } catch (error) {
                console.error('Failed to update marketing preferences:', error);
                // Continue anyway - don't block the user
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous messages
        setSuccessMessage(null);
        setApiError(null);
        
        if (!validateForm()) {
            setApiError('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                phone: formData.phone.replace(/\D/g, ''), // Send only digits
                agreed: formData.agreed,
                noPurchase: formData.noPurchase,
            };

            const response = await http('/claim/sweep-daily-bonus', { 
                method: 'POST', 
                body: payload 
            }) as ApiResponse;
            
            if (response.success) {
                setSuccessMessage('Successfully claimed your free sweepstakes spin! 🎉');
                // Refresh wallet balance to show updated sweep coins
                await refreshWallet();
                
                // Close modal after 2 seconds to show success message
                setTimeout(() => {
                    setShouldClose(true);
                }, 2000);
            } else {
                throw new Error(response.message || 'Failed to claim sweepstakes spin');
            }
        } catch (error: any) {
            console.error('Sweepstakes claim error:', error.response);
            
            // Handle different types of errors
            let errorMessage = 'Failed to claim sweepstakes spin. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            setApiError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <DialogContent className='sm:max-w-[600px]! max-w-[calc(100%-40px)]'>
                {/* Hidden close button for programmatic closing */}
                <DialogClose ref={closeButtonRef} className='hidden' />
                
                <div className='px-5 py-3 flex flex-col items-center text-center'>
                    <DialogTitle className='mb-4' asChild>
                        <NeonText as='h4' className='h4-title'>
                        Claim 1 Free Sweepstakes Entry Today!
                        </NeonText>
                    </DialogTitle>
                    <p className='text-base font-bold leading-7.5 capitalize mb-5'>
                        Unlock your chance to win no purchase needed. Just tell
                        us a bit about you.
                    </p>

                    {/* Success Message */}
                    {successMessage && (
                        <div className='mb-6 p-6 bg-green-500/20 border-2 border-green-500/50 rounded-lg w-full animate-in fade-in zoom-in duration-300'>
                            <NeonText className='text-green-400 text-base lg:text-lg font-bold text-center' glowColor='--color-green-500' glowSpread={0.5}>
                                {successMessage}
                            </NeonText>
                            <p className='text-white/70 text-sm mt-2 text-center'>
                                Closing in 2 seconds...
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {apiError && (
                        <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg w-full'>
                            <NeonText className='text-red-400 text-sm text-center'>
                                {apiError}
                            </NeonText>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='mb-2.5 w-full'>
                        <div className='mb-7 space-y-6.5'>
                            <div>
                                <Input
                                    type='text'
                                    placeholder='Full Name'
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    disabled={isSubmitting || !!successMessage}
                                    {...inputSettings}
                                />
                                {errors.name && (
                                    <NeonText className='text-red-400 text-sm mt-1 block'>
                                        {errors.name}
                                    </NeonText>
                                )}
                            </div>

                            <div>
                                <Input
                                    type='email'
                                    placeholder='Email Address'
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isSubmitting || !!successMessage}
                                    {...inputSettings}
                                />
                                {errors.email && (
                                    <NeonText className='text-red-400 text-sm mt-1 block'>
                                        {errors.email}
                                    </NeonText>
                                )}
                            </div>

                            <div>
                                <Input
                                    type='text'
                                    placeholder='Physical Address'
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={isSubmitting || !!successMessage}
                                    {...inputSettings}
                                />
                                {errors.address && (
                                    <NeonText className='text-red-400 text-sm mt-1 block'>
                                        {errors.address}
                                    </NeonText>
                                )}
                            </div>

                            <div>
                                <Input
                                    type='tel'
                                    placeholder='Phone Number'
                                    value={formData.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    disabled={isSubmitting || !!successMessage}
                                    {...inputSettings}
                                />
                                {errors.phone && (
                                    <NeonText className='text-red-400 text-sm mt-1 block'>
                                        {errors.phone}
                                    </NeonText>
                                )}
                            </div>
                        </div>

                        <div className='flex flex-col gap-4 mb-6 text-left'>
                            {/* Required Checkbox 1: Official Rules and Terms */}
                            <div className='site-checkbox flex items-start gap-3'>
                                <Checkbox 
                                    id='age-confirm' 
                                    checked={formData.agreed}
                                    onCheckedChange={(checked) => handleInputChange('agreed', checked as boolean)}
                                    disabled={isSubmitting || !!successMessage}
                                    className='mt-1'
                                />
                                <NeonText
                                    as='label'
                                    htmlFor='age-confirm'
                                    className='text-sm! lg:text-base! cursor-pointer'
                                    glowSpread={0.5}
                                >
                                    I have read and agree to the{' '}
                                    <Link
                                        href='/sweepstakes-rules'
                                        target='_blank'
                                        title='Sweepstakes Rules'
                                        className='underline hover:text-white'
                                    >
                                        Official Rules
                                    </Link>
                                    {' '}and{' '}
                                    <Link
                                        href='/terms-conditions'
                                        target='_blank'
                                        title='Terms & Conditions'
                                        className='underline hover:text-white'
                                    >
                                        Terms & Conditions
                                    </Link>
                                    . I confirm I am 21+ and in an eligible location.
                                </NeonText>
                            </div>
                            {errors.agreed && (
                                <NeonText className='text-red-400 text-sm ml-9'>
                                    {errors.agreed}
                                </NeonText>
                            )}

                            {/* Required Checkbox 2: No Purchase Necessary */}
                            <div className='site-checkbox flex items-start gap-3'>
                                <Checkbox 
                                    id='no-purchase' 
                                    checked={formData.noPurchase}
                                    onCheckedChange={(checked) => handleInputChange('noPurchase', checked as boolean)}
                                    disabled={isSubmitting || !!successMessage}
                                    className='mt-1'
                                />
                                <NeonText
                                    as='label'
                                    htmlFor='no-purchase'
                                    className='text-sm! lg:text-base! cursor-pointer'
                                    glowSpread={0.5}
                                >
                                    No purchase necessary to enter or win. A purchase does not increase chances of winning. Free entry (AMOE) is available as described in the Official Rules.
                                </NeonText>
                            </div>
                            {errors.noPurchase && (
                                <NeonText className='text-red-400 text-sm ml-9'>
                                    {errors.noPurchase}
                                </NeonText>
                            )}

                            {/* Optional Checkbox 3: Marketing Consent with Small Print */}
                            <div className='flex flex-col gap-2'>
                                <div className='site-checkbox flex items-start gap-3'>
                                    <Checkbox 
                                        id='marketing-consent' 
                                        checked={formData.acceptMarketing}
                                        onCheckedChange={(checked) => handleMarketingChange(checked as boolean)}
                                        disabled={isSubmitting || !!successMessage}
                                        className='mt-1'
                                    />
                                    <NeonText
                                        as='label'
                                        htmlFor='marketing-consent'
                                        className='text-sm! lg:text-base! cursor-pointer'
                                        glowSpread={0.5}
                                    >
                                        Yes, send me promos and updates by email or text. I can opt out anytime.
                                    </NeonText>
                                </div>

                                {/* Small print directly under optional checkbox */}
                                <NeonText className='text-xs text-white/70 leading-relaxed ml-9'>
                                    By opting in, I agree to receive marketing messages. Consent is not required to play. Reply STOP to opt out, HELP for help. Msg and data rates may apply. See{' '}
                                    <Link
                                        href='/privacy-policy'
                                        target='_blank'
                                        title='Privacy Policy'
                                        className='underline hover:text-white'
                                    >
                                        Privacy Policy
                                    </Link>
                                    .
                                </NeonText>
                            </div>
                        </div>

                        <div className='text-center mb-6 space-y-3'>
                            <NeonText
                                as='span'
                                className='text-sm! lg:text-base! capitalize font-bold block'
                                glowColor='--color-blue-500'
                                glowSpread={0.5}
                            >
                                You may only complete this form once every 7
                                days. Duplicate submissions will not be
                                accepted.
                            </NeonText>

                            <NeonText
                                as='span'
                                glowColor='--color-blue-500'
                                className='text-sm! lg:text-base! capitalize font-bold block'
                                glowSpread={0.5}
                            >
                                Limit: 1 free entry per person, per week.
                            </NeonText>
                        </div>

                        <Button 
                            type='submit'
                            size='lg' 
                            className='mb-8'
                            disabled={isSubmitting || !user?._id || !!successMessage}
                        >
                            {!user?._id ? 'Login to Claim' : isSubmitting ? 'Claiming...' : successMessage ? 'Success!' : 'Claim Free 1 SC'}
                        </Button>
                        <div className='flex justify-center'>
                            <NeonBox
                                className='py-3 px-5 inline-flex items-center rounded-md gap-2 justify-center max-xs:flex-wrap'
                                glowColor='--color-green-500'
                                backgroundColor='--color-green-500'
                                backgroundOpacity={0.2}
                            >
                                <NeonText
                                    as='span'
                                    className='text-lg capitalize font-bold'
                                    glowColor='--color-green-500'
                                    glowSpread={0.3}
                                >
                                    You currently have{' '}
                                </NeonText>
                                <Image
                                    src='/coins/sweep-coin.svg'
                                    height={20}
                                    width={20}
                                    alt='Sweep Coin'
                                />
                                <span className='text-lg capitalize font-extrabold text-green-400'>
                                    {user?.sweepCoins?.toLocaleString() || '0'}
                                </span>
                            </NeonBox>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </>
    );
}
