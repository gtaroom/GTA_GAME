import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

function HowCommissionsWork() {
    const steps = [
        {
            step: '1',
            title: 'User Signs Up',
            description:
                'A user clicks your affiliate link and creates an account. The referral is tracked with status "pending".',
            icon: 'lucide:user-plus',
            color: '--color-blue-500',
        },
        {
            step: '2',
            title: 'User Makes Purchases',
            description:
                'The user makes deposit transactions. The system tracks their total spending until they reach the $20 minimum threshold.',
            icon: 'lucide:shopping-cart',
            color: '--color-green-500',
        },
        {
            step: '3',
            title: 'Qualification & Commission',
            description:
                'Once total spending reaches $20, the user qualifies. You receive a one-time commission calculated on their FULL total spent (not just $20).',
            icon: 'lucide:check-circle',
            color: '--color-yellow-500',
        },
        {
            step: '4',
            title: 'Commission Locked',
            description:
                'The commission is locked at qualification. Future purchases by the same user do not generate additional commissions.',
            icon: 'lucide:lock',
            color: '--color-purple-500',
        },
    ];

    const examples = [
        {
            scenario: 'User spends exactly $20',
            calculation: '$20 × 15% = $3.00',
            result: 'You earn $3.00 (one-time)',
            color: '--color-green-500',
        },
        {
            scenario: 'User spends $60 first payment',
            calculation: '$60 × 15% = $9.00',
            result: 'You earn $9.00 (one-time)',
            color: '--color-blue-500',
        },
        {
            scenario: 'User spends $15, then $10',
            calculation: '$25 × 15% = $3.75',
            result: 'You earn $3.75 (one-time)',
            color: '--color-purple-500',
        },
    ];

    return (
        <section className='mb-14 xl:mb-20 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    How Commissions Work
                </NeonText>

                {/* Process Steps */}
                <div className='mb-12'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
                        {steps.map((step, index) => (
                            <NeonBox
                                key={index}
                                glowColor={step.color}
                                backgroundColor={step.color}
                                backgroundOpacity={0.1}
                                className='rounded-2xl backdrop-blur-2xl p-6 lg:p-8 flex flex-col items-center text-center h-full'
                            >
                                <div className='mb-4'>
                                    <NeonBox
                                        glowColor={step.color}
                                        glowSpread={0.5}
                                        className='rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4'
                                    >
                                        {step.step}
                                    </NeonBox>
                                    <NeonIcon
                                        icon={step.icon}
                                        size={40}
                                        glowColor={step.color}
                                    />
                                </div>
                                <NeonText
                                    as='h4'
                                    className='h4-title mb-3'
                                    glowColor={step.color}
                                    glowSpread={0.5}
                                >
                                    {step.title}
                                </NeonText>
                                <p className='text-sm md:text-base font-bold text-white/80 leading-relaxed'>
                                    {step.description}
                                </p>
                            </NeonBox>
                        ))}
                    </div>
                </div>

                {/* Important Notes */}
                <NeonBox
                    className='p-6 lg:p-8 rounded-2xl backdrop-blur-2xl mb-8'
                    backgroundColor='--color-yellow-500'
                    backgroundOpacity={0.1}
                >
                    <div className='flex flex-col sm:flex-row items-start gap-4 mb-4'>
                        <NeonIcon
                            icon='lucide:info'
                            size={32}
                            glowColor='--color-yellow-500'
                            className='flex-shrink-0'
                        />
                        <div className='flex-1'>
                            <NeonText
                                as='h3'
                                className='h3-title mb-4'
                                glowColor='--color-yellow-500'
                                glowSpread={0.5}
                            >
                                Important: One-Time Commission System
                            </NeonText>
                            <ul className='space-y-3 text-base md:text-lg font-bold'>
                                <li className='flex items-start gap-3'>
                                    <span className='text-yellow-400 mt-1'>•</span>
                                    <span>
                                        <strong>$20 is the minimum threshold</strong> to qualify, but commission is calculated on the{' '}
                                        <strong>FULL TOTAL</strong> spent when they qualify
                                    </span>
                                </li>
                                <li className='flex items-start gap-3'>
                                    <span className='text-yellow-400 mt-1'>•</span>
                                    <span>
                                        If a user's first payment is $60, you get commission on{' '}
                                        <strong>$60 (not just $20)</strong>
                                    </span>
                                </li>
                                <li className='flex items-start gap-3'>
                                    <span className='text-yellow-400 mt-1'>•</span>
                                    <span>
                                        Commission is <strong>locked at qualification</strong> - future purchases by the same user do not generate additional commissions
                                    </span>
                                </li>
                                <li className='flex items-start gap-3'>
                                    <span className='text-yellow-400 mt-1'>•</span>
                                    <span>
                                        This is a <strong>one-time commission system</strong>, not recurring commissions
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </NeonBox>

                {/* Examples */}
                <div>
                    <NeonText
                        as='h3'
                        className='h3-title mb-6 text-center'
                        glowColor='--color-purple-500'
                        glowSpread={0.5}
                    >
                        Commission Examples (15% Rate)
                    </NeonText>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {examples.map((example, index) => (
                            <NeonBox
                                key={index}
                                glowColor={example.color}
                                backgroundColor={example.color}
                                backgroundOpacity={0.1}
                                className='rounded-2xl backdrop-blur-2xl p-6 flex flex-col'
                            >
                                <NeonText
                                    as='h4'
                                    className='h4-title mb-3'
                                    glowColor={example.color}
                                    glowSpread={0.5}
                                >
                                    {example.scenario}
                                </NeonText>
                                <div className='mb-3 p-3 bg-neutral-800/50 rounded-lg'>
                                    <p className='text-sm text-white/70 mb-1'>
                                        Calculation:
                                    </p>
                                    <p className='text-lg font-bold font-mono'>
                                        {example.calculation}
                                    </p>
                                </div>
                                <div className='mt-auto'>
                                    <p className='text-base font-bold text-green-400'>
                                        {example.result}
                                    </p>
                                </div>
                            </NeonBox>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowCommissionsWork;

