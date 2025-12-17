import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

function CommissionStructure() {
    const commissionInfo = [
        {
            key: 'revenueShare',
            badge: 'Revenue Share',
            headline: '10–25%',
            description:
                'Earn a percentage of net gold coin package purchases from each qualified user you refer, for up to 60 days.',
            features: [
                '60-day recurring commissions',
                'Transparent purchase tracking',
                'No negative carryover',
                'Monthly payouts (Min. $100 threshold)',
            ],
            color: '--color-green-500',
        },
        {
            key: 'cpa',
            badge: 'CPA (Cost Per Acquisition)',
            headline: '$50–$150',
            description:
                'Earn a fixed one-time payment for each referred player who makes a qualifying gold coin purchase.',
            features: [
                'One-time payment per player',
                'Quick cash flow',
                'Performance-based bonuses',
                'Volume tier increases',
            ],
            color: '--color-pink-500',
        },
        {
            key: 'hybrid',
            badge: 'Hybrid Model',
            headline: 'Custom',
            description:
                'Combine CPA + Revenue Share for flexible commissions based on your traffic quality.',
            features: [
                'Balanced risk & reward',
                'Volume-based negotiation',
                'Personalized affiliate dashboard',
                'Requires pre-approval',
            ],
            color: '--color-blue-500',
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
