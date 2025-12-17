import AccountPageTitle from '@/app/(account)/profile/components/account-page-title';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

export default function HowDoseItWork({
    isLoggedIn,
}: {
    isLoggedIn?: boolean;
}) {
    const referralSteps = [
        {
            icon: 'lucide:send',
            title: 'Send the Invite',
            description:
                'Share your personal invite link through social media, email, or text. Your friend must be a new player and meet the referral requirements.',
            color: '--color-green-500',
        },
        {
            icon: 'lucide:shield-check',
            title: "Friend's Way",
            description:
                'Your friend signs up, completes their first Gold Coin purchase, and gets rewarded. You’ll earn a bonus too once they qualify.',
            color: '--color-pink-500',
        },
        {
            icon: 'lucide:gift',
            title: 'Celebrate Together',
            description:
                'Once verified, both you and your friend receive rewards. It’s a win-win when they play and stay.',
            color: '--color-blue-500',
        },
    ];

    return (
        <section className='mb-14 md:mb-16'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <AccountPageTitle as='h2' className='mb-8 max-lg:text-center'>
                    How does it work?
                </AccountPageTitle>
                <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-8'>
                    {referralSteps.map((referral, index) => (
                        <NeonBox
                            key={index}
                            className='flex items-start gap-4 p-6 backdrop-blur-2xl rounded-xl max-md:flex-col max-md:text-center'
                            glowColor={referral.color}
                            backgroundColor={referral.color}
                            backgroundOpacity={0.1}
                        >
                            <NeonIcon
                                className='max-md:mx-auto'
                                size={40}
                                icon={referral.icon}
                                glowColor={referral.color}
                            />
                            <div className='flex flex-col md:items-start'>
                                <NeonText
                                    as='h4'
                                    className='h4-title mb-2'
                                    glowColor={referral.color}
                                    glowSpread={0.4}
                                >
                                    {referral.title}
                                </NeonText>
                                <NeonText
                                    as='p'
                                    glowColor={referral.color}
                                    className='text-base md:text-lg font-semibold capitalize'
                                    glowSpread={0.4}
                                >
                                    {referral.description}
                                </NeonText>
                            </div>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}
