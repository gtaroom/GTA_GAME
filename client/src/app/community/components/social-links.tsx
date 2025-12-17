'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { socialChannels } from '@/data/social-channel';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';

export default function SocialLinks() {
    const { xl, xxl, md, is2xl } = useBreakPoint();
    return (
        <>
            <section className='mb-14 sm:mb-16 md:mb-18 lg:mb-20'>
                <div className='container-xxl'>
                    <div className='mx-auto text-center max-w-[700px] mb-12'>
                        <NeonText as='h1' className='h1-title mb-3'>
                            Join Our Community & Stay Connected
                        </NeonText>
                        <p className='text-lg font-bold capitalize'>
                            Follow us on your favorite platforms to stay
                            updated, join the conversation, and be part of our
                            growing community!
                        </p>
                    </div>
                    <div
                        className={`row ${is2xl ? 'row-gap-40' : `${xxl ? 'row-gap-32' : `${xl ? 'row-gap-24' : 'row-gap-16'}`}`} justify-center`}
                    >
                        {socialChannels.map((link, index) => (
                            <div className='sm:col-6 lg:col-4' key={index}>
                                <NeonBox
                                    glowColor={link.color}
                                    backgroundColor={link.color}
                                    backgroundOpacity={0.1}
                                    className='w-full h-full py-5 px-4 sm:py-6 sm:px-5 md:py-7 md:px-6 lg:p-8 rounded-xl flex flex-col items-center backdrop-blur-2xl'
                                >
                                    <div className='flex flex-col items-center text-center'>
                                        <Image
                                            src={link.icon}
                                            height={xl ? 80 : md ? 68 : 52}
                                            width={xl ? 80 : md ? 68 : 52}
                                            alt={link.title}
                                            className='mb-7'
                                        />
                                        <NeonText
                                            as='h4'
                                            className='h4-title mb-3'
                                            glowColor={link.color}
                                        >
                                            {' '}
                                            {link.title}
                                        </NeonText>
                                        <NeonText
                                            as='p'
                                            className='text-base capitalize font-bold leading-7 mb-8'
                                            glowColor={link.color}
                                            glowSpread={0.5}
                                        >
                                            {link.description}
                                        </NeonText>
                                        <Button
                                            size='md'
                                            className='mb-2'
                                            onClick={() =>
                                                window.open(link.url, '_blank')
                                            }
                                        >
                                            {link.buttonLabel}
                                        </Button>
                                    </div>
                                </NeonBox>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
