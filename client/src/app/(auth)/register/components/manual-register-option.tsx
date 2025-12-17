'use client';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Link } from 'next-transition-router';
import { useId, useState } from 'react';

import { inputSettings } from '@/app/(auth)/auth.style.config';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth-context';
import { statesData } from '@/data/states';
import { register as registerUser } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import { useTransitionRouter } from 'next-transition-router';

const ManualregisterOption = () => {
    const id = useId();
    const [open, setOpen] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        isAdult: false,
        acceptTerms: false,
        acceptSMSTerms: true,
        acceptSMSMarketing: false,
    });
    const router = useTransitionRouter();
    const { setLoggedIn, setUser } = useAuth();

    // Format phone number as user types: (XXX) XXX-XXXX
    const formatPhoneNumber = (value: string) => {
        const phoneNumber = value.replace(/\D/g, '');
        const limitedPhone = phoneNumber.slice(0, 10);

        if (limitedPhone.length <= 3) {
            return limitedPhone;
        } else if (limitedPhone.length <= 6) {
            return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3)}`;
        } else {
            return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3, 6)}-${limitedPhone.slice(6)}`;
        }
    };

    // Validate US phone number
    const validateUSPhone = (phone: string): boolean => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 10) return false;

        const areaCode = parseInt(digits.charAt(0));
        const centralOffice = parseInt(digits.charAt(3));

        return areaCode >= 2 && centralOffice >= 2;
    };

    // Validate all fields at once
    const validateForm = () => {
        const validationErrors: string[] = [];
        const newFieldErrors: Record<string, string> = {};

        // Full Name validation
        if (!form.fullName.trim()) {
            validationErrors.push('Full name is required');
            newFieldErrors.fullName = 'Full name is required';
        }

        // Email validation
        if (!form.email.trim()) {
            validationErrors.push('Email is required');
            newFieldErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            validationErrors.push('Please enter a valid email address');
            newFieldErrors.email = 'Invalid email format';
        }

        // Phone validation
        if (!form.phone.trim()) {
            validationErrors.push('Phone number is required');
            newFieldErrors.phone = 'Phone number is required';
        } else if (!validateUSPhone(form.phone)) {
            validationErrors.push(
                'Please enter a valid 10-digit US phone number'
            );
            newFieldErrors.phone = 'Invalid phone number';
        }

        // State validation
        if (!value) {
            validationErrors.push('Please select a state');
            newFieldErrors.state = 'State is required';
        }

        // Password validation
        if (!form.password) {
            validationErrors.push('Password is required');
            newFieldErrors.password = 'Password is required';
        } else if (form.password.length < 8) {
            validationErrors.push(
                'Password must be at least 8 characters long'
            );
            newFieldErrors.password = 'Password too short';
        }

        // Confirm Password validation
        if (!form.confirmPassword) {
            validationErrors.push('Please confirm your password');
            newFieldErrors.confirmPassword = 'Confirm password is required';
        } else if (form.password !== form.confirmPassword) {
            validationErrors.push('Passwords do not match');
            newFieldErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms validation
        if (!form.acceptTerms) {
            validationErrors.push(
                'Please accept the Terms & Conditions and Privacy Policy'
            );
            newFieldErrors.acceptTerms = 'You must accept the terms';
        }

        setFieldErrors(newFieldErrors);
        return validationErrors;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setForm(s => ({ ...s, phone: formatted }));
        if (fieldErrors.phone) {
            setFieldErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const clearFieldError = (fieldName: string) => {
        if (fieldErrors[fieldName]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
        // Also clear from general errors if it contains the field name
        if (errors.length > 0) {
            setErrors(prev =>
                prev.filter(
                    err => !err.toLowerCase().includes(fieldName.toLowerCase())
                )
            );
        }
    };

    return (
        <form
            action='#'
            className='mb-7.5 w-full'
            onSubmit={async e => {
                e.preventDefault();
                setErrors([]);
                setFieldErrors({});

                // Validate all fields at once
                const validationErrors = validateForm();

                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                    return;
                }

                setLoading(true);
                try {
                    const parts = form.fullName.trim().split(/\s+/);

                    let first = parts[0] || '';
                    let middle = parts[1] || '';
                    let last = parts.slice(2).join(' ') || '';

                    if (!last && middle) {
                        last = middle;
                        middle = '';
                    }

                    const phoneDigits = form.phone.replace(/\D/g, '');
                    const e164Phone = `+1${phoneDigits}`;

                    const payload = {
                        name: { first, middle, last },
                        email: form.email.toLowerCase(),
                        password: form.password,
                        phone: e164Phone,
                        state: value,
                        acceptSMSMarketing: form.acceptSMSMarketing,
                        acceptSMSTerms: form.acceptSMSTerms,
                        isOpted: form.acceptSMSMarketing,
                    };
                    const response = (await registerUser(payload)) as any;

                    if (response.success && response.data?.data?.user) {
                        setLoggedIn(true);
                        setUser(response.data.data.user);
                    }

                    router.push(
                        `/phone-verification?phone=${encodeURIComponent(form.phone)}`
                    );
                } catch (err: unknown) {
                    // Handle backend errors
                    const errorMessage =
                        err instanceof Error
                            ? err.message
                            : 'Registration failed';

                    // Split multiple errors if backend sends them separated by " | "
                    const errorMessages = errorMessage.includes(' | ')
                        ? errorMessage.split(' | ')
                        : [errorMessage];

                    const backendFieldErrors: Record<string, string> = {};

                    errorMessages.forEach(msg => {
                        const lowerMsg = msg.toLowerCase();
                        if (lowerMsg.includes('email')) {
                            backendFieldErrors.email = msg;
                        }
                        if (lowerMsg.includes('phone')) {
                            backendFieldErrors.phone = msg;
                        }
                        if (
                            lowerMsg.includes('state') ||
                            lowerMsg.includes('address')
                        ) {
                            backendFieldErrors.state = msg;
                        }
                    });

                    setErrors(errorMessages);
                    setFieldErrors(backendFieldErrors);
                } finally {
                    setLoading(false);
                }
            }}
        >
            <div className='mb-7 space-y-6.5'>
                {/* Show all errors at the top */}
                {errors.length > 0 && (
                    <div className='bg-red-500/10 border border-red-500 rounded-lg p-4'>
                        <p className='text-red-500 font-semibold mb-2'>
                            Please fix the following errors:
                        </p>
                        <ul className='list-disc list-inside space-y-1'>
                            {errors.map((error, index) => (
                                <li
                                    key={index}
                                    className='text-red-400 text-sm'
                                >
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Full Name */}
                <div>
                    <Input
                        type='text'
                        placeholder='Full Name'
                        {...inputSettings}
                        value={form.fullName}
                        onChange={e => {
                            setForm(s => ({ ...s, fullName: e.target.value }));
                            clearFieldError('fullName');
                        }}
                        className={fieldErrors.fullName ? 'border-red-500' : ''}
                    />
                    {fieldErrors.fullName && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.fullName}
                        </p>
                    )}
                </div>

                {/* Email Address */}
                <div>
                    <Input
                        type='email'
                        placeholder='Email Address'
                        {...inputSettings}
                        value={form.email}
                        onChange={e => {
                            setForm(s => ({ ...s, email: e.target.value }));
                            clearFieldError('email');
                        }}
                        className={fieldErrors.email ? 'border-red-500' : ''}
                    />
                    {fieldErrors.email && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* Phone Number with US Flag and +1 */}
                <div>
                    <div className='relative'>
                        <div className='absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2.5 pointer-events-none z-10'>
                            <span className='text-base leading-none'>🇺🇸</span>
                            <span className='text-white text-base font-medium'>
                                +1
                            </span>
                        </div>
                        <Input
                            type='tel'
                            {...inputSettings}
                            style={{ paddingLeft: '6rem' }}
                            value={form.phone}
                            onChange={e => {
                                handlePhoneChange(e);
                                clearFieldError('phone');
                            }}
                            inputMode='numeric'
                            className={
                                fieldErrors.phone ? 'border-red-500' : ''
                            }
                        />
                    </div>
                    {fieldErrors.phone && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.phone}
                        </p>
                    )}
                </div>

                {/* Select States */}
                <div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id={id}
                                role='combobox'
                                aria-expanded={open}
                                className='w-full px-6'
                                neonBoxClass={cn(
                                    'rounded-[8px]',
                                    fieldErrors.state && 'border-red-500'
                                )}
                                btnInnerClass='w-full'
                                variant='neon'
                                neon={true}
                                {...inputSettings}
                            >
                                <div className='flex w-full items-center justify-between'>
                                    <span
                                        className={cn(
                                            !value && 'text-white/80'
                                        )}
                                    >
                                        {value
                                            ? statesData.find(
                                                  state => state.value === value
                                              )?.label
                                            : 'Select State'}
                                    </span>

                                    <ChevronDownIcon
                                        size={16}
                                        className='shrink-0 text-white/60'
                                        aria-hidden='true'
                                    />
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
                            align='start'
                        >
                            <Command>
                                <CommandInput placeholder='Search States...' />
                                <CommandList>
                                    <CommandEmpty>No state found.</CommandEmpty>
                                    <CommandGroup>
                                        {statesData.map(state => (
                                            <CommandItem
                                                key={state.value}
                                                value={state.value}
                                                onSelect={currentValue => {
                                                    setValue(
                                                        currentValue === value
                                                            ? ''
                                                            : currentValue
                                                    );
                                                    setOpen(false);
                                                    clearFieldError('state');
                                                }}
                                            >
                                                {state.label}
                                                {value === state.value && (
                                                    <CheckIcon
                                                        size={16}
                                                        className='ml-auto'
                                                    />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {fieldErrors.state && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.state}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <Input
                        type='password'
                        placeholder='Password'
                        {...inputSettings}
                        value={form.password}
                        onChange={e => {
                            setForm(s => ({ ...s, password: e.target.value }));
                            clearFieldError('password');
                        }}
                        className={fieldErrors.password ? 'border-red-500' : ''}
                    />
                    {fieldErrors.password && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <Input
                        type='password'
                        placeholder='Confirm Password'
                        {...inputSettings}
                        value={form.confirmPassword}
                        onChange={e => {
                            setForm(s => ({
                                ...s,
                                confirmPassword: e.target.value,
                            }));
                            clearFieldError('confirmPassword');
                        }}
                        className={
                            fieldErrors.confirmPassword ? 'border-red-500' : ''
                        }
                    />
                    {fieldErrors.confirmPassword && (
                        <p className='text-red-400 text-xs mt-1'>
                            {fieldErrors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Terms and SMS Consent */}
                <div className='flex flex-col gap-4'>
                    {/* Terms and Conditions */}
                    <div className='site-checkbox flex items-center gap-3'>
                        <Checkbox
                            id='terms-policy'
                            checked={form.acceptTerms}
                            onCheckedChange={v => {
                                setForm(s => ({
                                    ...s,
                                    acceptTerms: Boolean(v),
                                }));
                                clearFieldError('acceptTerms');
                            }}
                        />
                        <NeonText
                            as='label'
                            htmlFor='terms-policy'
                            className={cn(
                                'text-sm! lg:text-base!',
                                fieldErrors.acceptTerms && 'text-red-400'
                            )}
                            glowSpread={0.5}
                        >
                            I confirm I am 21+ and accept the{' '}
                            <Link
                                href='/terms-conditions'
                                title='Terms & Conditions'
                            >
                                Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href='/privacy-policy' title='Privacy Policy'>
                                Privacy Policy
                            </Link>
                            .
                        </NeonText>
                    </div>

                    {/* Marketing SMS Consent */}
                    <div className='site-checkbox flex items-center gap-3'>
                        <Checkbox
                            id='sms-marketing-terms'
                            checked={form.acceptSMSMarketing}
                            onCheckedChange={v =>
                                setForm(s => ({
                                    ...s,
                                    acceptSMSMarketing: Boolean(v),
                                }))
                            }
                        />
                        <NeonText
                            as='label'
                            htmlFor='sms-marketing-terms'
                            className='text-sm! lg:text-base!'
                            glowSpread={0.5}
                        >
                            (Optional) I agree to receive marketing SMS from
                            GTOA. Frequency varies. Msg & data rates may apply.
                            Consent is not a condition of purchase. Reply STOP
                            to unsubscribe or HELP for assistance.
                        </NeonText>
                    </div>

                    {/* Account-related SMS Disclaimer */}
                    <NeonBox
                        className='p-4 rounded-lg'
                        glowColor='--color-blue-500'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                        glowSpread={0.3}
                        borderWidth={1}
                    >
                        <NeonText className='text-sm text-white/90 leading-relaxed'>
                            By registering, you'll receive account-related SMS
                            from GTOA (such as verification codes, password
                            resets, receipts, or security alerts). These are not
                            marketing messages. Msg & data rates may apply.
                            Reply{' '}
                            <span className='text-yellow-400 font-semibold'>
                                STOP
                            </span>{' '}
                            to opt out or{' '}
                            <span className='text-yellow-400 font-semibold'>
                                HELP
                            </span>{' '}
                            for help.
                        </NeonText>
                    </NeonBox>
                </div>
            </div>

            {/* Register Button */}
            <div className='flex justify-center'>
                <Button size='md' type='submit' animate disabled={loading}>
                    {loading ? 'Registering...' : 'Register Account'}
                </Button>
            </div>
        </form>
    );
};

export default ManualregisterOption;
