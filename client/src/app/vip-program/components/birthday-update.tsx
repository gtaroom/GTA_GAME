'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import { updateBirthday } from '@/lib/api/vip';
import { useVip } from '@/contexts/vip-context';
import { useAuth } from '@/contexts/auth-context';

interface BirthdayUpdateProps {
    className?: string;
}

export default function BirthdayUpdate({ className = '' }: BirthdayUpdateProps) {
    const [birthday, setBirthday] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState('');
    
    const { refetchVipStatus } = useVip();
    const { user, setUser } = useAuth();

    const handleUpdateBirthday = async () => {
        // Validate format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(birthday)) {
            setMessage('Please use YYYY-MM-DD format (e.g., 1990-05-15)');
            return;
        }
        
        try {
            setIsUpdating(true);
            setMessage('');
            const response = await updateBirthday(birthday);
            
            if (response.success) {
                setMessage('Birthday updated! You can now claim birthday bonuses.');
                setBirthday('');
                // Update local user immediately so UI hides this component
                setUser(user ? { ...user, birthday: response.data.birthday } : user);
                await refetchVipStatus();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update birthday';
            setMessage(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <NeonBox
            className={`p-4 rounded-xl ${className}`}
            glowColor='--color-blue-500'
            backgroundColor='--color-blue-500'
            backgroundOpacity={0.1}
        >
            <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                    <NeonIcon
                        icon='lucide:calendar'
                        glowColor='--color-blue-500'
                    />
                    <NeonText
                        as='h3'
                        className='text-lg font-bold'
                        glowColor='--color-blue-500'
                    >
                        Set Your Birthday
                    </NeonText>
                </div>
                
                <p className='text-sm text-gray-300'>
                    Set your birthday to claim VIP birthday bonuses (3-day window: day before, birthday, day after)
                </p>
                
                <div className='flex gap-2'>
                    <input
                        type='text'
                        placeholder='YYYY-MM-DD (e.g., 1990-05-15)'
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className='flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                    />
                    <Button
                        onClick={handleUpdateBirthday}
                        disabled={isUpdating || !birthday}
                        size='sm'
                    >
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                </div>
                
                {message && (
                    <p className={`text-sm ${message.includes('updated') ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}
            </div>
        </NeonBox>
    );
}
