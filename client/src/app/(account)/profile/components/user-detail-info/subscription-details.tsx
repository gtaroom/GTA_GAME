'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile } from '@/lib/api/auth';
import NeonText from '@/components/neon/neon-text';
import NeonBox from '@/components/neon/neon-box';
import StatusSwitch from '../status-switch';
import { Icon } from '@iconify/react';

export default function SubscriptionDetails() {
    const { user, setUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle email marketing toggle
    const handleEmailToggle = async (checked: boolean) => {
        setIsUpdating('email');
        setError(null);

        try {
            const response = await updateProfile({
                isOpted: checked,
            }) as any;

            if (response.success && response.data) {
                // Update user context with new data
                setUser({ ...user!, isOpted: checked });
            } else {
                setError(response.message || 'Failed to update email marketing preferences');
            }
        } catch (err) {
            console.error('Email marketing update error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update email marketing preferences');
        } finally {
            setIsUpdating(null);
        }
    };

    // Handle SMS marketing toggle
    const handleSMSToggle = async (checked: boolean) => {
        setIsUpdating('sms');
        setError(null);

        try {
            const response = await updateProfile({
                isSmsOpted: checked,
            }) as any;

            if (response.success && response.data) {
                // Update user context with new data
                setUser({ ...user!, isSmsOpted: checked });
            } else {
                setError(response.message || 'Failed to update SMS marketing preferences');
            }
        } catch (err) {
            console.error('SMS marketing update error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update SMS marketing preferences');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <li className='col-span-full'>
            {/* Error message */}
            {error && (
                <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg'>
                    <NeonText className='text-red-400 text-sm'>
                        {error}
                    </NeonText>
                </div>
            )}

                {/* Title Section - Full Width */}
                <div className='flex items-center gap-3 mb-1 pb-3 border-b border-white/10'>
                    <div className='flex-1'>
                        <NeonText 
                            as='h4' 
                            className='text-md lg:text-lg font-bold uppercase mb-1'
                            glowSpread={0.5}
                            glowColor='--color-lime-500'
                        >
                            Opt-In / Opt-Out
                        </NeonText>
                        <p className='text-sm text-white/60'>
                            Manage your email and SMS marketing subscriptions
                        </p>
                    </div>
                </div>

                {/* Controls Section - 2 Columns */}
                <div className='grid grid-cols-2 md:grid-cols-2 gap-6'>
                    {/* Email Marketing */}
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-2 mb-2'>
                            <Icon icon='lucide:mail' className='w-5 h-5 text-lime-400' />
                            <NeonText className='text-base font-semibold' glowSpread={0.3}>
                                Email Marketing
                            </NeonText>
                        </div>
                        
                        <div className='flex items-center justify-between gap-3 mb-2'>
                            <StatusSwitch
                                checked={user?.isOpted || false}
                                onChange={handleEmailToggle}
                                disabled={isUpdating === 'email'}
                            />
                        </div>

                        <div className='flex flex-col gap-1 pt-2 border-t border-white/10'>
                            <span className='truncate text-sm font-semibold text-white/90'>
                                {user?.email || 'Not provided'}
                            </span>
                            <span className={`text-sm font-medium ${user?.isOpted ? 'text-green-400' : 'text-gray-400'}`}>
                                {user?.isOpted ? 'Opted In' : 'Opted Out'}
                            </span>
                        </div>
                    </div>

                    {/* SMS Marketing */}
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-2 mb-2'>
                            <Icon icon='lucide:message-square-text' className='w-5 h-5 text-lime-400' />
                            <NeonText className='text-base font-semibold' glowSpread={0.3}>
                                SMS Marketing
                            </NeonText>
                        </div>
                        
                        <div className='flex items-center justify-between gap-3 mb-2'>
                            <StatusSwitch
                                checked={user?.isSmsOpted || false}
                                onChange={handleSMSToggle}
                                disabled={isUpdating === 'sms'}
                            />
                        </div>

                        <div className='flex flex-col gap-1 pt-2 border-t border-white/10'>
                            <span className='text-sm font-semibold text-white/90'>
                                {user?.phone || 'Not provided'}
                            </span>
                            <span className={`text-sm font-medium ${user?.isSmsOpted ? 'text-green-400' : 'text-gray-400'}`}>
                                {user?.isSmsOpted ? 'Opted In' : 'Opted Out'}
                            </span>
                        </div>
                    </div>
                </div>
      
        </li>
    );
}
