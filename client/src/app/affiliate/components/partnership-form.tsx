'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { useTransitionRouter } from 'next-transition-router';
import { useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import NeonIcon from '@/components/neon/neon-icon';

const PROMOTION_METHODS = [
    'Social Media',
    'Email Marketing',
    'Content Marketing',
    'Paid Advertising',
    'Influencer Partnerships',
    'Website/Blog',
    'Other',
];

const AUDIENCE_SIZE_OPTIONS = [
    '0–1,000',
    '1,001–10,000',
    '10,001–50,000',
    '50,001–100,000',
    '100,001–500,000',
    '500,001+',
];

function PartnershipForm() {
    const router = useTransitionRouter();
    const { submitApplication, isSubmitting } = useAffiliate();

    // Form state matching backend IAffiliate schema
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        website: '',
        phone: '',
        instagram: '',
        twitter: '',
        facebook: '',
        youtube: '',
        tiktok: '',
        audienceSize: '',
        promotionMethods: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

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

    const handlePromotionMethodToggle = (method: string) => {
        setFormData((prev) => ({
            ...prev,
            promotionMethods: prev.promotionMethods.includes(method)
                ? prev.promotionMethods.filter((m) => m !== method)
                : [...prev.promotionMethods, method],
        }));
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
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setErrors({});

                                // Validation
                                const newErrors: Record<string, string> = {};
                                if (!formData.firstName.trim()) {
                                    newErrors.firstName = 'First name is required';
                                }
                                if (!formData.lastName.trim()) {
                                    newErrors.lastName = 'Last name is required';
                                }
                                if (!formData.email.trim()) {
                                    newErrors.email = 'Email is required';
                                } else if (
                                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                        formData.email
                                    )
                                ) {
                                    newErrors.email = 'Invalid email format';
                                }

                                if (Object.keys(newErrors).length > 0) {
                                    setErrors(newErrors);
                                    return;
                                }

                                // Build payload matching backend schema
                                const payload = {
                                    email: formData.email,
                                    name: {
                                        first: formData.firstName,
                                        last: formData.lastName,
                                    },
                                    ...(formData.company && {
                                        company: formData.company,
                                    }),
                                    ...(formData.website && {
                                        website: formData.website,
                                    }),
                                    ...(formData.phone && {
                                        phone: formData.phone,
                                    }),
                                    ...((formData.instagram ||
                                        formData.twitter ||
                                        formData.facebook ||
                                        formData.youtube ||
                                        formData.tiktok) && {
                                        socialMedia: {
                                            ...(formData.instagram && {
                                                instagram: formData.instagram,
                                            }),
                                            ...(formData.twitter && {
                                                twitter: formData.twitter,
                                            }),
                                            ...(formData.facebook && {
                                                facebook: formData.facebook,
                                            }),
                                            ...(formData.youtube && {
                                                youtube: formData.youtube,
                                            }),
                                            ...(formData.tiktok && {
                                                tiktok: formData.tiktok,
                                            }),
                                        },
                                    }),
                                    ...(formData.audienceSize && {
                                        audienceSize: formData.audienceSize,
                                    }),
                                    ...(formData.promotionMethods.length > 0 && {
                                        promotionMethods: formData.promotionMethods,
                                    }),
                                };

                                // Submit form
                                const result = await submitApplication(payload);

                                if (result.success) {
                                    router.push('/affiliate/thank-you');
                                } else if (result.errors) {
                                    // Set field-specific errors from API
                                    setErrors(result.errors);
                                    setApiErrors(result.errors);
                                    
                                    // Show modal if there are errors
                                    if (Object.keys(result.errors).length > 0) {
                                        setShowErrorModal(true);
                                        // Scroll to top of form to show error display
                                        setTimeout(() => {
                                            const formElement = document.querySelector('form');
                                            if (formElement) {
                                                formElement.scrollIntoView({ 
                                                    behavior: 'smooth', 
                                                    block: 'start' 
                                                });
                                            }
                                        }, 100);
                                    }
                                }
                            }}
                        >
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                {/* First Name */}
                                <div>
                                    <Input
                                        type='text'
                                        placeholder='First Name *'
                                        value={formData.firstName}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                firstName: e.target.value,
                                            });
                                            // Clear error when user starts typing
                                            if (errors.firstName || apiErrors.firstName) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.firstName;
                                                    return newErrors;
                                                });
                                                setApiErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.firstName;
                                                    if (Object.keys(newErrors).length === 0) {
                                                        setShowErrorModal(false);
                                                    }
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        {...inputSettings}
                                    />
                                    {errors.firstName && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.firstName}
                                        </p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <Input
                                        type='text'
                                        placeholder='Last Name *'
                                        value={formData.lastName}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                lastName: e.target.value,
                                            });
                                            if (errors.lastName || apiErrors.lastName) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.lastName;
                                                    return newErrors;
                                                });
                                                setApiErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.lastName;
                                                    if (Object.keys(newErrors).length === 0) {
                                                        setShowErrorModal(false);
                                                    }
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        {...inputSettings}
                                    />
                                    {errors.lastName && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.lastName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <Input
                                        type='email'
                                        placeholder='Email Address *'
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            });
                                            if (errors.email || apiErrors.email) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.email;
                                                    return newErrors;
                                                });
                                                setApiErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.email;
                                                    if (Object.keys(newErrors).length === 0) {
                                                        setShowErrorModal(false);
                                                    }
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        {...inputSettings}
                                    />
                                    {errors.email && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <Input
                                        type='tel'
                                        placeholder='Phone Number'
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        {...inputSettings}
                                    />
                                    {errors.phone && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Company */}
                                <div>
                                    <Input
                                        type='text'
                                        placeholder='Company Name'
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                company: e.target.value,
                                            })
                                        }
                                        {...inputSettings}
                                    />
                                    {errors.company && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.company}
                                        </p>
                                    )}
                                </div>

                                {/* Website */}
                                <div>
                                    <Input
                                        type='url'
                                        placeholder='Website URL'
                                        value={formData.website}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                website: e.target.value,
                                            })
                                        }
                                        {...inputSettings}
                                    />
                                    {errors.website && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.website}
                                        </p>
                                    )}
                                </div>

                                {/* Audience Size */}
                                <div>
                                    <Select
                                        value={formData.audienceSize}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                audienceSize: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            showIcon={false}
                                            className='font-bold!'
                                        >
                                            <NeonBox
                                                className='py-3 px-4 md:px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none flex-1 text-left'
                                                glowColor='--color-purple-500'
                                                backgroundColor='--color-purple-500'
                                                backgroundOpacity={0.2}
                                                glowSpread={0.8}
                                                enableHover
                                            >
                                                <SelectValue
                                                    className='text-base'
                                                    placeholder='Audience Size'
                                                />
                                                <Icon
                                                    icon='lucide:chevron-down'
                                                    fontSize={24}
                                                />
                                            </NeonBox>
                                        </SelectTrigger>
                                        <SelectContent className='font-bold!'>
                                            {AUDIENCE_SIZE_OPTIONS.map(
                                                (item, index) => (
                                                <SelectItem
                                                    className='font-bold'
                                                    key={index}
                                                    value={item}
                                                >
                                                    {item}
                                                </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.audienceSize && (
                                        <p className='text-red-400 text-xs mt-1'>
                                            {errors.audienceSize}
                                        </p>
                                    )}
                                </div>
                            </div>
                            

                            {/* Social Media Section */}
                            <div className='mb-6'>
                                <NeonText
                                    as='h3'
                                    className='text-lg font-bold mb-4'
                                    glowColor='--color-purple-500'
                                    glowSpread={0.5}
                                >
                                    Social Media (Optional)
                                </NeonText>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Input
                                            type='url'
                                            placeholder='Instagram URL'
                                            value={formData.instagram}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    instagram: e.target.value,
                                                })
                                            }
                                            {...inputSettings}
                                        />
                                        {(errors['socialMedia.instagram'] || errors.instagram) && (
                                            <p className='text-red-400 text-xs mt-1'>
                                                {errors['socialMedia.instagram'] || errors.instagram}
                                            </p>
                                        )}
                                            </div>
                                    <div>
                                        <Input
                                            type='url'
                                            placeholder='Twitter/X URL'
                                            value={formData.twitter}
                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                    twitter: e.target.value,
                                                })
                                            }
                                            {...inputSettings}
                                        />
                                        {(errors['socialMedia.twitter'] || errors.twitter) && (
                                            <p className='text-red-400 text-xs mt-1'>
                                                {errors['socialMedia.twitter'] || errors.twitter}
                                            </p>
                                        )}
                                    </div>
                                <div>
                                        <Input
                                            type='url'
                                            placeholder='Facebook URL'
                                            value={formData.facebook}
                                            onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                    facebook: e.target.value,
                                                })
                                            }
                                            {...inputSettings}
                                        />
                                        {(errors['socialMedia.facebook'] || errors.facebook) && (
                                        <p className='text-red-400 text-xs mt-1'>
                                                {errors['socialMedia.facebook'] || errors.facebook}
                                        </p>
                                    )}
                                </div>
                                    <div>
                                        <Input
                                            type='url'
                                            placeholder='YouTube URL'
                                            value={formData.youtube}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                                    youtube: e.target.value,
                                                })
                                            }
                                            {...inputSettings}
                                        />
                                        {(errors['socialMedia.youtube'] || errors.youtube) && (
                                            <p className='text-red-400 text-xs mt-1'>
                                                {errors['socialMedia.youtube'] || errors.youtube}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Input
                                            type='url'
                                            placeholder='TikTok URL'
                                            value={formData.tiktok}
                                            onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                                    tiktok: e.target.value,
                                                })
                                            }
                                            {...inputSettings}
                                        />
                                        {(errors['socialMedia.tiktok'] || errors.tiktok) && (
                                            <p className='text-red-400 text-xs mt-1'>
                                                {errors['socialMedia.tiktok'] || errors.tiktok}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Promotion Methods */}
                            <div className='mb-6'>
                                <NeonText
                                    as='h3'
                                    className='text-lg font-bold mb-4'
                                    glowColor='--color-purple-500'
                                    glowSpread={0.5}
                                >
                                    Promotion Methods (Select all that apply)
                                </NeonText>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                    {PROMOTION_METHODS.map((method) => (
                                        <div
                                            key={method}
                                            className='flex items-center gap-2'
                                        >
                                            <Checkbox
                                                id={`promo-${method}`}
                                                checked={formData.promotionMethods.includes(
                                                    method
                                                )}
                                                onCheckedChange={() =>
                                                    handlePromotionMethodToggle(
                                                        method
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`promo-${method}`}
                                                className='text-sm font-medium cursor-pointer'
                                            >
                                                {method}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.promotionMethods && (
                                    <p className='text-red-400 text-xs mt-2'>
                                        {errors.promotionMethods}
                                    </p>
                                )}
                            </div>

                            {/* Error Display Below Button */}
                            {Object.keys(apiErrors).length > 0 && (
                                <div className='mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg'>
                                    <div className='flex items-start gap-3'>
                                        <NeonIcon
                                            icon='lucide:alert-circle'
                                            size={24}
                                            className='text-red-400 flex-shrink-0 mt-0.5'
                                        />
                                        <div className='flex-1'>
                                            <NeonText
                                                as='h4'
                                                className='text-lg font-bold text-red-400 mb-2'
                                                glowColor='--color-red-500'
                                                glowSpread={0.5}
                                            >
                                                Please fix the following errors:
                                            </NeonText>
                                            <ul className='space-y-2'>
                                                {Object.entries(apiErrors).map(
                                                    ([field, message]) => {
                                                        // Map field names to user-friendly labels
                                                        const fieldLabels: Record<string, string> = {
                                                            firstName: 'First Name',
                                                            lastName: 'Last Name',
                                                            email: 'Email',
                                                            phone: 'Phone',
                                                            company: 'Company',
                                                            website: 'Website',
                                                            audienceSize: 'Audience Size',
                                                            promotionMethods: 'Promotion Methods',
                                                            instagram: 'Instagram URL',
                                                            twitter: 'Twitter/X URL',
                                                            facebook: 'Facebook URL',
                                                            youtube: 'YouTube URL',
                                                            tiktok: 'TikTok URL',
                                                            general: 'Error',
                                                        };
                                                        
                                                        const label = fieldLabels[field] || field;
                                                        
                                                        return (
                                                            <li
                                                                key={field}
                                                                className='text-sm text-red-300 flex items-start gap-2'
                                                            >
                                                                <span className='text-red-400 mt-1'>
                                                                    •
                                                                </span>
                                                                <span>
                                                                    <strong>{label}:</strong>{' '}
                                                                    {message}
                                                                </span>
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='flex items-center justify-center mt-8'>
                                <Button
                                    size='lg'
                                    type='submit'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <NeonIcon
                                                icon='svg-spinners:bars-rotate-fade'
                                                size={20}
                                                className='mr-2'
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </NeonBox>
                </div>
            </div>

            {/* Error Modal */}
            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent className='sm:max-w-[500px]!'>
                    <DialogHeader>
                        <DialogTitle asChild>
                            <NeonText
                                as='h3'
                                className='h3-title text-red-400'
                                glowColor='--color-red-500'
                                glowSpread={0.5}
                            >
                                Validation Errors
                            </NeonText>
                        </DialogTitle>
                    </DialogHeader>
                    <div className='py-4'>
                        <div className='mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg'>
                            <p className='text-sm text-white/80 mb-4'>
                                Please fix the following errors before submitting:
                            </p>
                            <ul className='space-y-3 max-h-[300px] overflow-y-auto'>
                                {Object.entries(apiErrors).map(([field, message]) => {
                                    // Map field names to user-friendly labels
                                    const fieldLabels: Record<string, string> = {
                                        firstName: 'First Name',
                                        lastName: 'Last Name',
                                        email: 'Email',
                                        phone: 'Phone',
                                        company: 'Company',
                                        website: 'Website',
                                        audienceSize: 'Audience Size',
                                        promotionMethods: 'Promotion Methods',
                                        instagram: 'Instagram URL',
                                        twitter: 'Twitter/X URL',
                                        facebook: 'Facebook URL',
                                        youtube: 'YouTube URL',
                                        tiktok: 'TikTok URL',
                                        general: 'General Error',
                                    };
                                    
                                    const label = fieldLabels[field] || field;
                                    
                                    return (
                                        <li
                                            key={field}
                                            className='flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg'
                                        >
                                            <NeonIcon
                                                icon='lucide:alert-circle'
                                                size={20}
                                                className='text-red-400 flex-shrink-0 mt-0.5'
                                            />
                                            <div className='flex-1'>
                                                <p className='text-sm font-bold text-red-400 mb-1'>
                                                    {label}
                                                </p>
                                                <p className='text-sm text-white/70'>
                                                    {message}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className='flex justify-end'>
                            <Button
                                size='md'
                                variant='neon'
                                onClick={() => setShowErrorModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

export default PartnershipForm;

