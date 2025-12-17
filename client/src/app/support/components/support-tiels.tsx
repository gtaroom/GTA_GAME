import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';

export default function SupportTiels() {
    const supportStatusCards = [
        {
            title: 'Support Status: Online',
            description:
                'All support channels are currently active and ready to assist you.',
            color: '--color-green-500',
        },
        {
            title: 'Available 24/7',
            description:
                'Round-the-clock support for all account and platform questions, every day of the year.',
            color: '--color-pink-500',
        },
    ];

    return (
        <section className=' mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10'>
                    {supportStatusCards.map((card, index) => (
                        <NeonBox
                            key={index}
                            className='p-6 xl:p-10 lg:p-8 rounded-2xl text-center backdrop-blur-2xl'
                            glowColor={card.color}
                            backgroundColor={card.color}
                            backgroundOpacity={0.1}
                        >
                            <NeonText
                                as='h4'
                                className='h4-title mb-1'
                                glowColor={card.color}
                                glowSpread={0.4}
                            >
                                {card.title}
                            </NeonText>
                            <NeonText
                                as='p'
                                className='text-base md:text-lg font-bold mx-auto max-w-[80%] capitalize'
                                glowColor={card.color}
                                glowSpread={0.3}
                            >
                                {card.description}
                            </NeonText>
                        </NeonBox>
                    ))}
                </div>
            </div>
        </section>
    );
}
