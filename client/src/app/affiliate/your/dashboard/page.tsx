'use client';

// Prevent static generation - this page must be dynamic due to token query param
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getPublicAffiliateDashboard } from '@/lib/api/affiliate';
import type { PublicAffiliateDashboardResponse } from '@/lib/api/affiliate';
import AccountPageTitle from '@/app/(account)/profile/components/account-page-title';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { downloadQRCode, generateQRCodeDataURL } from '@/lib/utils/qrcode';
import { toastSuccess, toastError } from '@/lib/toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { useTransitionRouter } from 'next-transition-router';

export default function PublicAffiliateDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const transitionRouter = useTransitionRouter();
    const token = searchParams.get('token');

    const [dashboardData, setDashboardData] = useState<PublicAffiliateDashboardResponse['data'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchDashboard = useCallback(async () => {
        if (!token) {
            setError('No token provided. Please use the link from your approval email.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getPublicAffiliateDashboard(token);
            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setError(response.message || 'Failed to load dashboard');
            }
        } catch (error: any) {
            console.error('Failed to fetch public affiliate dashboard:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load dashboard';
            setError(errorMessage);
            
            // Handle specific error cases
            if (errorMessage.includes('expired')) {
                setError('Dashboard token has expired. Please contact support for a new link.');
            } else if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
                setError('Invalid dashboard token. Please use the link from your approval email.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleCopyLink = async () => {
        if (!dashboardData?.affiliateLink) {
            toastError('No affiliate link available');
            return;
        }
        const success = await copyToClipboard(dashboardData.affiliateLink);
        if (success) {
            setCopied(true);
            toastSuccess('Affiliate link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toastError('Failed to copy link');
        }
    };

    const handleGenerateQR = async () => {
        try {
            if (!dashboardData?.affiliateLink) {
                toastError('No affiliate link available');
                return;
            }
            const dataURL = await generateQRCodeDataURL(dashboardData.affiliateLink, {
                width: 300,
                margin: 2,
            });
            setQrCodeDataURL(dataURL);
            setQrDialogOpen(true);
        } catch (error) {
            toastError('Failed to generate QR code');
        }
    };

    const handleDownloadQR = async () => {
        if (!qrCodeDataURL) {
            await handleGenerateQR();
            return;
        }
        try {
            downloadQRCode(
                qrCodeDataURL,
                `affiliate-qrcode-${dashboardData?.affiliate?.affiliateCode || 'link'}.png`
            );
            toastSuccess('QR code downloaded!');
        } catch (error) {
            toastError('Failed to download QR code');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className='container-xxl min-h-screen flex items-center justify-center py-20'>
                <div className='text-center'>
                    <NeonIcon
                        icon='svg-spinners:bars-rotate-fade'
                        size={48}
                        className='mb-4'
                    />
                    <NeonText
                        as='p'
                        className='text-lg'
                        glowColor='--color-purple-500'
                        glowSpread={0.5}
                    >
                        Loading dashboard...
                    </NeonText>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !dashboardData) {
        return (
            <div className='container-xxl min-h-screen flex items-center justify-center py-20'>
                <NeonBox
                    className='max-w-[600px] w-full p-8 rounded-2xl backdrop-blur-2xl text-center'
                    backgroundColor='--color-red-500'
                    backgroundOpacity={0.1}
                >
                    <NeonIcon
                        icon='lucide:alert-circle'
                        size={48}
                        className='text-red-400 mb-4 mx-auto'
                    />
                    <NeonText
                        as='h3'
                        className='h3-title mb-4 text-red-400'
                        glowColor='--color-red-500'
                        glowSpread={0.5}
                    >
                        {error || 'Failed to load dashboard'}
                    </NeonText>
                    <p className='text-white/70 mb-6'>
                        {error?.includes('expired')
                            ? 'Your dashboard link has expired. Please contact our support team for a new link.'
                            : error?.includes('Invalid') || error?.includes('invalid')
                            ? 'The link you used is invalid. Please use the link from your approval email.'
                            : 'Please check your link and try again, or contact support for assistance.'}
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Button
                            size='lg'
                            onClick={() => transitionRouter.push('/affiliate')}
                        >
                            Learn About Affiliate Program
                        </Button>
                        <Button
                            size='lg'
                            variant='secondary'
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                </NeonBox>
            </div>
        );
    }

    // Success state - show dashboard
    const affiliate = dashboardData.affiliate;
    const fullName = `${affiliate.name.first} ${affiliate.name.last}`.trim();

    return (
        <div className='container-xxl min-h-screen py-8'>
            <AccountPageTitle className='mb-8 text-center'>
                Affiliate Dashboard
            </AccountPageTitle>

            {/* Welcome Message */}
            <NeonBox
                className='p-6 lg:p-8 rounded-2xl backdrop-blur-2xl mb-8'
                backgroundColor='--color-purple-500'
                backgroundOpacity={0.1}
            >
                <div className='flex flex-col md:flex-row items-center md:items-start justify-between gap-4'>
                    <div>
                        <NeonText
                            as='h3'
                            className='h3-title mb-2'
                            glowColor='--color-purple-500'
                            glowSpread={0.5}
                        >
                            Welcome, {fullName}!
                        </NeonText>
                        <p className='text-white/70 mb-1'>
                            Email: {affiliate.email}
                        </p>
                        {affiliate.company && (
                            <p className='text-white/70'>
                                Company: {affiliate.company}
                            </p>
                        )}
                        {/* {!dashboardData.hasAccount && (
                            <div className='mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg'>
                                <p className='text-sm text-yellow-400 mb-2'>
                                    💡 <strong>Tip:</strong> Create an account to access your dashboard anytime without a token!
                                </p>
                                <Button
                                    size='sm'
                                    variant='secondary'
                                    onClick={() => transitionRouter.push('/register')}
                                    className='mt-2'
                                >
                                    Create Account
                                </Button>
                            </div>
                        )} */}
                    </div>
                    {dashboardData.hasAccount && (
                        <Button
                            size='md'
                            variant='neon'
                            onClick={() => transitionRouter.push('/affiliate/dashboard')}
                        >
                            View Full Dashboard
                        </Button>
                    )}
                </div>
            </NeonBox>

            <div className='space-y-8'>
                {/* Affiliate Code and Link Section */}
                <NeonBox
                    className='p-6 lg:p-8 rounded-2xl backdrop-blur-2xl'
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.1}
                >
                    <NeonText
                        as='h3'
                        className='h3-title mb-6'
                        glowColor='--color-purple-500'
                        glowSpread={0.5}
                    >
                        Your Affiliate Information
                    </NeonText>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <NeonText
                                as='p'
                                className='text-sm text-white/70 mb-2'
                            >
                                Affiliate Code
                            </NeonText>
                            <div className='p-4 bg-neutral-800/50 rounded-lg border border-neutral-700'>
                                <p className='text-xl font-mono font-bold'>
                                    {affiliate.affiliateCode}
                                </p>
                            </div>
                        </div>
                        <div>
                            <NeonText
                                as='p'
                                className='text-sm text-white/70 mb-2'
                            >
                                Affiliate Link
                            </NeonText>
                            <div className='flex gap-2'>
                                <div className='flex-1 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700'>
                                    <p className='text-sm break-all font-mono'>
                                        {dashboardData.affiliateLink}
                                    </p>
                                </div>
                                <Button
                                    size='sm'
                                    variant='neon'
                                    onClick={handleCopyLink}
                                    className={`transition-all ${copied ? 'bg-green-500/20' : ''}`}
                                >
                                    <NeonIcon
                                        icon={copied ? 'lucide:check' : 'lucide:copy'}
                                        size={18}
                                        className='mr-2'
                                    />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className='mt-6 flex gap-4'>
                        <Dialog
                            open={qrDialogOpen}
                            onOpenChange={setQrDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size='lg'
                                    onClick={handleGenerateQR}
                                >
                                    <NeonIcon
                                        icon='lucide:qr-code'
                                        size={20}
                                        className='mr-2'
                                    />
                                    Generate QR Code
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-md'>
                                <DialogHeader>
                                    <DialogTitle>
                                        Affiliate QR Code
                                    </DialogTitle>
                                </DialogHeader>
                                <div className='flex flex-col items-center gap-4 py-4'>
                                    {qrCodeDataURL ? (
                                        <>
                                            <div className='p-4 bg-white rounded-lg'>
                                                <Image
                                                    src={qrCodeDataURL}
                                                    alt='Affiliate QR Code'
                                                    width={300}
                                                    height={300}
                                                    className='w-full h-auto'
                                                />
                                            </div>
                                            <Button
                                                onClick={handleDownloadQR}
                                                variant='neon'
                                            >
                                                <NeonIcon
                                                    icon='lucide:download'
                                                    size={18}
                                                    className='mr-2'
                                                />
                                                Download QR Code
                                            </Button>
                                        </>
                                    ) : (
                                        <div className='flex items-center justify-center py-8'>
                                            <NeonIcon
                                                icon='svg-spinners:bars-rotate-fade'
                                                size={32}
                                            />
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </NeonBox>

                {/* Statistics Section */}
                <NeonBox
                    className='p-6 lg:p-8 rounded-2xl backdrop-blur-2xl'
                    backgroundColor='--color-green-500'
                    backgroundOpacity={0.1}
                >
                    <NeonText
                        as='h3'
                        className='h3-title mb-6'
                        glowColor='--color-green-500'
                        glowSpread={0.5}
                    >
                        Performance Statistics
                    </NeonText>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                        <div className='text-center'>
                            <NeonText
                                as='p'
                                className='text-3xl font-bold mb-2'
                                glowColor='--color-green-500'
                                glowSpread={0.5}
                            >
                                {dashboardData.totalReferrals || 0}
                            </NeonText>
                            <p className='text-sm text-white/70'>
                                Total Referrals
                            </p>
                        </div>
                        <div className='text-center'>
                            <NeonText
                                as='p'
                                className='text-3xl font-bold mb-2 text-green-400'
                                glowColor='--color-green-500'
                                glowSpread={0.5}
                            >
                                {dashboardData.qualifiedReferrals || 0}
                            </NeonText>
                            <p className='text-sm text-white/70'>
                                Qualified Referrals
                            </p>
                        </div>
                        <div className='text-center'>
                            <NeonText
                                as='p'
                                className='text-3xl font-bold mb-2 text-yellow-400'
                                glowColor='--color-yellow-500'
                                glowSpread={0.5}
                            >
                                {affiliate.commissionRate || 0}%
                            </NeonText>
                            <p className='text-sm text-white/70'>
                                Commission Rate
                            </p>
                        </div>
                        <div className='text-center'>
                            <NeonText
                                as='p'
                                className='text-3xl font-bold mb-2 text-green-400'
                                glowColor='--color-green-500'
                                glowSpread={0.5}
                            >
                                ${dashboardData.totalEarnings?.toFixed(2) || '0.00'}
                            </NeonText>
                            <p className='text-sm text-white/70'>
                                Total Earnings
                            </p>
                        </div>
                    </div>
                </NeonBox>

                {/* Recent Referrals */}
                {dashboardData.recentReferrals && dashboardData.recentReferrals.length > 0 && (
                    <NeonBox
                        className='p-6 lg:p-8 rounded-2xl backdrop-blur-2xl'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                    >
                        <NeonText
                            as='h3'
                            className='h3-title mb-6'
                            glowColor='--color-blue-500'
                            glowSpread={0.5}
                        >
                            Recent Referrals
                        </NeonText>
                        <div className='space-y-4'>
                            {dashboardData.recentReferrals.map((referral, index) => {
                                const referredName = `${referral.referredUser.name.first} ${referral.referredUser.name.last || ''}`.trim();
                                return (
                                    <div
                                        key={index}
                                        className='p-4 bg-neutral-800/50 rounded-lg border border-neutral-700'
                                    >
                                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                            <div className='flex-1'>
                                                <p className='font-bold text-lg mb-1'>
                                                    {referredName || referral.referredUser.email}
                                                </p>
                                                <p className='text-sm text-white/70 mb-2'>
                                                    {referral.referredUser.email}
                                                </p>
                                                <div className='flex flex-wrap gap-4 text-sm'>
                                                    <span className={`px-3 py-1 rounded-full font-semibold ${
                                                        referral.status === 'qualified'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {referral.status === 'qualified' ? '✓ Qualified' : 'Pending'}
                                                    </span>
                                                    {referral.qualifiedAt && (
                                                        <span className='text-white/70'>
                                                            Qualified: {new Date(referral.qualifiedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-white/70 mb-1'>
                                                    Total Spent
                                                </p>
                                                <p className='text-xl font-bold text-green-400 mb-3'>
                                                    ${referral.totalSpent.toFixed(2)}
                                                </p>
                                                {referral.referrerReward > 0 && (
                                                    <>
                                                        <p className='text-sm text-white/70 mb-1'>
                                                            Your Reward
                                                        </p>
                                                        <p className='text-xl font-bold text-yellow-400'>
                                                            ${referral.referrerReward.toFixed(2)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </NeonBox>
                )}

                {/* Info Note */}
                <NeonBox
                    className='p-6 rounded-2xl backdrop-blur-2xl'
                    backgroundColor='--color-blue-500'
                    backgroundOpacity={0.1}
                >
                    <div className='p-4 bg-neutral-800/50 rounded-lg border border-neutral-700'>
                        <p className='text-sm text-white/70 mb-2'>
                            <strong>Note:</strong> Payouts are processed monthly once you reach the $100 minimum threshold. Earnings are tracked separately from user coins and paid in dollars.
                        </p>
                        <p className='text-sm text-white/70 mb-2'>
                            <strong>Commission System:</strong> You earn a one-time commission when each referral first reaches $20 in total spending. Commission is calculated on their full total spent at qualification, not just the $20 minimum. Future purchases by the same user do not generate additional commissions.
                        </p>
                        <p className='text-sm text-white/70'>
                            <strong>Bookmark this page:</strong> You can bookmark this URL to access your dashboard anytime. The token in the URL allows secure access without requiring an account.
                        </p>
                    </div>
                </NeonBox>
            </div>
        </div>
    );
}

