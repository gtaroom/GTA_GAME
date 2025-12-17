import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import { DialogContent, DialogTitle } from '../ui/dialog';

interface ClaimFreeCoinsProps {
    onClaim: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function ClaimFreeCoins({ onClaim, loading = false, error }: ClaimFreeCoinsProps) {
    const { sm, md } = useBreakPoint();
    
    return (
        <DialogContent className='max-sm:[width:calc(100%-24px)] sm:max-w-[500px]!'>
            <div className='pt-5 pb-3 sm:px-5 sm:py-3 flex flex-col items-center text-center'>
                <DialogTitle className='mb-4' asChild>
                    <NeonText as='h3' className='h3-title'>
                        CLAIM YOUR FREE COINS!
                    </NeonText>
                </DialogTitle>

                <div className='relative z-[1] before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[100px] before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:bg-purple-500 before:blur-2xl before:z-[-1]'>
                    <Image
                        src='/modal/claim-free-coins.png'
                        height={sm ? 300 : 220}
                        width={sm ? 300 : 220}
                        alt='Claim Free Coins'
                    />
                </div>

                <div className='inline-flex gap-3 mb-2'>
                    <Image
                        src='/coins/gold-coin.svg'
                        height={38}
                        width={38}
                        alt='Gold Coin'
                    />
                    <NeonText
                        as='span'
                        className='text-h1-title font-bold'
                        glowColor='--color-yellow-500'
                        glowSpread={0.5}
                    >
                        10,000 GC
                    </NeonText>
                </div>

                <NeonText
                    as='span'
                    className='text-base md:text-lg uppercase font-bold relative z-[1] mb-4'
                    glowColor='--color-yellow-500'
                    glowSpread={0.3}
                >
                    Join Now and Start Playing with 10,000 Gold Coins On the
                    House!
                </NeonText>

                <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6'>
                    <NeonText as='h4' className='font-semibold text-blue-400 mb-2'>Understanding Your Coins:</NeonText>
                    <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2'>
                            <Image src='/coins/gold-coin.svg' width={16} height={16} alt='GC' />
                            <NeonText className='text-yellow-300'>
                                <strong>Gold Coins (GC)</strong> - For fun play only.
                            </NeonText>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Image src='/coins/sweep-coin.svg' width={16} height={16} alt='SC' />
                            <NeonText className='text-green-300'>
                                <strong>Sweep Coins (SC)</strong> -  Earned through gameplay and promotions can be redeemed after play
                            </NeonText>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg'>
                        <NeonText className='text-red-400 text-sm'>
                            {error}
                        </NeonText>
                    </div>
                )}

                <Button 
                    size={md ? 'lg' : 'md'} 
                    className='relative z-[1]' 
                    onClick={onClaim}
                    disabled={loading}
                >
                    {loading ? 'Claiming...' : 'Claim Now'}
                </Button>
            </div>
        </DialogContent>
    );
}
