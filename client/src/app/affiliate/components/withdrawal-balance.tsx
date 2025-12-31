'use client';

import { useEffect } from 'react';
import { useAffiliateWithdrawal } from '@/hooks/useAffiliateWithdrawal';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';

interface WithdrawalBalanceProps {
  publicToken?: string;
}

export default function WithdrawalBalance({ publicToken }: WithdrawalBalanceProps) {
  const { balance, isLoading, fetchBalance } = useAffiliateWithdrawal(publicToken);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (isLoading && !balance) {
    return (
      <div className='flex items-center justify-center py-8'>
        <NeonIcon icon='svg-spinners:bars-rotate-fade' size={32} />
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      <NeonBox
        className='p-6 rounded-xl backdrop-blur-2xl'
        backgroundColor='--color-green-500'
        backgroundOpacity={0.1}
      >
        <div className='flex items-center gap-3 mb-2'>
          <NeonIcon
            icon='lucide:dollar-sign'
            size={24}
            className='text-green-400'
          />
          <p className='text-sm text-white/70'>Total Earnings</p>
        </div>
        <NeonText
          as='p'
          className='text-3xl font-bold'
          glowColor='--color-green-500'
          glowSpread={0.3}
        >
          ${balance.totalEarnings.toFixed(2)}
        </NeonText>
      </NeonBox>

      <NeonBox
        className='p-6 rounded-xl backdrop-blur-2xl'
        backgroundColor='--color-blue-500'
        backgroundOpacity={0.1}
      >
        <div className='flex items-center gap-3 mb-2'>
          <NeonIcon
            icon='lucide:check-circle'
            size={24}
            className='text-blue-400'
          />
          <p className='text-sm text-white/70'>Total Paid</p>
        </div>
        <NeonText
          as='p'
          className='text-3xl font-bold'
          glowColor='--color-blue-500'
          glowSpread={0.3}
        >
          ${balance.totalPaid.toFixed(2)}
        </NeonText>
      </NeonBox>

      <NeonBox
        className='p-6 rounded-xl backdrop-blur-2xl'
        backgroundColor='--color-yellow-500'
        backgroundOpacity={0.1}
      >
        <div className='flex items-center gap-3 mb-2'>
          <NeonIcon
            icon='lucide:clock'
            size={24}
            className='text-yellow-400'
          />
          <p className='text-sm text-white/70'>Pending</p>
        </div>
        <NeonText
          as='p'
          className='text-3xl font-bold'
          glowColor='--color-yellow-500'
          glowSpread={0.3}
        >
          ${balance.pendingWithdrawals.toFixed(2)}
        </NeonText>
      </NeonBox>

      <NeonBox
        className='p-6 rounded-xl backdrop-blur-2xl'
        backgroundColor='--color-purple-500'
        backgroundOpacity={0.1}
      >
        <div className='flex items-center gap-3 mb-2'>
          <NeonIcon
            icon='lucide:wallet'
            size={24}
            className='text-purple-400'
          />
          <p className='text-sm text-white/70'>Available</p>
        </div>
        <NeonText
          as='p'
          className='text-3xl font-bold'
          glowColor='--color-purple-500'
          glowSpread={0.3}
        >
          ${balance.availableBalance.toFixed(2)}
        </NeonText>
      </NeonBox>
    </div>
  );
}

