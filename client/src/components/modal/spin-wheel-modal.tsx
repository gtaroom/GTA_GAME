'use client';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { SpinWheelOption } from '@/types/spin-wheel';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import SpinWheel from '../spin-wheel';
import { Button } from '../ui/button';
import { DialogContent, DialogTitle, DialogClose } from '../ui/dialog';
import { claimSpinReward, getSpinWheelConfig, useBonusSpin } from '@/lib/api/vip';
import { useAuth } from '@/contexts/auth-context';
import { useWalletBalance } from '@/contexts/wallet-balance-context';

interface SpinWheelModalProps {
    onSpinsUpdate?: (spinsRemaining: number) => void;
}

function SpinWheelModal({ onSpinsUpdate }: SpinWheelModalProps) {
    const { xxs, xs } = useBreakPoint();
    const [result, setResult] = useState<SpinWheelOption | null>(null);
    const [configRewards, setConfigRewards] = useState<Array<{ id: number; amount: number; type: 'GC' | 'SC'; rarity?: string }>>([]);
    const [spinningIdx, setSpinningIdx] = useState<number | null>(null);
    const router = useTransitionRouter();
    const {  updateUserSCBalance } = useAuth();
    const {refresh:refreshWalletBalance}=useWalletBalance();

    // Load spin-wheel config
    useEffect(() => {
        (async () => {
            try {
                const cfg = await getSpinWheelConfig();
                if (cfg.success) setConfigRewards(cfg.data.rewards || []);
            } catch {}
        })();
    }, []);

    const options: SpinWheelOption[] = useMemo(() => {
        if (!configRewards.length) return [];
        return configRewards.map((r, idx) => ({
            id: String(r.id ?? idx + 1),
            label: (
                <>
                    <img
                        src={r.type === 'GC' ? '/coins/bronze-coin.svg' : '/coins/sweep-coin.svg'}
                        className='xs:w-6 xs:h-6 h-5 w-5 mb-1'
                        alt={r.type === 'GC' ? 'Gold Coin' : 'Sweep Coin'}
                    />
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(r.amount)}
                </>
            ),
            value: { id: r.id, amount: r.amount, type: r.type, rarity: r.rarity },
        }));
    }, [configRewards]);

    return (
        <DialogContent className='lg:max-w-fit!' neonBoxClass='max-sm:px-2!'>
            <div className='py-4 flex flex-col items-center text-center'>
                {result ? (
                    // Enhanced Result View
                    <div className='flex flex-col items-center justify-center text-center relative'>
                        <DialogTitle asChild>
                            <NeonText as='h3' className='h3-title mb-2'>
                                CONGRATULATIONS!
                            </NeonText>
                        </DialogTitle>

                        <p className='text-lg mb-8 font-medium'>
                            You have won an amazing prize!
                        </p>

                        {/* Enhanced Prize Display */}
                        <div className='relative'>
                            <NeonBox
                                glowColor='--color-purple-500'
                                backgroundColor='--color-purple-500'
                                backgroundOpacity={0.2}
                                className='px-6 py-3 rounded-md border-2 border-purple-500/30 relative overflow-hidden mb-10'
                            >
                                <div className='relative z-10 flex items-center gap-4'>
                                    <div className='text-2xl [&>img]:w-6 [&>img]:h-6 [&>img]:mb-0 font-bold uppercase flex items-center gap-3'>
                                        {result.label}
                                    </div>
                                </div>
                            </NeonBox>
                        </div>

                        <NeonBox
                            glowColor='--color-blue-500'
                            backgroundColor='--color-blue-500'
                            backgroundOpacity={0.2}
                            className='px-[20px] py-[12px] rounded-[8px] max-lg:mx-auto inline-flex items-center gap-2 mb-8'
                        >
                            <NeonText
                                as='span'
                                glowColor='--color-blue-500'
                                glowSpread={0.4}
                                className='text-base sm:text-lg font-bold uppercase'
                            >
                                Prize added to your account successfully!
                            </NeonText>
                        </NeonBox>

                        {/* Continue Button */}
                        <DialogClose asChild>
                            <Button size='lg'>
                            Continue Playing
                        </Button>
                        </DialogClose>
                    </div>
                ) : (
                    <>
                        <DialogTitle asChild>
                            <NeonText as='h3' className='h3-title mb-8'>
                                Treasure Wheel
                            </NeonText>
                        </DialogTitle>

                        {/* <NeonBox
                            glowColor='--color-green-500'
                            backgroundColor='--color-green-500'
                            backgroundOpacity={0.2}
                            className='px-[20px] py-[12px] rounded-[8px] max-lg:mx-auto mb-1 inline-flex items-center gap-2'
                        >
                            <Image
                                src='/coins/sweep-coin.svg'
                                height={24}
                                width={24}
                                alt='sweep coin'
                            />
                            <NeonText
                                as='span'
                                glowColor='--color-green-500'
                                glowSpread={0.4}
                                className='text-base sm:text-xl font-bold uppercase'
                            >
                                4,00,000 SC
                            </NeonText>
                        </NeonBox> */}

                        <SpinWheel
                            options={options}
                            onSpin={winner => {
                                console.log('🎯 Winner displayed:', winner);
                                setResult(winner);
                            }}
                            requestWinnerIndex={async () => {
                                // Trigger server spin to get actual result and spinsRemaining
                                const res = await useBonusSpin('vip-wheel', 'VIP Wheel');
                                console.log('🎲 Backend spin result:', res.data.spinResult);
                                console.log('📋 Options array:', options.map((o, i) => ({ index: i, id: (o.value as any)?.id, amount: (o.value as any)?.amount })));
                                
                                if (res.success && res.data.spinResult) {
                                    const idx = options.findIndex(o => (o.value as any)?.id === res.data.spinResult?.rewardId);
                                    console.log(`🎯 Found rewardId ${res.data.spinResult?.rewardId} at index: ${idx}`);
                                    setSpinningIdx(idx >= 0 ? idx : null);
                                    
                                    // Auto-claim reward after spin completes (increased delay to match spinDuration + revealOffset)
                                    setTimeout(async () => {
                                        try {
                                            await claimSpinReward(res.data.spinResult!.spinId);
                                            if (res.data.spinResult?.type === 'GC') {
                                                refreshWalletBalance();
                                            }
                                            if (res.data.spinResult?.type === 'SC') {
                                                updateUserSCBalance(res.data.spinResult.amount);
                                            }
                                            if (typeof res.data.spinsRemaining === 'number') {
                                                onSpinsUpdate?.(res.data.spinsRemaining);
                                            }
                                        } catch (err) {
                                            console.error('Claim error:', err);
                                        }
                                    }, 4500);
                                    return idx >= 0 ? idx : Math.floor(Math.random() * options.length);
                                }
                                return Math.floor(Math.random() * options.length);
                            }}
                            size={xs ? 430 : xxs ? 320 : 260}
                            pointerOffsetDeg={4}
                            spinDuration={4500}
                            revealOffsetMs={500}
                        />

                        {/* <div className='inline-flex items-center rounded-lg gap-3 mt-10'>
                            <NeonText
                                glowColor='--color-purple-500'
                                className='text-lg uppercase font-bold'
                                glowSpread={0.5}
                            >
                                EXPIRES IN: 20:08 MINUTES
                            </NeonText>
                        </div> */}
                    </>
                )}
            </div>
        </DialogContent>
    );
}

export default SpinWheelModal;
