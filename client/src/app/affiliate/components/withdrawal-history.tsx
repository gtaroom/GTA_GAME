'use client';

import { useEffect } from 'react';
import { useAffiliateWithdrawal } from '@/hooks/useAffiliateWithdrawal';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WithdrawalHistoryProps {
  publicToken?: string;
}

export default function WithdrawalHistory({ publicToken }: WithdrawalHistoryProps) {
  const { withdrawals, pagination, isLoading, fetchHistory, changePage } =
    useAffiliateWithdrawal(publicToken);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        color: 'yellow',
        text: 'Pending Review',
        icon: 'lucide:clock',
      },
      approved: {
        color: 'blue',
        text: 'Approved',
        icon: 'lucide:check-circle',
      },
      rejected: {
        color: 'red',
        text: 'Rejected',
        icon: 'lucide:x-circle',
      },
      paid: {
        color: 'green',
        text: 'Paid',
        icon: 'lucide:check-check',
      },
    };
    return (
      badges[status as keyof typeof badges] || {
        color: 'gray',
        text: status,
        icon: 'lucide:help-circle',
      }
    );
  };

  if (isLoading && withdrawals.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <NeonIcon icon='svg-spinners:bars-rotate-fade' size={32} />
      </div>
    );
  }

  return (
    <NeonBox
      className='p-6 md:p-8 rounded-2xl backdrop-blur-2xl'
      backgroundColor='--color-purple-500'
      backgroundOpacity={0.05}
    >
      <NeonText
        as='h3'
        className='text-xl md:text-2xl font-bold mb-6'
        glowColor='--color-purple-500'
        glowSpread={0.4}
      >
        Withdrawal History
      </NeonText>

      {withdrawals.length === 0 ? (
        <div className='text-center py-12'>
          <NeonIcon
            icon='lucide:wallet'
            size={48}
            className='text-white/30 mb-4 mx-auto'
          />
          <p className='text-white/60'>No withdrawal requests yet</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/10'>
                  <th className='text-left py-3 px-4 text-sm font-medium text-white/70'>
                    Amount
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-white/70'>
                    Payment Method
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-white/70'>
                    Status
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-white/70'>
                    Requested
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-white/70'>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const badge = getStatusBadge(withdrawal.status);
                  return (
                    <tr
                      key={withdrawal._id}
                      className='border-b border-white/5 hover:bg-white/5 transition-colors'
                    >
                      <td className='py-4 px-4'>
                        <span className='font-bold text-white'>
                          ${withdrawal.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className='py-4 px-4 text-white/80'>
                        {withdrawal.paymentMethod || 'N/A'}
                      </td>
                      <td className='py-4 px-4'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                            badge.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400',
                            badge.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                            badge.color === 'red' && 'bg-red-500/20 text-red-400',
                            badge.color === 'green' && 'bg-green-500/20 text-green-400'
                          )}
                        >
                          <NeonIcon icon={badge.icon} size={14} />
                          {badge.text}
                        </span>
                      </td>
                      <td className='py-4 px-4 text-white/70 text-sm'>
                        {new Date(withdrawal.requestedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className='py-4 px-4'>
                        {withdrawal.rejectionReason && (
                          <div className='flex items-start gap-2 text-xs text-red-400'>
                            <NeonIcon
                              icon='lucide:alert-circle'
                              size={14}
                              className='mt-0.5'
                            />
                            <span>{withdrawal.rejectionReason}</span>
                          </div>
                        )}
                        {withdrawal.paidAt && (
                          <div className='text-xs text-green-400'>
                            Paid: {new Date(withdrawal.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className='md:hidden space-y-4'>
            {withdrawals.map((withdrawal) => {
              const badge = getStatusBadge(withdrawal.status);
              return (
                <NeonBox
                  key={withdrawal._id}
                  className='p-4 rounded-lg'
                  backgroundColor='--color-white'
                  backgroundOpacity={0.02}
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        ${withdrawal.amount.toFixed(2)}
                      </p>
                      <p className='text-sm text-white/60'>
                        {withdrawal.paymentMethod || 'N/A'}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                        badge.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400',
                        badge.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                        badge.color === 'red' && 'bg-red-500/20 text-red-400',
                        badge.color === 'green' && 'bg-green-500/20 text-green-400'
                      )}
                    >
                      <NeonIcon icon={badge.icon} size={14} />
                      {badge.text}
                    </span>
                  </div>
                  <div className='space-y-1 text-sm'>
                    <p className='text-white/60'>
                      Requested:{' '}
                      <span className='text-white'>
                        {new Date(withdrawal.requestedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                    {withdrawal.rejectionReason && (
                      <div className='flex items-start gap-2 text-xs text-red-400 mt-2'>
                        <NeonIcon
                          icon='lucide:alert-circle'
                          size={14}
                          className='mt-0.5'
                        />
                        <span>{withdrawal.rejectionReason}</span>
                      </div>
                    )}
                    {withdrawal.paidAt && (
                      <p className='text-xs text-green-400 mt-2'>
                        Paid: {new Date(withdrawal.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </NeonBox>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className='flex items-center justify-between mt-6 pt-6 border-t border-white/10'>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                <NeonIcon icon='lucide:chevron-left' size={16} className='mr-1' />
                Previous
              </Button>
              <span className='text-sm text-white/70'>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || isLoading}
              >
                Next
                <NeonIcon icon='lucide:chevron-right' size={16} className='ml-1' />
              </Button>
            </div>
          )}
        </>
      )}
    </NeonBox>
  );
}

