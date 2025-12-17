'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransitionRouter } from 'next-transition-router';
import { Eye, EyeOff } from 'lucide-react';

import { inputSettings } from '@/app/(auth)/auth.style.config';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/api/auth';

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useTransitionRouter();
    const resetToken = searchParams.get('resetToken');
    
    const [form, setForm] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!resetToken) {
            setError('Invalid reset token');
            return;
        }

        if (!form.password || !form.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await resetPassword(resetToken, {
                password: form.password,
                confirmPassword: form.confirmPassword,
            }) as any;
            
            if (response.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(response.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    if (!resetToken) {
        return (
            <div className="text-center space-y-6">
                <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <NeonText className="text-red-400 text-lg font-bold mb-2">
                        Invalid Reset Link
                    </NeonText>
                    <NeonText className="text-red-400 text-sm">
                        This password reset link is invalid or has expired.
                    </NeonText>
                </div>
                
                <Button
                    onClick={() => router.push('/forgot-password')}
                    size="lg"
                    className="w-full"
                >
                    Request New Reset Link
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="p-6 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <NeonText className="text-green-400 text-lg font-bold mb-2">
                        Password Reset Successfully!
                    </NeonText>
                    <NeonText className="text-green-400 text-sm">
                        Your password has been updated successfully.
                    </NeonText>
                    <NeonText className="text-green-400 text-sm mt-2">
                        Redirecting to login page...
                    </NeonText>
                </div>

                <Button
                    onClick={() => router.push('/login')}
                    size="lg"
                    className="w-full"
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className='mb-7.5 w-full'>
            <div className='mb-7 space-y-6.5'>
                {/* New Password */}
                <div className="relative">
                    <Input
                        type={'password'}
                        placeholder='New Password'
                        value={form.password}
                        onChange={handleInputChange('password')}
                        {...inputSettings}
                    />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <Input
                        type={'password'}
                        placeholder='Confirm New Password'
                        value={form.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        {...inputSettings}
                    />
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                    <NeonText className="text-blue-400 text-sm font-bold mb-2">
                        Password Requirements:
                    </NeonText>
                    <ul className="text-blue-400 text-sm space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Use a combination of letters and numbers</li>
                        <li>• Avoid common passwords</li>
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
            </div>

            {/* Submit Button */}
            <div className='flex justify-center'>
                <Button 
                    type="submit"
                    disabled={loading || !form.password || !form.confirmPassword}
                    size='md'
                    className="w-full"
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
            </div>
        </form>
    );
};

export default ResetPasswordForm;
