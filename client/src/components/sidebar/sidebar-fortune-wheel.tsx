'use client';
import NeonBox from "../neon/neon-box";
import NeonText from "../neon/neon-text";
import Image from 'next/image';
import { useSpinWheel } from '@/contexts/spin-wheel-context';
import { useAuth } from '@/contexts/auth-context';

export default function FortuneWheelCard() {
    const { isLoggedIn } = useAuth();
    const { spinsAvailable, isChecking, openModal } = useSpinWheel();
    
    const hasSpins = spinsAvailable > 0;
    
    const handleClick = () => {
        if (hasSpins) {
            openModal();
        }
    };

    // Don't show if not logged in
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className='px-5'>
            <NeonBox
                glowColor={hasSpins ? '--color-green-500' : '--color-yellow-500'}
                backgroundColor={hasSpins ? '--color-green-500' : '--color-yellow-500'}
                backgroundOpacity={hasSpins ? 0.2 : 0.1}
                className={`p-4 rounded-lg overflow-hidden relative ${hasSpins ? 'cursor-pointer hover:scale-[1.02] transition-transform duration-300' : ''}`}
                onClick={handleClick}
            >
                <div className='flex items-center justify-between relative'>
                    <div className='flex-1 z-10'>
                        <NeonText
                            as='h6'
                            className='text-lg font-bold uppercase'
                        >
                            Treasure Wheel
                        </NeonText>
                        {isChecking ? (
                            <NeonText
                                as='p'
                                className='text-sm mb-0 block uppercase font-semibold'
                                glowColor='--color-yellow-500'
                            >
                                Loading...
                            </NeonText>
                        ) : hasSpins ? (
                            <div className='flex items-center gap-2'>
                                <NeonText
                                    as='p'
                                    className='text-sm mb-0 block font-bold'
                                    glowColor='--color-green-500'
                                >
                                    {spinsAvailable} {spinsAvailable === 1 ? 'Spin' : 'Spins'} Available!
                                </NeonText>
                                <span className='animate-pulse'>🎯</span>
                            </div>
                        ) : (
                            <NeonText
                                as='p'
                                className='text-sm mb-0 block font-medium opacity-70'
                                glowColor='--color-yellow-500'
                            >
                                No spins available
                            </NeonText>
                        )}
                    </div>
                    <div className='absolute right-[-80] top-1/2 transform -translate-y-1/2'>
                        <Image
                            src={'/spin-wheel/wheel.avif'}
                            alt={'Treasure Wheel'}
                            width={120}
                            height={120}
                            className={`transition-all duration-300 hover:scale-110 ${hasSpins ? 'animate-pulse' : 'opacity-40'}`}
                            style={{
                                animation: hasSpins ? 'wheelGlow 2s ease-in-out infinite alternate' : undefined
                            }}
                        />
                    </div>
                </div>
            </NeonBox>
        </div>
    )
}