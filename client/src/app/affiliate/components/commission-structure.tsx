import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

function CommissionStructure() {
    const commissionInfo = [
        {
            key: 'affiliate',
            badge: 'Affiliate Program',
            headline: 'One-Time Commission',
            description:
                'Earn a percentage commission when your referrals first reach $20 in total spending. Commission is calculated on the full amount spent at qualification, not just the minimum threshold.',
            features: [
                'One-time commission at qualification',
                'Commission on full total (not just $20)',
                '$20 minimum threshold to qualify',
                'Performance-based commission rates',
                'Monthly payouts (Min. $100 threshold)',
            ],
            color: '--color-green-500',
        },
        {
            key: 'how-it-works',
            badge: 'How It Works',
            headline: 'Simple Process',
            description:
                'When a user signs up via your affiliate link and reaches $20 in total spending, you receive a one-time commission based on their total spent amount.',
            features: [
                'User signs up via your link',
                'User reaches $20 minimum spending',
                'Commission calculated on total spent',
                'One-time payment (no recurring)',
                'Track all referrals in dashboard',
            ],
            color: '--color-blue-500',
        },
        {
            key: 'benefits',
            badge: 'Program Benefits',
            headline: 'Why Join?',
            description:
                'Join our affiliate network and access powerful tools to grow your earnings with transparent tracking and reliable payouts.',
            features: [
                'Public can apply (no account needed)',
                'Dashboard access for approved affiliates',
                'Real-time tracking and analytics',
                'Transparent commission structure',
                'Dedicated support team',
            ],
            color: '--color-purple-500',
        },
    ];

    return (
        <section className=' mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Premium Commission Structure
                </NeonText>

                <div className='row row-gap-32 lg:row-gap-40 justify-center'>
                    {commissionInfo.map((commission, index) => (
                        <div className='xl:col-4 md:col-6' key={index}>
                            <NeonBox
                                glowColor={commission.color}
                                backgroundColor={commission.color}
                                backgroundOpacity={0.1}
                                className='rounded-2xl backdrop-blur-2xl p-6 xl:p-10 lg:p-8  flex flex-col items-center h-full'
                            >
                                <NeonBox
                                    glowColor={commission.color}
                                    glowSpread={0.5}
                                    className='rounded-md backdrop-blur-2xl py-3 px-6 flex flex-col items-center mb-6 lg:mb-8 text-lg font-extrabold text-center'
                                >
                                    {commission.badge}
                                </NeonBox>

                                <NeonText
                                    as='span'
                                    className='h1-title uppercase mb-5'
                                    glowColor={commission.color}
                                    glowSpread={0.5}
                                >
                                    {commission.headline}
                                </NeonText>

                                <NeonText
                                    as='p'
                                    className='text-center text-base md:text-lg font-bold capitalize mb-6'
                                    glowColor={commission.color}
                                    glowSpread={0.5}
                                >
                                    {commission.description}
                                </NeonText>

                                <ul className='space-y-4 w-full'>
                                    {commission.features.map(
                                        (feature, index) => (
                                            <li
                                                key={index}
                                                className='flex items-center gap-3.5'
                                            >
                                                <NeonIcon
                                                    icon='lucide:circle-check'
                                                    size={26}
                                                    glowColor={commission.color}
                                                />
                                                <NeonText
                                                    as='p'
                                                    className='text-base md:text-lg font-bold capitalize leading-8'
                                                    glowColor={commission.color}
                                                    glowSpread={0.5}
                                                >
                                                    {feature}
                                                </NeonText>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </NeonBox>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CommissionStructure;
