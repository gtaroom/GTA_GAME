'use client';

import { inputSettings } from '@/app/(auth)/auth.style.config';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import bgImage from '../cta-bg.jpg';

export default function CTABanner() {
    const { md } = useBreakPoint();
    return (
        <>
            {/* <section className='mb-12 sm:18 md:mb-22 lg:mb-25'>
                <div className='container-xxl'>
                    <NeonBox
                        glowColor='--color-purple-500'
                        className='px-[18px] py-[30px] sm:py-[50px] xl:py-[70px] rounded-2xl flex flex-col text-center bg-cover bg-center bg-norepeat h-auto xl:h-[400px] place-items-center'
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${bgImage.src})`,
                        }}
                    >
                        <div className='max-w-[622px]'>
                            <NeonText as='h1' className='h1-title mb-2'>
                                Want exclusive updates?
                            </NeonText>
                            <NeonText
                                as='p'
                                className='h6-title mb-2 mt-[14px]'
                            >
                                Subscribe to our newsletter and never miss a
                                beat.
                            </NeonText>
                            <div className='sm:max-w-[558px] max-sm:flex-col flex items-center gap-4 mt-8'>
                                <Input
                                    type='email'
                                    placeholder='Enter your email address'
                                    className='h-13.5!'
                                    {...inputSettings}
                                />
                                <Button
                                    size={md ? 'lg' : 'md'}
                                    type='submit'
                                    animate
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </NeonBox>
                </div>
            </section> */}
            <section>
                <div className='container-xxl'>
                    <NeonBox
                        glowColor='--color-purple-500'
                        className='rounded-[8px] flex place-items-center max-w-[814px] mx-auto text-center h-20 p-4 mb-12 sm:18 md:mb-22 lg:mb-25'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <NeonText
                            as='p'
                            className='h6-title m-0 mx-auto text-center'
                        >
                            Thank you for being part of our community let’s grow
                            together!
                        </NeonText>
                    </NeonBox>
                </div>
            </section>
        </>
    );
}
