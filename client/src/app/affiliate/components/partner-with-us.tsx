import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

function PartnerWithUs() {
    const affiliateFeatures = [
        {
            icon: 'lucide:line-chart',
            title: 'High Conversion Rates',
            description:
                'Our sweepstakes-based arcade platform is optimized for engagement and retention. With consistent conversion rates across verified U.S. traffic. Performance may vary by source.',
            color: '--color-green-500',
        },
        {
            icon: 'lucide:credit-card',
            title: 'Reliable Payments',
            description:
                'We process affiliate payments monthly once the $100 threshold is met. Multiple payout options available, including PayPal and direct transfer.',
            color: '--color-red-500',
        },
        {
            icon: 'lucide:map-pin-check',
            title: 'Real-Time Tracking',
            description:
                'Track your affiliate referrals through our dashboard, featuring transparent reporting and performance data. Real-time stats may vary by traffic source.',
            color: '--color-cyan-500',
        },
        {
            icon: 'lucide:shapes',
            title: 'Marketing Materials',
            description:
                'Access branded banners, landing pages, and promotional content crafted by our team optimized for compliant, effective outreach.',
            color: '--color-blue-500',
        },
        {
            icon: 'lucide:headset',
            title: 'Dedicated Support',
            description:
                'Get responsive assistance from our affiliate team to help you optimize compliant campaigns and grow your earnings.',
            color: '--color-purple-500',
        },
        {
            icon: 'lucide:search',
            title: 'Global Reach',
            description:
                'Our platform is accessible in multiple regions and languages. However, commissions are only valid for verified U.S.-eligible traffic.',
            color: '--color-lime-500',
        },
    ];

    return (
        <section className=' mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Why Partner With Us?
                </NeonText>
                <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-10'>
                    {affiliateFeatures.map((feature, index) => (
                        <NeonBox
                            key={index}
                            glowColor={feature.color}
                            backgroundColor={feature.color}
                            backgroundOpacity={0.1}
                            className='p-6 xl:p-10 lg:p-8 rounded-2xl flex flex-col text-center items-center backdrop-blur-2xl'
                        >
                            <NeonIcon
                                icon={feature.icon}
                                size={50}
                                glowColor={feature.color}
                                className='mb-4'
                            />
                            <NeonText
                                as='h5'
                                className='h5-title mb-2'
                                glowColor={feature.color}
                                glowSpread={0.5}
                            >
                                {feature.title}
                            </NeonText>
                            <p className='text-base font-bold max-w-[90%] capitalize'>
                                {feature.description}
                            </p>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PartnerWithUs;
