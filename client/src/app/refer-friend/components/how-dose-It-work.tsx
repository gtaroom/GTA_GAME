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
            title: 'Share Your Link',
            description:
                'Every user automatically gets a unique referral code. Share your personal invite link (with ?ref=CODE) through social media, email, or text. Your friend must be a new player.',
            color: '--color-green-500',
        },
        {
            icon: 'lucide:user-plus',
            title: 'Friend Signs Up',
            description:
                'Your friend clicks your link and registers. The system automatically creates a referral record with status "pending" and tracks their purchases.',
            color: '--color-pink-500',
        },
        {
            icon: 'lucide:shopping-cart',
            title: 'Friend Makes Purchases',
            description:
                'Your friend makes deposit transactions. The system tracks their total spending. When they reach $20 in total purchases, they qualify automatically.',
            color: '--color-yellow-500',
        },
        {
            icon: 'lucide:gift',
            title: 'Rewards Given Automatically',
            description:
                'Once your friend reaches $20 total spending, both of you get rewards automatically: You receive 1,000 Gold Coins ($10) and your friend receives 500 Gold Coins ($5).',
            color: '--color-blue-500',
        },
    ];

    return (
        <section className='mb-14 md:mb-16'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <AccountPageTitle as='h2' className='mb-8 max-lg:text-center'>
                    How does it work?
                </AccountPageTitle>
                <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8'>
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
