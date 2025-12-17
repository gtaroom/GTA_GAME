'use client';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { statesData } from '@/data/states';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Link } from 'next-transition-router';
import { useState } from 'react';

function PartnershipForm() {
    const [open, setOpen] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');

    interface InputSettingsProps {
        size: 'sm' | 'md' | 'lg';
        glowColor: string;
        glowSpread: number;
        backgroundColor: string;
        backgroundOpacity: number;
        borderColor: string;
    }

    const inputSettings: InputSettingsProps = {
        size: 'md',
        glowColor: 'var(--color-purple-500)',
        glowSpread: 0.5,
        backgroundColor: 'var(--color-purple-500)',
        backgroundOpacity: 0,
        borderColor: 'var(--color-white)',
    };

    return (
        <section className='mb-14 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Apply for Partnership
                </NeonText>

                <div className='flex justify-center'>
                    <NeonBox
                        className='max-w-[900px] w-full p-[24px] lg:p-[60px] md:p-[40px] max-auto rounded-2xl backdrop-blur-2xl'
                        backgroundColor='--color-purple-500'
                        glowColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <form action='#'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                <Input
                                    type='text'
                                    placeholder='Full Name'
                                    {...inputSettings}
                                />

                                <Input
                                    type='email'
                                    placeholder='Email Address'
                                    {...inputSettings}
                                />

                                <Input
                                    type='text'
                                    placeholder='Company Name'
                                    {...inputSettings}
                                />

                                <Input
                                    type='text'
                                    placeholder='Primary Website*'
                                    {...inputSettings}
                                />

                                <Select>
                                    <SelectTrigger
                                        showIcon={false}
                                        className='font-bold!'
                                    >
                                        <NeonBox
                                            className='py-3 px-4 md:px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none  flex-1 text-left'
                                            glowColor='--color-purple-500'
                                            backgroundColor='--color-purple-500'
                                            backgroundOpacity={0.2}
                                            glowSpread={0.8}
                                            enableHover
                                        >
                                            <SelectValue
                                                className='text-base bg-red-500! p-5!'
                                                placeholder='Monthly Traffic Volume'
                                            />

                                            <Icon
                                                icon='lucide:chevron-down'
                                                fontSize={24}
                                            />
                                        </NeonBox>
                                    </SelectTrigger>
                                    <SelectContent className='font-bold!'>
                                        {[
                                            '0–1,000',
                                            '1,001–10,000',
                                            '10,001–50,000',
                                            '50,001–100,000',
                                            '100,001+',
                                        ].map((item, index) => (
                                            <SelectItem
                                                className='font-bold'
                                                key={index}
                                                value={item}
                                            >
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select>
                                    <SelectTrigger
                                        showIcon={false}
                                        className='font-bold!'
                                    >
                                        <NeonBox
                                            className='py-3 px-4 md:px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none  flex-1 text-left'
                                            glowColor='--color-purple-500'
                                            backgroundColor='--color-purple-500'
                                            backgroundOpacity={0.2}
                                            glowSpread={0.8}
                                            enableHover
                                        >
                                            <SelectValue
                                                className='text-base bg-red-500! p-5!'
                                                placeholder='Preferred Commission Model*'
                                            />

                                            <Icon
                                                icon='lucide:chevron-down'
                                                fontSize={24}
                                            />
                                        </NeonBox>
                                    </SelectTrigger>
                                    <SelectContent className='font-bold!'>
                                        {[
                                            'Revenue Share',
                                            'CPA (Cost Per Acquisition)',
                                            'Hybrid Model',
                                        ].map((item, index) => (
                                            <SelectItem
                                                className='font-bold'
                                                key={index}
                                                value={item}
                                            >
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            role='combobox'
                                            aria-expanded={open}
                                            className='w-full px-4 md:px-5'
                                            neonBoxClass='rounded-[8px]'
                                            btnInnerClass='w-full'
                                            variant='neon'
                                            neon={true}
                                            {...inputSettings}
                                        >
                                            <div className='flex w-full items-center justify-between'>
                                                <span
                                                    className={cn(
                                                        !value &&
                                                            'text-white/80'
                                                    )}
                                                >
                                                    {value
                                                        ? statesData.find(
                                                              state =>
                                                                  state.value ===
                                                                  value
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
                                                <CommandEmpty>
                                                    No state found.
                                                </CommandEmpty>

                                                <CommandGroup>
                                                    {statesData.map(state => (
                                                        <CommandItem
                                                            key={state.value}
                                                            value={state.value}
                                                            onSelect={currentValue => {
                                                                setValue(
                                                                    currentValue ===
                                                                        value
                                                                        ? ''
                                                                        : currentValue
                                                                );
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            {state.label}
                                                            {value ===
                                                                state.value && (
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

                                <Select>
                                    <SelectTrigger
                                        showIcon={false}
                                        className='font-bold!'
                                    >
                                        <NeonBox
                                            className='py-3 px-4 md:px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none  flex-1 text-left'
                                            glowColor='--color-purple-500'
                                            backgroundColor='--color-purple-500'
                                            backgroundOpacity={0.2}
                                            glowSpread={0.8}
                                            enableHover
                                        >
                                            <SelectValue
                                                className='text-base bg-red-500! p-5!'
                                                placeholder='Payment Method *'
                                            />

                                            <Icon
                                                icon='lucide:chevron-down'
                                                fontSize={24}
                                            />
                                        </NeonBox>
                                    </SelectTrigger>
                                    <SelectContent className='font-bold!'>
                                        {[
                                            'PayPal',
                                            'Bank Transfer',
                                            'Cryptocurrency',
                                            'Others',
                                        ].map((item, index) => (
                                            <SelectItem
                                                className='font-bold'
                                                key={index}
                                                value={item}
                                            >
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Textarea
                                className='h-[140px]! mb-6'
                                {...inputSettings}
                                placeholder='Tell us about your affiliate experience'
                            />

                            {/* Age, Terms, Policy Checkbox */}

                            <div className='site-checkbox flex items-center gap-3 mb-10'>
                                <Checkbox id='affiliate-terms' />
                                <NeonText
                                    as='label'
                                    htmlFor='affiliate-terms'
                                    className='text-sm! lg:text-base!'
                                    glowSpread={0.5}
                                >
                                    I agree to the{' '}
                                    <Link
                                        href='/affiliate-terms'
                                        title='Affiliate Terms & Conditions'
                                    >
                                        Affiliate Terms & Conditions
                                    </Link>{' '}
                                    and confirm that all information provided is
                                    accurate.
                                </NeonText>
                            </div>

                            <div className='flex items-center justify-center'>
                                <Button size='lg' type='submit'>
                                    Become a Partner
                                </Button>
                            </div>
                        </form>
                    </NeonBox>
                </div>
            </div>
        </section>
    );
}

export default PartnershipForm;
