'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import type { PaymentFailedPageProps } from '../types';

export default function BuyCoinsFailedPage() {
    const params = useSearchParams();
    const router = useRouter();
    const reason = params.get('reason') || 'Something went wrong while processing your payment.';

    return (
        <div className='container mx-auto max-w-3xl py-10 px-4'>
            <NeonBox
                glowColor='--color-red-500'
                backgroundColor='--color-red-500'
                backgroundOpacity={0.08}
                className='rounded-xl p-8 text-center'
            >
                <div className='mb-4 flex justify-center'>
                    <div className='w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center'>
                        <NeonIcon icon='lucide:alert-triangle' size={28} glowColor='--color-red-500' />
                    </div>
                </div>
                <NeonText as='h2' className='h3-title mb-2' glowColor='--color-red-500'>
                    Payment Failed
                </NeonText>
                <p className='opacity-80 mb-6'>
                    {reason}
                </p>

                <div className='space-x-3'>
                    <Button onClick={() => router.push('/buy-coins')}>
                        Try Again
                    </Button>
                    <Button variant='secondary' onClick={() => router.push('/support')}>
                        Contact Support
                    </Button>
                </div>
            </NeonBox>
        </div>
    );
}


