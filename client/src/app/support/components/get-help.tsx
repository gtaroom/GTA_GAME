'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from 'next-transition-router';

export default function GetHelp() {
    const router = useTransitionRouter();

    const supportOptions = [
        {
            icon: 'lucide:message-square-more',
            title: 'Live Chat',
            description:
                'Get instant help from our support team. Average response time: 30 seconds',
            button: {
                text: 'Chat Now',
                onClick: () => window.open('https://assistcentral.net/livechat', '_blank', 'noopener,noreferrer'),
            },
            color: '--color-cyan-500',
        },
        {
            icon: 'lucide:mail',
            title: 'Email Support',
            description: 'Send us a detailed message for complex inquiries',
            bottomContent: ({ color }: { color: string }) => (
                <>
                    <NeonText
                        as='a'
                        href='mailto:support@gtorarcade.com'
                        glowColor={color}
                        glowSpread={0.5}
                        className='text-base font-bold lowercase underline'
                    >
                        Support@gtorarcade.com
                    </NeonText>
                    <NeonText
                        glowColor={color}
                        glowSpread={0.5}
                        className='text-base font-bold capitalize'
                    >
                        Response time: Within 2 hours
                    </NeonText>
                </>
            ),
            color: '--color-purple-500',
        },
        {
            icon: 'lucide:phone',
            title: 'Phone Support',
            description: 'Speak directly with our support specialists',
            bottomContent: ({ color }: { color: string }) => (
                <>
                    <NeonText
                        as='a'
                        href='tel:+17023563435'
                        glowColor={color}
                        glowSpread={0.5}
                        className='text-base font-bold'
                    >
                        702.356.3435
                    </NeonText>
                    <NeonText
                        glowColor={color}
                        glowSpread={0.5}
                        className='text-base font-bold capitalize'
                    >
                        Available 24/7
                    </NeonText>
                </>
            ),
            color: '--color-orange-500',
        },
        {
            icon: 'lucide:help-circle',
            title: 'Help Center & FAQ',
            description: 'Find instant answers to common questions',
            button: {
                text: 'Browse FAQ',
                onClick: () => router.push('/faqs'),
            },
            color: '--color-blue-500',
        },
    ];

    return (
        <section className=' mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Get Help Instantly
                </NeonText>
                <div className='row row-gap-32'>
                    {supportOptions.map((option, index) => (
                        <div className='xl:col-3 md:col-6' key={index}>
                            <NeonBox
                                glowColor={option.color}
                                backgroundColor={option.color}
                                backgroundOpacity={0.1}
                                className='rounded-2xl text-center py-6 lg:py-8 px-4 h-full flex flex-col items-center backdrop-blur-2xl'
                            >
                                <NeonIcon
                                    icon={option.icon}
                                    size={50}
                                    glowColor={option.color}
                                    className='mb-6 motion-safe:motion-scale-loop-[1.06] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear
'
                                    // glowSpread={0.5}
                                />
                                <NeonText
                                    as='h5'
                                    className='h5-title mb-2'
                                    glowColor={option.color}
                                    glowSpread={0.4}
                                >
                                    {option.title}
                                </NeonText>
                                <NeonText
                                    as='p'
                                    className='text-base font-bold mx-auto capitalize mb-6 leading-7'
                                    glowColor={option.color}
                                    glowSpread={0.3}
                                >
                                    {option.description}
                                </NeonText>
                                {option.bottomContent && (
                                    <div className='flex flex-col gap-2 items-center'>
                                        <NeonBox
                                            glowColor={option.color}
                                            borderWidth={1}
                                            className='w-[100px] mb-4'
                                        ></NeonBox>
                                        {option.bottomContent({
                                            color: option.color,
                                        })}
                                    </div>
                                )}
                                {option.button && (
                                    <Button
                                        size='md'
                                        className='mt-auto'
                                        onClick={option.button.onClick}
                                    >
                                        {option.button?.text}
                                    </Button>
                                )}
                            </NeonBox>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
