'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useTransitionRouter } from 'next-transition-router';

import { inputSettings } from '@/app/(auth)/auth.style.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NeonText from '@/components/neon/neon-text';
import { forgotPassword } from '@/lib/api/auth';

const ForgotPasswordForm = () => {
    const router = useTransitionRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await forgotPassword({ email }) as any;
            
            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value.toLowerCase());
        setError('');
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="p-6 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <NeonText className="text-green-400 text-lg font-bold mb-2">
                        Email Sent Successfully!
                    </NeonText>
                    <br />
                    <NeonText className="text-green-400 text-sm">
                        We've sent a password reset link to <strong>{email}</strong>
                    </NeonText>
                    <br />
                    <NeonText className="text-green-400 text-sm mt-2">
                        Please check your email and follow the instructions to reset your password.
                    </NeonText>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={() => router.push('/login')}
                        size="lg"
                        className="w-full"
                    >
                        Back to Login
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm lg:text-base font-extrabold hover:underline underline-offset-4"
                        >
                            <ArrowLeft />
                            Back To Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='mb-7.5 w-full'>
                <div className='mb-7 space-y-6.5'>
                    {/* Email Address */}
                    <Input
                        type='email'
                        placeholder='Email Address'
                        value={email}
                        onChange={handleEmailChange}
                        {...inputSettings}
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <NeonText className="text-red-400 text-sm">
                                {error}
                            </NeonText>
                        </div>
                    )}

                    {/* Back To Login */}
                    <div className='text-center leading-0'>
                        <Link
                            href='/login'
                            className='inline-flex items-center gap-2 text-sm lg:text-base font-extrabold hover:underline underline-offset-4'
                        >
                            <ArrowLeft />
                            Back To Login
                        </Link>
                    </div>
                </div>

                {/* Submit Button */}
                <div className='flex justify-center'>
                    <Button 
                        type="submit"
                        disabled={loading || !email}
                        size='md'
                        className="w-full"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </div>
            </form>
        </>
    );
};

export default ForgotPasswordForm;
