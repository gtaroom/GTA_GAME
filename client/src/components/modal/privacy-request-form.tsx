import { useId } from 'react';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

export default function PrivacyRequestForm() {
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
        backgroundOpacity: 0.08,
        borderColor: 'var(--color-white)',
    };

    const id = useId();

    const FormLabel = ({ children }: { children: React.ReactNode }) => (
        <NeonText
            as='span'
            className='text-start w-full block mb-3 text-base font-bold'
        >
            {children}
        </NeonText>
    );

    return (
        <DialogContent className='sm:max-w-[600px]! max-w-[calc(100%-40px)]'>
            <div className='px-5 py-3 flex flex-col items-center text-center'>
                <DialogTitle className='mb-4' asChild>
                    <NeonText as='h4' className='h4-title'>
                        Privacy Request Form
                    </NeonText>
                </DialogTitle>
                <NeonText
                    className='text-xl uppercase font-bold mb-2'
                    glowColor='--color-blue-500'
                >
                    We respect your privacy.
                </NeonText>
                <p className='text-base font-bold leading-7.5 capitalize mb-5'>
                    Use this form to request access, correction, deletion, or
                    other actions regarding your personal information. We’ll
                    review your request and respond within the timeframe
                    required by law.
                </p>

                <form className='w-full'>
                    <div className='mb-7 space-y-6.5'>
                        <Input
                            type='text'
                            placeholder='Full Name'
                            {...inputSettings}
                        />

                        <Input
                            type='email'
                            placeholder='Email Address (linked to your account)'
                            {...inputSettings}
                        />

                        <Input
                            type='number'
                            placeholder='Phone Number (optional)'
                            {...inputSettings}
                        />

                        <Input
                            type='text'
                            placeholder='Account Username / ID (if applicable)'
                            {...inputSettings}
                        />
                    </div>

                    <div className='space-y-1 mb-6'>
                        <FormLabel>
                            What would you like to do? (check all that apply)
                        </FormLabel>
                        <RadioGroup defaultValue='6' className='mb-6'>
                            {[
                                'Access my data',
                                'Correct my information',
                                'Delete my data',
                                'Opt-out of sale/sharing of personal info',
                                ' Limit use of sensitive personal info',
                                'Do not send me marketing communications',
                                'Other',
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-3'
                                >
                                    <RadioGroupItem
                                        value={`${index}`}
                                        id={`${id}-${index}`}
                                    />
                                    <NeonText
                                        as='label'
                                        htmlFor={`${id}-${index}`}
                                        className='cursor-pointer font-semibold text-base'
                                    >
                                        {item}
                                    </NeonText>
                                </div>
                            ))}
                        </RadioGroup>
                        <Textarea placeholder='Please Specify' size='md' />
                    </div>

                    <div className='space-y-1 mb-6'>
                        <FormLabel>
                            Authorized Agent Are you submitting this request on
                            behalf of someone else?
                        </FormLabel>
                        <RadioGroup defaultValue='1' className='mb-6'>
                            {[
                                'Yes (please provide your name and contact info below)',
                                'No',
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-3'
                                >
                                    <RadioGroupItem
                                        value={`${index}`}
                                        id={`${id}-${index}`}
                                    />
                                    <NeonText
                                        as='label'
                                        htmlFor={`${id}-${index}`}
                                        className='cursor-pointer font-semibold text-base'
                                    >
                                        {item}
                                    </NeonText>
                                </div>
                            ))}
                        </RadioGroup>
                        <Textarea
                            placeholder='Name and Contact Info'
                            size='md'
                        />
                    </div>

                    <div className='mb-6'>
                        <FormLabel>Verification</FormLabel>

                        <div className='site-checkbox flex items-start text-start gap-3'>
                            <Checkbox id='terms-policy' className='mt-1' />
                            <NeonText
                                as='label'
                                htmlFor='terms-policy'
                                className='text-sm! lg:text-base!'
                                glowSpread={0.5}
                            >
                                {' '}
                                I declare under penalty of perjury that the
                                information provided is true and that I am the
                                account holder or authorized agent making this
                                request.
                            </NeonText>
                        </div>
                    </div>

                    <div className='space-y-1 mb-6'>
                        <FormLabel>Preferred Response Method</FormLabel>
                        <RadioGroup defaultValue='6' className='mb-6'>
                            {['Email', 'Mail', 'Both'].map((item, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-3'
                                >
                                    <RadioGroupItem
                                        value={`${index}`}
                                        id={`${id}-${index}`}
                                    />
                                    <NeonText
                                        as='label'
                                        htmlFor={`${id}-${index}`}
                                        className='cursor-pointer font-semibold text-base'
                                    >
                                        {item}
                                    </NeonText>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <Button size='lg'>Submit Request</Button>
                </form>
            </div>
        </DialogContent>
    );
}
