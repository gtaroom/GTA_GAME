import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

export default function SpecializedSupport() {
    const supportCategories = [
        {
            icon: 'lucide:user',
            title: 'Account Support',
            description:
                'Need help with your account? We assist with login issues, password resets, profile updates, verification processes, and account security settings.',
            email: 'Account@Gtorarcade.com',
            color: '--color-yellow-500',
        },
        {
            icon: 'lucide:gamepad',
            title: 'Game Support',
            description:
                'Need help with our games? Get assistance with how to play, game features, instructions, technical issues, or troubleshooting gameplay.',
            email: 'Support@gtoarcade.com',
            color: '--color-purple-500',
        },
        {
            icon: 'lucide:wallet',
            title: 'Account & Balance Support',
            description:
                'Need help with purchases, redemptions, transaction history, or account activity? Our support specialists are here for you.',
            email: 'Support@gtoarcade.com',
            color: '--color-green-500',
        },
        {
            icon: 'lucide:monitor',
            title: 'Technical Support',
            description:
                'Experiencing technical difficulties? We provide support for app crashes, loading issues, browser compatibility, and mobile optimization.',
            email: 'Tech@Gtorarcade.com',
            color: '--color-blue-500',
        },
        {
            icon: 'lucide:shield',
            title: 'Security & Privacy',
            description:
                'Concerned about security? Get assistance with account protection, suspicious activity reports, privacy settings, and responsible gaming tools.',
            email: 'Security@Gtorarcade.com',
            color: '--color-pink-500',
        },
        {
            icon: 'lucide:gift',
            title: 'Promotions & Bonuses',
            description:
                'Questions about bonuses, promotions, loyalty rewards, VIP programs, or sweepstakes? Learn about our latest offers and claim your rewards.',
            email: 'Promotions@Gtorarcade.com',
            color: '--color-lime-500',
        },
    ];

    return (
        <section className='mb-14 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Specialized Support
                </NeonText>

                <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-10'>
                    {supportCategories.map((support, index) => (
                        <NeonBox
                            key={index}
                            glowColor={support.color}
                            backgroundColor={support.color}
                            backgroundOpacity={0.1}
                            className='rounded-2xl text-center p-6 lg:p-8 h-full flex flex-col items-center backdrop-blur-2xl'
                        >
                            <NeonIcon
                                icon={support.icon}
                                size={50}
                                glowColor={support.color}
                                className='mb-6 motion-safe:motion-scale-loop-[1.06] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear
'
                                // glowSpread={0.5}
                            />
                            <NeonText
                                as='h5'
                                className='h5-title mb-2'
                                glowColor={support.color}
                                glowSpread={0.4}
                            >
                                {support.title}
                            </NeonText>
                            <NeonText
                                as='p'
                                className='text-base font-bold mx-auto capitalize mb-4 lg:mb-6 leading-7'
                                glowColor={support.color}
                                glowSpread={0.3}
                            >
                                {support.description}
                            </NeonText>
                            <NeonBox
                                glowColor={support.color}
                                borderWidth={1}
                                className='w-[100px] mb-4 lg:mb-6'
                            ></NeonBox>
                            <NeonText
                                as='a'
                                href='mailto:Support@gtorarcade.com'
                                glowColor={support.color}
                                glowSpread={0.5}
                                className='text-base font-bold lowercase underline mt-auto'
                            >
                                {support.email}
                            </NeonText>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}
