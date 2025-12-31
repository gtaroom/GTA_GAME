import NeonBox from "../neon/neon-box"
import NeonIcon from "../neon/neon-icon"
import NeonText from "../neon/neon-text"

const ComingSoon = () => {
    return (
        <>
            {/* Coming Soon Section */}
            <div className='min-h-[60vh] flex items-center justify-center px-4 py-16'>
                <NeonBox
                    glowColor='--color-purple-500'
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.1}
                    className='max-w-2xl w-full p-8 md:p-12 rounded-lg text-center'
                >
                    <div className='flex flex-col items-center gap-6'>
                        {/* Icon */}
                        <div className='relative'>
                            <NeonIcon
                                icon='lucide:users'
                                size={80}
                                glowColor='--color-purple-500'
                                glowSpread={1.5}
                            />
                            <div className='absolute -top-2 -right-2'>
                                <NeonIcon
                                    icon='lucide:clock'
                                    size={32}
                                    glowColor='--color-yellow-500'
                                    glowSpread={1.2}
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <NeonText
                            as='h1'
                            className='text-4xl md:text-5xl font-bold mb-2'
                            glowColor='--color-purple-500'
                            glowSpread={1}
                        >
                            Coming Soon
                        </NeonText>

                        {/* Description */}
                        <NeonText
                            as='p'
                            className='text-lg md:text-xl text-gray-300 max-w-md mx-auto'
                        >
                            We're working hard to bring you an amazing referral program. 
                            Stay tuned for exciting updates!
                        </NeonText>

                        {/* Decorative Elements */}
                        <div className='flex items-center gap-2 mt-4'>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse'></div>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' style={{ animationDelay: '200ms' }}></div>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' style={{ animationDelay: '400ms' }}></div>
                        </div>
                    </div>
                </NeonBox>
            </div>
            </>
    )
}
export default ComingSoon;