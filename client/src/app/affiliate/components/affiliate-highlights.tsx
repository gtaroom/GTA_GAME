import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';

function AffiliateHighlights() {
    const highlightInfo = [
        {
            value: '25%',
            label: 'Revenue Share',
            color: '--color-green-500',
        },
        {
            value: '300+',
            label: 'Active Partners',
            color: '--color-pink-500',
        },
        {
            value: '$750K+',
            label: 'Paid To Affiliates',
            color: '--color-orange-500',
        },
        {
            value: '24/7',
            label: 'Partner Support',
            color: '--color-blue-500',
        },
    ];

    return (
        <section className=' mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <div className='row row-gap-32 lg:row-gap-40'>
                    {highlightInfo.map((highlight, index) => (
                        <div className='lg:col-3 md:col-6' key={index}>
                            <NeonBox
                                glowColor={highlight.color}
                                backgroundColor={highlight.color}
                                backgroundOpacity={0.1}
                                className='w-full rounded-xl py-6 xl:py-10 lg:py-8 flex flex-col items-center gap-2 backdrop-blur-2xl'
                            >
                                <NeonText
                                    as='span'
                                    className='h1-title'
                                    glowColor={highlight.color}
                                    glowSpread={0.5}
                                >
                                    {highlight.value}
                                </NeonText>
                                <NeonText
                                    as='h6'
                                    className='text-xl font-bold capitalize!'
                                    glowColor={highlight.color}
                                    glowSpread={0.5}
                                >
                                    {highlight.label}
                                </NeonText>
                            </NeonBox>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AffiliateHighlights;
