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
    const [error, setError] = useState<string>('');
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
        // Remove all non-digits
        const phoneNumber = value.replace(/\D/g, '');

        // Limit to 10 digits
        const limitedPhone = phoneNumber.slice(0, 10);

        // Format based on length
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

        // Area code and central office code cannot start with 0 or 1
        const areaCode = parseInt(digits.charAt(0));
        const centralOffice = parseInt(digits.charAt(3));

        return areaCode >= 2 && centralOffice >= 2;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setForm(s => ({ ...s, phone: formatted }));
    };

    return (
        <form
            action='#'
            className='mb-7.5 w-full'
            onSubmit={async e => {
                e.preventDefault();
                setError('');
                if (!form.acceptTerms) {
                    setError(
                        'Please accept the Terms & Conditions and Privacy Policy.'
                    );
                    return;
                }
                if (form.password !== form.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                // Validate US phone number
                if (!validateUSPhone(form.phone)) {
                    setError('Please enter a valid 10-digit US phone number.');
                    return;
                }
                setLoading(true);
                try {
                    const parts = form.fullName.trim().split(/\s+/);

                    let first = parts[0] || '';
                    let middle = parts[1] || '';
                    let last = parts.slice(2).join(' ') || '';

                    // if no last name but there is a middle, treat middle as last
                    if (!last && middle) {
                        last = middle;
                        middle = '';
                    }

                    // Convert phone to E.164 format
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

                    // If registration includes user data and cookies are set, mark as logged in
                    if (response.success && response.data?.data?.user) {
                        setLoggedIn(true);
                        setUser(response.data.data.user);
                    }

                    router.push(
                        `/email-verification?email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}`
                    );
                } catch (err: unknown) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Registration failed'
                    );
                } finally {
                    setLoading(false);
                }
            }}
        >
            <div className='mb-7 space-y-6.5'>
                {/* Full Name */}
                <Input
                    type='text'
                    placeholder='Full Name'
                    {...inputSettings}
                    value={form.fullName}
                    onChange={e =>
                        setForm(s => ({ ...s, fullName: e.target.value }))
                    }
                />

                {/* Email Address */}
                <Input
                    type='email'
                    placeholder='Email Address'
                    {...inputSettings}
                    value={form.email}
                    onChange={e =>
                        setForm(s => ({ ...s, email: e.target.value }))
                    }
                />

                {/* Phone Number with US Flag and +1 */}
                <div className='relative'>
                    <div className='absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2.5 pointer-events-none z-10'>
                        <span className='text-base leading-none'>🇺🇸</span>
                        <span className='text-white text-base font-medium'>
                            +1
                        </span>
                    </div>
                    <Input
                        type='tel'
                        // placeholder='(555) 123-4567'
                        {...inputSettings}
                        style={{ paddingLeft: '6rem' }}
                        value={form.phone}
                        onChange={handlePhoneChange}
                        inputMode='numeric'
                    />
                </div>

                {/* Select States */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id={id}
                            role='combobox'
                            aria-expanded={open}
                            className='w-full px-6'
                            neonBoxClass='rounded-[8px]'
                            btnInnerClass='w-full'
                            variant='neon'
                            neon={true}
                            {...inputSettings}
                        >
                            <div className='flex w-full items-center justify-between'>
                                <span className={cn(!value && 'text-white/80')}>
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

                {/* Password */}
                <Input
                    type='password'
                    placeholder='Password'
                    {...inputSettings}
                    value={form.password}
                    onChange={e =>
                        setForm(s => ({ ...s, password: e.target.value }))
                    }
                />

                {/* Confirm Password */}
                <Input
                    type='password'
                    placeholder='Confirm Password'
                    {...inputSettings}
                    value={form.confirmPassword}
                    onChange={e =>
                        setForm(s => ({
                            ...s,
                            confirmPassword: e.target.value,
                        }))
                    }
                />

                {/* Terms and SMS Consent */}
                <div className='flex flex-col gap-4'>
                    {/* Terms and Conditions */}
                    <div className='site-checkbox flex items-center gap-3'>
                        <Checkbox
                            id='terms-policy'
                            checked={form.acceptTerms}
                            onCheckedChange={v =>
                                setForm(s => ({
                                    ...s,
                                    acceptTerms: Boolean(v),
                                }))
                            }
                        />
                        <NeonText
                            as='label'
                            htmlFor='terms-policy'
                            className='text-sm! lg:text-base!'
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
                            I agree to receive marketing SMS from GTOA.
                            Frequency varies. Msg & data rates may apply.
                            Consent is not a condition of purchase.
                            <br />
                            Reply STOP to unsubscribe or HELP for assistance.
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
                            By registering, you agree to receive account-related
                            SMS from GTOA (such as verification codes, password
                            resets, receipts, or security alerts). These are not
                            marketing messages. Msg & data rates may apply.
                            Reply{' '}
                            <span className='text-yellow-400 font-semibold'>
                                STOP
                            </span>{' '}
                            to unsubscribe,{' '}
                            <span className='text-yellow-400 font-semibold'>
                                HELP
                            </span>{' '}
                            for help.
                        </NeonText>
                    </NeonBox>
                </div>
                {error && (
                    <p className='text-red-500 text-base font-semibold'>
                        {error}
                    </p>
                )}
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
