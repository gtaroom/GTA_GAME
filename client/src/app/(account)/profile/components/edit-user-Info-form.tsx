import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { statesData } from '@/data/states';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile } from '@/lib/api/auth';
import NeonText from '@/components/neon/neon-text';
import { Checkbox } from '@/components/ui/checkbox';
import { inputSettings } from '@/app/(auth)/auth.style.config';

export default function EditUserInfoForm() {
    const { user, setUser } = useAuth();
    const [open, setOpen] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize form with user data
    const [form, setForm] = useState({
        firstName: user?.name?.first || '',
        middleName: user?.name?.middle || '',
        lastName: user?.name?.last || '',
        phone: user?.phone || '',
        state: user?.state || '',
        acceptSMSTerms: user?.acceptSMSTerms || false,
        acceptSMSMarketing: user?.acceptSMSMarketing || false,
    });

    // Update form when user data changes
    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.name?.first || '',
                middleName: user.name?.middle || '',
                lastName: user.name?.last || '',
                phone: user.phone || '',
                state: user.state || '',
                acceptSMSTerms: user.acceptSMSTerms || false,
                acceptSMSMarketing: user.acceptSMSMarketing || false,
            });
            setValue(user.state || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!form.firstName || !form.lastName || !form.phone) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: {
                    first: form.firstName,
                    middle: form.middleName,
                    last: form.lastName,
                },
                phone: form.phone,
                state: form.state,
                acceptSMSTerms: form.acceptSMSTerms,
                acceptSMSMarketing: form.acceptSMSMarketing,
            };

            const response = await updateProfile(payload) as any;
            
            if (response.success) {
                setSuccess('Profile updated successfully!');
                // Update user context with new data
                if (user) {
                    setUser({
                        ...user,
                        name: payload.name,
                        phone: payload.phone,
                        state: payload.state,
                        acceptSMSTerms: payload.acceptSMSTerms,
                        acceptSMSMarketing: payload.acceptSMSMarketing,
                    });
                }
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
        setSuccess('');
    };

    const handleCheckboxChange = (field: keyof Pick<typeof form, 'acceptSMSTerms' | 'acceptSMSMarketing'>) => (checked: boolean) => {
        setForm(prev => ({ ...prev, [field]: checked }));
        setError('');
        setSuccess('');
    };

    return (
        <div className='sm:px-4 sm:mb-3 mb-1'>
            <form onSubmit={handleSubmit}>
                <div className='mb-7 space-y-6.5'>
                    {/* First Name */}
                        <Input
                            type='text'
                            placeholder='First Name'
                        value={form.firstName}
                        onChange={handleInputChange('firstName')}
                            {...inputSettings}
                        />

                    {/* Middle Name */}
                        <Input
                            type='text'
                            placeholder='Middle Name'
                        value={form.middleName}
                        onChange={handleInputChange('middleName')}
                            {...inputSettings}
                        />

                    {/* Last Name */}
                        <Input
                            type='text'
                            placeholder='Last Name'
                        value={form.lastName}
                        onChange={handleInputChange('lastName')}
                            {...inputSettings}
                        />

                    {/* Phone Number */}
                        <Input
                        type='tel'
                        placeholder='Phone Number'
                        value={form.phone}
                        onChange={handleInputChange('phone')}
                            {...inputSettings}
                        />

                    {/* State Selection */}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
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
                                                    setForm(prev => ({ ...prev, state: currentValue === value ? '' : currentValue }));
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

                    {/* Subscription Preferences */}
                    <div className='space-y-4'>
                        <NeonText className='text-lg font-bold mb-4'>
                            Subscription Preferences
                        </NeonText>
                        
                        <div className='site-checkbox flex items-center gap-3'>
                            <Checkbox
                                id='sms-terms-policy'
                                checked={form.acceptSMSTerms}
                                onCheckedChange={handleCheckboxChange('acceptSMSTerms')}
                            />
                            <NeonText
                                as='label'
                                htmlFor='sms-terms-policy'
                                className='text-sm! lg:text-base!'
                                glowSpread={0.5}
                            >
                                I agree to receive account-related SMS from GTOA
                                (verification codes, password resets, receipts, security
                                alerts). No marketing messages. Reply STOP to
                                unsubscribe, HELP for help.
                            </NeonText>
                    </div>

                        <div className='site-checkbox flex items-center gap-3'>
                            <Checkbox
                                id='sms-marketing-terms'
                                checked={form.acceptSMSMarketing}
                                onCheckedChange={handleCheckboxChange('acceptSMSMarketing')}
                            />
                            <NeonText
                                as='label'
                                htmlFor='sms-marketing-terms'
                                className='text-sm! lg:text-base!'
                                glowSpread={0.5}
                            >
                                I agree to receive marketing SMS from GTOA. Frequency
                                varies. Msg & data rates may apply. Consent is not a
                                condition of purchase. Reply STOP to unsubscribe, HELP
                                for help.
                            </NeonText>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <NeonText className="text-red-400 text-sm">
                                {error}
                            </NeonText>
                    </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <NeonText className="text-green-400 text-sm">
                                {success}
                            </NeonText>
                    </div>
                    )}
                </div>

                <div className='flex justify-center'>
                    <Button 
                        size='lg' 
                        type='submit' 
                        animate
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
