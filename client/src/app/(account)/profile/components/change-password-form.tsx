'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NeonText from '@/components/neon/neon-text';
import { changePassword } from '@/lib/api/auth';
import { inputSettings } from '@/app/(auth)/auth.style.config';

export default function ChangePasswordForm() {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        if (form.oldPassword === form.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await changePassword({
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            }) as any;
            
            if (response.success) {
                setSuccess('Password changed successfully!');
                setForm({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                setError(response.message || 'Failed to change password');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
        setSuccess('');
    };

    return (
        <div className='sm:px-4 sm:mb-3 mb-1'>
            <form onSubmit={handleSubmit}>
                <div className='mb-7 space-y-6.5'>
                    {/* Current Password */}
                    <Input
                        type='password'
                        placeholder='Current Password'
                        value={form.oldPassword}
                        onChange={handleInputChange('oldPassword')}
                        {...inputSettings}
                    />

                    {/* New Password */}
                    <Input
                        type='password'
                        placeholder='New Password'
                        value={form.newPassword}
                        onChange={handleInputChange('newPassword')}
                        {...inputSettings}
                    />

                    {/* Confirm Password */}
                    <Input
                        type='password'
                        placeholder='Confirm New Password'
                        value={form.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        {...inputSettings}
                    />

                    {/* Password Requirements */}
                    <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                        <NeonText className="text-blue-400 text-sm font-bold mb-2">
                            Password Requirements:
                        </NeonText>
                        <ul className="text-blue-400 text-sm space-y-1">
                            <li>• At least 6 characters long</li>
                            <li>• Different from current password</li>
                            <li>• Use a combination of letters and numbers</li>
                        </ul>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <NeonText className="text-red-400 text-sm">
                                {error}
                            </NeonText>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <NeonText className="text-green-400 text-sm">
                                {success}
                            </NeonText>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className='flex justify-center'>
                    <Button 
                        type="submit"
                        disabled={loading || !form.oldPassword || !form.newPassword || !form.confirmPassword}
                        size='lg'
                        animate
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
