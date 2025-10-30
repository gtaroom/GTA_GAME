'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import type { PaymentSuccessPageProps } from '../types';

export default function BuyCoinsSuccessPage() {
    const params = useSearchParams();
    const router = useRouter();

    const amount = params.get('amount');
    const totalGC = params.get('totalGC');
    const bonusGC = params.get('bonusGC');
    const orderId = params.get('orderId');

    return (
        <div className='container mx-auto max-w-3xl py-10 px-4'>
            <NeonBox
                glowColor='--color-green-500'
                backgroundColor='--color-green-500'
                backgroundOpacity={0.08}
                className='rounded-xl p-8 text-center'
            >
                <div className='mb-4 flex justify-center'>
                    <div className='w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center'>
                        <NeonIcon icon='lucide:check' size={28} glowColor='--color-green-500' />
                    </div>
                </div>
                <NeonText as='h2' className='h3-title mb-2' glowColor='--color-green-500'>
                    Payment Successful
                </NeonText>
                <p className='opacity-80 mb-6'>
                    Your purchase has been completed. Order ID: <span className='font-semibold'>{orderId}</span>
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                    <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.08}
                        className='rounded-lg p-4'
                    >
                        <div className='text-sm opacity-80 mb-1'>Amount Paid</div>
                        <div className='text-xl font-bold'>${amount}</div>
                    </NeonBox>
                    <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.08}
                        className='rounded-lg p-4'
                    >
                        <div className='text-sm opacity-80 mb-1'>Gold Coins</div>
                        <div className='text-xl font-bold'>{totalGC}</div>
                    </NeonBox>
                    <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.08}
                        className='rounded-lg p-4'
                    >
                        <div className='text-sm opacity-80 mb-1'>Bonus Coins</div>
                        <div className='text-xl font-bold'>{bonusGC}</div>
                    </NeonBox>
                </div>

                <div className='space-x-3'>
                    <Button onClick={() => router.push('/game-listing?tab=exclusive')}>
                        Explore Games
                    </Button>
                    <Button variant='secondary' onClick={() => router.push('/profile')}>
                        Go to My Account
                    </Button>
                </div>
            </NeonBox>

            <div className='mt-10 text-center opacity-80'>
                <div className='mb-2'>Use your GC in:</div>
                <div className='flex items-center justify-center gap-3 flex-wrap'>
                    <span className='px-3 py-1 rounded-full border border-white/10'>Exclusive Games</span>
                    <span className='px-3 py-1 rounded-full border border-white/10'>Signature Games</span>
                    {/* <span className='px-3 py-1 rounded-full border border-white/10'>Featured Slots</span> */}
                </div>
            </div>
        </div>
    );
}


