'use client';
import { inputSettings } from '@/app/(auth)/auth.style.config';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth, useIsLoggedIn } from '@/contexts/auth-context';
import { login } from '@/lib/api/auth';
import { Link, useTransitionRouter } from 'next-transition-router';
import { useState } from 'react';

const ManualLoginOption = () => {
    const router = useTransitionRouter();
    const { isLoggedIn, setLoggedIn } = useIsLoggedIn();
    const { setUser } = useAuth();
    const [userData, setUserData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<{
        phone?: string;
    } | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setVerificationData(null);
        setLoading(true);
        try {
            const response = (await login({
                email: userData.email.toLowerCase(),
                password: userData.password,
            })) as any;
            setLoggedIn(true);
            setUser(response.data.user);
            router.push('/lobby');
        } catch (err: unknown) {
            if (err instanceof Error) {
                // Check if this is the verification error (status 204/401)
                const errorMessage = err.message;
                if (
                    errorMessage.includes(
                        'User verification email has been sent'
                    ) ||
                    errorMessage.includes('verification email')
                ) {
                    // Extract user data from error if available
                    try {
                        const errorData = (err as any).response?.data;
                        if (errorData?.data?.user?.phone) {
                            setVerificationData({
                                phone: errorData.data.user.phone,
                            });
                        }
                    } catch (e) {
                        // If we can't extract data, just show the error
                    }
                }
                setError(errorMessage);
            } else {
                setError('Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    return (
        <form action='#' className='mb-7.5 w-full' onSubmit={handleLogin}>
            <div className='mb-7 space-y-6.5'>
                {/* Email Address */}
                <Input
                    type='email'
                    placeholder='Email Address'
                    {...inputSettings}
                    value={userData.email}
                    onChange={handleChange}
                    name='email'
                />
                {/* Password */}
                <Input
                    type='password'
                    name='password'
                    placeholder='Password'
                    {...inputSettings}
                    value={userData.password}
                    onChange={handleChange}
                />

                {/* Error/Verification Message */}
                {error && (
                    <div className='space-y-3'>
                        <p className='text-red-500 text-base font-semibold'>
                            {error}
                        </p>

                        {/* Show verification options if user needs to verify */}
                        {error.includes('verification') &&
                            verificationData?.phone && (
                                <div className='bg-purple-500/20 border border-purple-500/50 rounded-lg p-4'>
                                    <NeonText
                                        className='text-sm text-center leading-relaxed'
                                        glowSpread={0.5}
                                    >
                                        <span className='text-white/90'>
                                            Prefer to verify via text
                                            instead?{' '}
                                        </span>
                                        <Link
                                            href={`/phone-verification?phone=${encodeURIComponent(verificationData.phone)}`}
                                            className='text-purple-400 hover:text-purple-300 underline font-semibold'
                                        >
                                            Click here to verify via phone
                                        </Link>
                                    </NeonText>
                                </div>
                            )}
                    </div>
                )}

                <div className='flex flex-wrap items-center justify-between gap-3'>
                    {/* Remember Me */}
                    <div className='site-checkbox flex items-center gap-3'>
                        <Checkbox id='remember-me' />
                        <NeonText
                            glowSpread={0.5}
                            as='label'
                            htmlFor='remember-me'
                            className='text-sm! lg:text-base!'
                        >
                            Remember Me
                        </NeonText>
                    </div>
                    {/* Forgot Password */}
                    <Link
                        href='/forgot-password'
                        title='Forgot Password'
                        className='tracking-common text-sm lg:text-base font-extrabold underline'
                    >
                        Forgot Password
                    </Link>
                </div>
            </div>
            {/* Login Button */}
            <div className='flex justify-center'>
                <Button size='md' type='submit' animate disabled={loading}>
                    {loading ? 'Logging in...' : 'Login Account'}
                </Button>
            </div>
        </form>
    );
};

export default ManualLoginOption;
