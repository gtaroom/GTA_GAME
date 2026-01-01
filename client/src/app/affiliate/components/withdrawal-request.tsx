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

// Function to detect sensitive information patterns
const containsSensitiveInfo = (value: string): { detected: boolean; message: string } => {
  if (!value || value.trim().length === 0) {
    return { detected: false, message: '' };
  }

  const normalizedValue = value.toLowerCase().trim();

  // Bank-related keywords
  const bankKeywords = [
    'account number',
    'account no',
    'acc no',
    'acc number',
    'bank account',
    'routing number',
    'routing no',
    'swift code',
    'iban',
    'bank name',
    'bank details',
    'checking account',
    'savings account',
    'credit card',
    'card number',
    'cvv',
    'cvc',
    'expiry',
    'expiration',
    'ssn',
    'social security',
    'tax id',
    'ein',
    'passport',
    'drivers license',
    'driver license',
    'dl number',
  ];

  // Check for bank keywords
  for (const keyword of bankKeywords) {
    if (normalizedValue.includes(keyword)) {
      return {
        detected: true,
        message: 'Please do not include bank account details, card numbers, or other sensitive financial information.',
      };
    }
  }

  // Check for long numeric sequences (potential account numbers - 8+ digits)
  const longNumericSequence = /\d{8,}/g;
  if (longNumericSequence.test(value.replace(/[\s-]/g, ''))) {
    // Allow crypto wallet addresses (they start with 0x or are alphanumeric)
    if (!/^0x[a-fA-F0-9]+$/.test(value.trim()) && !/^[a-zA-Z0-9]{26,}$/.test(value.trim())) {
      return {
        detected: true,
        message: 'Please do not include account numbers or other sensitive numeric information.',
      };
    }
  }

  // Check for routing number pattern (exactly 9 digits)
  const routingNumberPattern = /\b\d{9}\b/;
  if (routingNumberPattern.test(value.replace(/[\s-]/g, ''))) {
    return {
      detected: true,
      message: 'Please do not include routing numbers or bank identifiers.',
    };
  }

  // Check for credit card pattern (13-19 digits with possible spaces/dashes)
  const creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,4}\b/;
  if (creditCardPattern.test(value)) {
    return {
      detected: true,
      message: 'Please do not include credit card numbers or payment card information.',
    };
  }

  // Check for SSN pattern (XXX-XX-XXXX or XXX XX XXXX)
  const ssnPattern = /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/;
  if (ssnPattern.test(value)) {
    return {
      detected: true,
      message: 'Please do not include Social Security Numbers or personal identification numbers.',
    };
  }

  return { detected: false, message: '' };
};

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
  const [sensitiveInfoError, setSensitiveInfoError] = useState<{
    field: string;
    message: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Validate input for sensitive information
  const validateInput = (field: string, value: string): boolean => {
    // Always allow clearing the field
    if (!value || value.trim().length === 0) {
      if (sensitiveInfoError?.field === field) {
        setSensitiveInfoError(null);
      }
      return true;
    }

    const validation = containsSensitiveInfo(value);
    if (validation.detected) {
      setSensitiveInfoError({
        field,
        message: validation.message,
      });
      return false;
    } else {
      // Clear error if it was for this field
      if (sensitiveInfoError?.field === field) {
        setSensitiveInfoError(null);
      }
      return true;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Final validation check before submission
    let hasSensitiveInfo = false;

    // Check PayPal email
    if (paymentMethod === 'PayPal' && paymentDetails.paypalEmail) {
      const validation = containsSensitiveInfo(paymentDetails.paypalEmail);
      if (validation.detected) {
        setSensitiveInfoError({
          field: 'paypalEmail',
          message: validation.message,
        });
        hasSensitiveInfo = true;
      }
    }

    // Check wallet address
    if (paymentMethod === 'Crypto' && paymentDetails.walletAddress) {
      const validation = containsSensitiveInfo(paymentDetails.walletAddress);
      if (validation.detected) {
        setSensitiveInfoError({
          field: 'walletAddress',
          message: validation.message,
        });
        hasSensitiveInfo = true;
      }
    }

    // Check notes
    if (paymentDetails.notes) {
      const validation = containsSensitiveInfo(paymentDetails.notes);
      if (validation.detected) {
        setSensitiveInfoError({
          field: 'notes',
          message: validation.message,
        });
        hasSensitiveInfo = true;
      }
    }

    if (hasSensitiveInfo) {
      return;
    }

    const result = await submitWithdrawal({
      amount: parseFloat(amount),
      paymentMethod,
      paymentDetails,
    });

    if (result.success) {
      // Show success message
      setSuccessMessage('Withdrawal request submitted successfully! Our team will review it and you will receive an email confirmation once processed.');
      
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
      setSensitiveInfoError(null);
      setPaymentMethod('PayPal');

      // Clear success message after 10 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
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

      {/* Success Message */}
      {successMessage && (
        <NeonBox
          className='p-4 rounded-lg mb-6'
          backgroundColor='--color-green-500'
          backgroundOpacity={0.1}
          glowColor='--color-green-500'
        >
          <div className='flex items-start gap-3'>
            <NeonIcon
              icon='lucide:check-circle'
              size={20}
              className='text-green-400 flex-shrink-0 mt-0.5'
              glowColor='--color-green-500'
            />
            <div className='flex-1'>
              <p className='text-sm font-medium text-green-400 mb-1'>Success!</p>
              <p className='text-xs text-green-300/80'>{successMessage}</p>
            </div>
            <button
              type='button'
              onClick={() => setSuccessMessage(null)}
              className='text-green-400/60 hover:text-green-400 transition-colors flex-shrink-0'
              aria-label='Close success message'
            >
              <NeonIcon icon='lucide:x' size={16} />
            </button>
          </div>
        </NeonBox>
      )}

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
            onChange={(e) => {
              setAmount(e.target.value);
              if (successMessage) setSuccessMessage(null);
            }}
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
          <Select 
            value={paymentMethod} 
            onValueChange={(value) => {
              setPaymentMethod(value);
              if (successMessage) setSuccessMessage(null);
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select payment method' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='PayPal'>PayPal</SelectItem>
              {/* <SelectItem value='Bank Transfer'>Bank Transfer</SelectItem> */}
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
              onChange={(e) => {
                const value = e.target.value;
                if (successMessage) setSuccessMessage(null);
                if (validateInput('paypalEmail', value)) {
                  setPaymentDetails({
                    ...paymentDetails,
                    paypalEmail: value,
                  });
                }
              }}
              placeholder='your.email@example.com'
              required
              className={cn(
                'w-full',
                sensitiveInfoError?.field === 'paypalEmail' && 'border-red-500'
              )}
            />
            {sensitiveInfoError?.field === 'paypalEmail' && (
              <p className='text-xs text-red-400 mt-1 flex items-center gap-1'>
                <NeonIcon icon='lucide:alert-circle' size={14} />
                {sensitiveInfoError.message}
              </p>
            )}
          </div>
        )}

        {/* Payment Details - Bank Transfer */}
        {/* {paymentMethod === 'Bank Transfer' && (
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
        )} */}

        {/* Payment Details - Crypto */}
        {paymentMethod === 'Crypto' && (
          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              Wallet Address <span className='text-red-400'>*</span>
            </label>
            <Input
              type='text'
              value={paymentDetails.walletAddress}
              onChange={(e) => {
                const value = e.target.value;
                if (successMessage) setSuccessMessage(null);
                if (validateInput('walletAddress', value)) {
                  setPaymentDetails({
                    ...paymentDetails,
                    walletAddress: value,
                  });
                }
              }}
              placeholder='0x...'
              required
              className={cn(
                'w-full',
                sensitiveInfoError?.field === 'walletAddress' && 'border-red-500'
              )}
            />
            {sensitiveInfoError?.field === 'walletAddress' && (
              <p className='text-xs text-red-400 mt-1 flex items-center gap-1'>
                <NeonIcon icon='lucide:alert-circle' size={14} />
                {sensitiveInfoError.message}
              </p>
            )}
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
            onChange={(e) => {
              const value = e.target.value;
              if (successMessage) setSuccessMessage(null);
              if (validateInput('notes', value)) {
                setPaymentDetails({
                  ...paymentDetails,
                  notes: value,
                });
              }
            }}
            placeholder='Need a different payment method? Let us know here...'
            className={cn(
              'w-full',
              sensitiveInfoError?.field === 'notes' && 'border-red-500'
            )}
          />
          {sensitiveInfoError?.field === 'notes' && (
            <p className='text-xs text-red-400 mt-1 flex items-center gap-1'>
              <NeonIcon icon='lucide:alert-circle' size={14} />
              {sensitiveInfoError.message}
            </p>
          )}
          <div className='space-y-2 mt-2'>
            <p className='text-xs text-blue-400/80 flex items-start gap-1'>
              <NeonIcon icon='lucide:info' size={14} className='mt-0.5 flex-shrink-0' />
              <span>
                <strong>Alternative Payment Methods:</strong> If you prefer a different payment method 
                not listed above, please mention it here and our team will reach out to you directly 
                to arrange the payment.
              </span>
            </p>
            <p className='text-xs text-yellow-400/70 flex items-start gap-1'>
              <NeonIcon icon='lucide:shield-alert' size={14} className='mt-0.5 flex-shrink-0' />
              <span>
                <strong>Security Notice:</strong> Do not include bank account numbers, routing numbers, 
                credit card details, SSN, or any other sensitive financial information. 
                Only mention the payment method type you prefer.
              </span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type='submit'
          size='lg'
          disabled={
            isSubmitting || 
            !amount || 
            parseFloat(amount) < balance.minimumWithdrawal ||
            !!sensitiveInfoError
          }
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

