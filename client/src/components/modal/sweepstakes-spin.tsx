import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { updateProfile } from '@/lib/api/auth';
import { http } from '@/lib/api/http';
import type { InputStylePreset } from '@/types/content.types';
import { Link } from 'next-transition-router';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DialogClose, DialogContent, DialogTitle } from '../ui/dialog';

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
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Pre-fill form with user data if logged in
    useEffect(() => {
        if (user) {
            const fullName = [
                user.name?.first,
                user.name?.middle,
                user.name?.last,
            ]
                .filter(Boolean)
                .join(' ');

            setFormData(prev => ({
                ...prev,
                name: fullName || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

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
        if (name.trim().length > 100)
            return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(name.trim()))
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim()))
            return 'Please enter a valid email address';
        return undefined;
    };

    const validateAddress = (address: string): string | undefined => {
        if (!address.trim()) return 'Address is required';
        if (address.trim().length < 5)
            return 'Address must be at least 5 characters';
        if (address.trim().length > 200)
            return 'Address must be less than 200 characters';
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
            newErrors.agreed =
                'Please accept the Official Rules and Terms & Conditions';
        }

        if (!formData.noPurchase) {
            newErrors.noPurchase =
                'Please acknowledge the No Purchase Necessary terms';
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | boolean
    ) => {
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

        // If user is logged in and opts in, update their profile immediately (only if not already opted in)
        if (checked && user?._id && !user?.isSmsOpted && !user?.isOpted) {
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
                acceptMarketing: formData.acceptMarketing,
            };

            const response = (await http('/claim/sweep-daily-bonus', {
                method: 'POST',
                body: payload,
            })) as ApiResponse;

            if (response.success) {
                setIsSubmitted(true);
                setSuccessMessage(
                    'Your free Sweeps entry has been submitted. To claim and view any Sweeps Coins issued from this entry, please log in or create an account using the same email.'
                );
            } else {
                throw new Error(
                    response.message || 'Failed to submit sweepstakes entry'
                );
            }
        } catch (error: any) {
            console.error('Sweepstakes claim error:', error.response);

            // Handle different types of errors
            let errorMessage =
                'Failed to submit sweepstakes entry. Please try again.';

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

    const handleLoginRedirect = () => {
        // Close the modal and redirect to login
        if (closeButtonRef.current) {
            closeButtonRef.current.click();
        }
        // Navigate to login page - adjust this path based on your routing
        window.location.href = '/login';
    };

    const handleSignupRedirect = () => {
        // Close the modal and redirect to signup
        if (closeButtonRef.current) {
            closeButtonRef.current.click();
        }
        // Navigate to signup page - adjust this path based on your routing
        window.location.href = '/signup';
    };

    return (
        <>
            <DialogContent className='sm:max-w-[600px]! max-w-[calc(100%-40px)]'>
                {/* Hidden close button for programmatic closing */}
                <DialogClose ref={closeButtonRef} className='hidden' />

                <div className='px-5 py-3 flex flex-col items-center text-center'>
                    {!isSubmitted ? (
                        <>
                            <DialogTitle className='mb-4' asChild>
                                <NeonText as='h4' className='h4-title'>
                                    Claim 1 Free Sweepstakes Entry Today!
                                </NeonText>
                            </DialogTitle>
                            <p className='text-base font-bold leading-7.5 capitalize mb-5'>
                                Unlock your chance to win no purchase needed.
                                Just tell us a bit about you.
                            </p>

                            {/* Error Message */}
                            {apiError && (
                                <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg w-full'>
                                    <NeonText className='text-red-400 text-sm text-center'>
                                        {apiError}
                                    </NeonText>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className='mb-2.5 w-full'
                            >
                                <div className='mb-7 space-y-6.5'>
                                    <div>
                                        <Input
                                            type='text'
                                            placeholder='Full Name'
                                            value={formData.name}
                                            onChange={e =>
                                                handleInputChange(
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitting}
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
                                            onChange={e =>
                                                handleInputChange(
                                                    'email',
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitting}
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
                                            onChange={e =>
                                                handleInputChange(
                                                    'address',
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitting}
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
                                            onChange={e =>
                                                handlePhoneChange(
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitting}
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
                                            onCheckedChange={checked =>
                                                handleInputChange(
                                                    'agreed',
                                                    checked as boolean
                                                )
                                            }
                                            disabled={isSubmitting}
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
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                href='/terms-conditions'
                                                target='_blank'
                                                title='Terms & Conditions'
                                                className='underline hover:text-white'
                                            >
                                                Terms & Conditions
                                            </Link>
                                            . I confirm I am 21+ and in an
                                            eligible location.
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
                                            onCheckedChange={checked =>
                                                handleInputChange(
                                                    'noPurchase',
                                                    checked as boolean
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className='mt-1'
                                        />
                                        <NeonText
                                            as='label'
                                            htmlFor='no-purchase'
                                            className='text-sm! lg:text-base! cursor-pointer'
                                            glowSpread={0.5}
                                        >
                                            No purchase necessary to enter or
                                            win. A purchase does not increase
                                            chances of winning. Free entry
                                            (AMOE) is available as described in
                                            the Official Rules.
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
                                                checked={
                                                    formData.acceptMarketing
                                                }
                                                onCheckedChange={checked =>
                                                    handleMarketingChange(
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={isSubmitting}
                                                className='mt-1'
                                            />
                                            <NeonText
                                                as='label'
                                                htmlFor='marketing-consent'
                                                className='text-sm! lg:text-base! cursor-pointer'
                                                glowSpread={0.5}
                                            >
                                                Yes, send me promos and updates
                                                by email or text. I can opt out
                                                anytime.
                                            </NeonText>
                                        </div>

                                        {/* Small print directly under optional checkbox */}
                                        <NeonText className='text-xs text-white/70 leading-relaxed ml-9'>
                                            By opting in, I agree to receive
                                            marketing messages. Consent is not
                                            required to play. Reply STOP to opt
                                            out, HELP for help. Msg and data
                                            rates may apply. See{' '}
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
                                        You may only complete this form once
                                        every 7 days. Duplicate submissions will
                                        not be accepted.
                                    </NeonText>

                                    <NeonText
                                        as='span'
                                        glowColor='--color-blue-500'
                                        className='text-sm! lg:text-base! capitalize font-bold block'
                                        glowSpread={0.5}
                                    >
                                        Limit: 1 free entry per person, per
                                        week.
                                    </NeonText>
                                </div>

                                <Button
                                    type='submit'
                                    size='lg'
                                    className='mb-8'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : 'Submit Free Entry'}
                                </Button>

                                {user?._id && (
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
                                                {user?.sweepCoins?.toLocaleString() ||
                                                    '0'}
                                            </span>
                                        </NeonBox>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success Confirmation Screen - Ultra Compact to Fit in One View */}
                            <div className='flex flex-col items-center justify-center text-center py-6 px-6 bg-gradient-to-b from-purple-950/80 to-black/95'>
                                <DialogTitle className='mb-4' asChild>
                                    <h1
                                        className='text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-wide'
                                        style={{
                                            color: '#E9D5FF',
                                            textShadow:
                                                '0 0 15px rgba(168, 85, 247, 0.8), 0 0 30px rgba(168, 85, 247, 0.5)',
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        YOUR FREE ENTRY
                                        <br />
                                        HAS BEEN
                                        <br />
                                        SUBMITTED!
                                    </h1>
                                </DialogTitle>

                                <p className='text-sm md:text-base leading-snug mb-6 max-w-md text-purple-100/90 px-2'>
                                    Thank you! Your free entry has been
                                    received. To view and claim any Sweeps Coins
                                    issued from this entry, please log in or
                                    create an account using the same email you
                                    entered.
                                </p>

                                {!user?._id ? (
                                    <div className='flex flex-col gap-3 w-full max-w-md px-4'>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className='w-full py-3.5 text-base md:text-lg font-black uppercase rounded-xl transition-all duration-300'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #FFA726 0%, #FF6F00 100%)',
                                                color: '#1A0933',
                                                boxShadow:
                                                    '0 6px 24px rgba(255, 111, 0, 0.4), 0 0 15px rgba(255, 167, 38, 0.3)',
                                                border: 'none',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            LOG IN TO CLAIM
                                        </button>
                                        <button
                                            onClick={handleSignupRedirect}
                                            className='w-full py-3.5 text-base md:text-lg font-black uppercase rounded-xl transition-all duration-300'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
                                                color: '#1A0933',
                                                boxShadow:
                                                    '0 6px 24px rgba(0, 200, 83, 0.4), 0 0 15px rgba(0, 230, 118, 0.3)',
                                                border: 'none',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            CREATE ACCOUNT TO CLAIM
                                        </button>
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-3 w-full max-w-md px-4'>
                                        <p className='text-base font-bold text-green-400 mb-1'>
                                            You're already logged in! Your
                                            Sweeps Coins will be credited
                                            shortly.
                                        </p>
                                        <button
                                            onClick={() =>
                                                closeButtonRef.current?.click()
                                            }
                                            className='w-full py-3.5 text-base md:text-lg font-black uppercase rounded-xl transition-all duration-300'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)',
                                                color: '#FFFFFF',
                                                boxShadow:
                                                    '0 6px 24px rgba(123, 31, 162, 0.4), 0 0 15px rgba(171, 71, 188, 0.3)',
                                                border: 'none',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </>
    );
}
