import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';

function ManageYourProgress() {
    const progressInfo = [
        {
            icon: 'lucide:badge-check',
            title: 'KYC Verified',
            description: 'Complete this to unlock redemption and rewards',
            color: '--color-purple-500',
        },
        {
            icon: 'lucide:eye',
            title: 'Balances Always Visible',
            description: 'See GC and SC balances on every page, in real time.',
            color: '--color-red-500',
        },
        {
            icon: 'lucide:clipboard-list',
            title: 'Track Your Activity',
            description: 'View your full history of games and rewards',
            color: '--color-blue-500',
        },
        {
            icon: 'lucide:handshake',
            title: 'Instant Help',
            description:
                'Chat live or visit our help center anytime for support.',
            color: '--color-green-500',
        },
        {
            icon: 'lucide:hourglass',
            title: 'Stay In The Loop',
            description: 'Get promos and updates straight to your inbox',
            color: '--color-yellow-500',
        },
    ];

    return (
        <section className='mb-14 xl:mb-22 md:mb-16'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    Manage Your Progress with Ease
                </NeonText>
                <div className='row row-gap-32 lg:row-gap-40 justify-center'>
                    {progressInfo.map((progress, index) => (
                        <div className='lg:col-4 md:col-6' key={index}>
                            <NeonBox
                                glowColor={progress.color}
                                backgroundColor={progress.color}
                                backgroundOpacity={0.1}
                                className='p-6 lg:p-10 md:p-8 rounded-2xl backdrop-blur-2xl flex flex-col items-center text-center h-full'
                            >
                                <NeonIcon
                                    icon={progress.icon}
                                    size={50}
                                    glowColor={progress.color}
                                    className='mb-4'
                                />
                                <NeonText
                                    as='h5'
                                    className='h5-title mb-3'
                                    glowColor={progress.color}
                                    glowSpread={0.5}
                                >
                                    {progress.title}
                                </NeonText>
                                <p className='text-base font-bold max-w-[90%] capitalize'>
                                    {progress.description}
                                </p>
                            </NeonBox>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ManageYourProgress;
