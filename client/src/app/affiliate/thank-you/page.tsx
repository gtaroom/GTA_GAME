'use client';

import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';

export default function AffiliateThankYouPage() {
    const router = useTransitionRouter();

    return (
        <div className='min-h-screen flex items-center justify-center py-12 px-4'>
            <div className='container-xxl max-w-2xl'>
                <NeonBox
                    className='p-8 md:p-12 rounded-2xl backdrop-blur-2xl text-center'
                    backgroundColor='--color-purple-500'
                    glowColor='--color-purple-500'
                    backgroundOpacity={0.1}
                    glowSpread={0.5}
                >
                    <div className='flex flex-col items-center gap-6'>
                        <div className='w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-4'>
                            <NeonIcon
                                icon='lucide:check-circle'
                                size={64}
                                className='text-green-400'
                            />
                        </div>

                        <NeonText as='h1' className='h1-title mb-4'>
                            Thank You!
                        </NeonText>

                        <NeonText
                            as='p'
                            className='h4-title mb-6'
                            glowSpread={0.1}
                        >
                            Your partnership application has been submitted
                            successfully.
                        </NeonText>

                        <div className='bg-neutral-800/30 rounded-lg p-6 mb-8 w-full text-left'>
                            <h3 className='font-semibold mb-4'>
                                What happens next?
                            </h3>
                            <ul className='space-y-3 text-sm text-muted-foreground'>
                                <li className='flex items-start gap-3'>
                                    <NeonIcon
                                        icon='lucide:mail'
                                        size={20}
                                        className='text-purple-400 flex-shrink-0 mt-0.5'
                                    />
                                    <span>
                                        You will receive a confirmation email
                                        shortly with your application details.
                                    </span>
                                </li>
                                <li className='flex items-start gap-3'>
                                    <NeonIcon
                                        icon='lucide:clock'
                                        size={20}
                                        className='text-purple-400 flex-shrink-0 mt-0.5'
                                    />
                                    <span>
                                        Our team will review your application as soon as possible.
                                    </span>
                                </li>
                            
                            </ul>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-4 w-full'>
                            <Button
                                size='lg'
                                variant='secondary'
                                onClick={() => router.push('/')}
                                className='flex-1'
                            >
                                Back to Home
                            </Button>
                        
                        </div>

                        <div className='mt-8 pt-6 border-t border-neutral-700'>
                            <p className='text-sm text-muted-foreground mb-2'>
                                Questions about your application?
                            </p>
                            <p className='text-sm'>
                                Contact us at{' '}
                                <a
                                    href='mailto:support@example.com'
                                    className='text-purple-400 hover:underline'
                                >
                                   support@gtorarcade.com
                                </a>
                            </p>
                        </div>
                    </div>
                </NeonBox>
            </div>
        </div>
    );
}

