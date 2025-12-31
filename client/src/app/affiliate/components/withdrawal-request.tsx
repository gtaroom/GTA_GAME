'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAffiliateWithdrawal } from '@/hooks/useAffiliateWithdrawal';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface WithdrawalRequestProps {
  publicToken?: string;
}

export default function WithdrawalRequest({ publicToken }: WithdrawalRequestProps) {
  const { balance, isSubmitting, submitWithdrawal, fetchBalance } = useAffiliateWithdrawal(publicToken);
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [paymentDetails, setPaymentDetails] = useState({
    paypalEmail: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    walletAddress: '',
    notes: '',
  });

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await submitWithdrawal({
      amount: parseFloat(amount),
      paymentMethod,
      paymentDetails,
    });

    if (result.success) {
      // Reset form
      setAmount('');
      setPaymentDetails({
        paypalEmail: '',
        accountNumber: '',
        accountName: '',
        bankName: '',
        walletAddress: '',
        notes: '',
      });
    }
  };

  if (!balance) {
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
        Request Withdrawal
      </NeonText>

      {/* Balance Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <NeonBox
          className='p-4 rounded-lg'
          backgroundColor='--color-green-500'
          backgroundOpacity={0.1}
        >
          <p className='text-sm text-white/60 mb-1'>Available Balance</p>
          <p className='text-2xl font-bold text-green-400'>
            ${balance.availableBalance.toFixed(2)}
          </p>
        </NeonBox>
        <NeonBox
          className='p-4 rounded-lg'
          backgroundColor='--color-blue-500'
          backgroundOpacity={0.1}
        >
          <p className='text-sm text-white/60 mb-1'>Minimum Withdrawal</p>
          <p className='text-2xl font-bold text-blue-400'>
            ${balance.minimumWithdrawal.toFixed(2)}
          </p>
        </NeonBox>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Amount */}
        <div>
          <label className='block text-sm font-medium text-white/80 mb-2'>
            Amount ($) <span className='text-red-400'>*</span>
          </label>
          <Input
            type='number'
            step='0.01'
            min={balance.minimumWithdrawal}
            max={balance.availableBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: $${balance.minimumWithdrawal.toFixed(2)}`}
            required
            className='w-full'
          />
          <p className='text-xs text-white/50 mt-1'>
            Available: ${balance.availableBalance.toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className='block text-sm font-medium text-white/80 mb-2'>
            Payment Method <span className='text-red-400'>*</span>
          </label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select payment method' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='PayPal'>PayPal</SelectItem>
              <SelectItem value='Bank Transfer'>Bank Transfer</SelectItem>
              <SelectItem value='Crypto'>Cryptocurrency</SelectItem>
              <SelectItem value='Other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Details - PayPal */}
        {paymentMethod === 'PayPal' && (
          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              PayPal Email <span className='text-red-400'>*</span>
            </label>
            <Input
              type='email'
              value={paymentDetails.paypalEmail}
              onChange={(e) =>
                setPaymentDetails({
                  ...paymentDetails,
                  paypalEmail: e.target.value,
                })
              }
              placeholder='your.email@example.com'
              required
              className='w-full'
            />
          </div>
        )}

        {/* Payment Details - Bank Transfer */}
        {paymentMethod === 'Bank Transfer' && (
          <>
            <div>
              <label className='block text-sm font-medium text-white/80 mb-2'>
                Account Number <span className='text-red-400'>*</span>
              </label>
              <Input
                type='text'
                value={paymentDetails.accountNumber}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    accountNumber: e.target.value,
                  })
                }
                placeholder='Enter account number'
                required
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white/80 mb-2'>
                Account Name <span className='text-red-400'>*</span>
              </label>
              <Input
                type='text'
                value={paymentDetails.accountName}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    accountName: e.target.value,
                  })
                }
                placeholder='Account holder name'
                required
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white/80 mb-2'>
                Bank Name <span className='text-red-400'>*</span>
              </label>
              <Input
                type='text'
                value={paymentDetails.bankName}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    bankName: e.target.value,
                  })
                }
                placeholder='Name of your bank'
                required
                className='w-full'
              />
            </div>
          </>
        )}

        {/* Payment Details - Crypto */}
        {paymentMethod === 'Crypto' && (
          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              Wallet Address <span className='text-red-400'>*</span>
            </label>
            <Input
              type='text'
              value={paymentDetails.walletAddress}
              onChange={(e) =>
                setPaymentDetails({
                  ...paymentDetails,
                  walletAddress: e.target.value,
                })
              }
              placeholder='0x...'
              required
              className='w-full'
            />
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className='block text-sm font-medium text-white/80 mb-2'>
            Additional Notes (Optional)
          </label>
          <Input
            type='text'
            value={paymentDetails.notes}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                notes: e.target.value,
              })
            }
            placeholder='Any additional information'
            className='w-full'
          />
        </div>

        {/* Submit Button */}
        <Button
          type='submit'
          size='lg'
          disabled={isSubmitting || !amount || parseFloat(amount) < balance.minimumWithdrawal}
          className='w-full'
        >
          {isSubmitting ? (
            <>
              <NeonIcon
                icon='svg-spinners:bars-rotate-fade'
                size={20}
                className='mr-2'
              />
              Submitting...
            </>
          ) : (
            'Submit Withdrawal Request'
          )}
        </Button>

        {/* Info Note */}
        <div className='text-xs text-white/60 space-y-1'>
          <p>
            <NeonIcon icon='lucide:info' size={14} className='inline mr-1' />
            Your request will be reviewed by our team.
          </p>
          <p>
            <NeonIcon icon='lucide:mail' size={14} className='inline mr-1' />
            You'll receive an email confirmation once your request is processed.
          </p>
        </div>
      </form>
    </NeonBox>
  );
}

