'use client';

import { useEffect } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { useTransitionRouter } from 'next-transition-router';
import AuthGuard from '@/components/auth-guard';
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
import { useState } from 'react';
import Image from 'next/image';

export default function AffiliateDashboard() {
    const {
        status,
        dashboard,
        affiliateLink,
        affiliateCode,
        isLoading,
        checkStatus,
        fetchDashboard,
        fetchAffiliateLink,
    } = useAffiliate();
    const router = useTransitionRouter();
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    useEffect(() => {
        if (status?.status === 'approved') {
            fetchDashboard();
            fetchAffiliateLink();
        }
    }, [status, fetchDashboard, fetchAffiliateLink]);

    const handleCopyLink = async () => {
        if (!affiliateLink) {
            await fetchAffiliateLink();
            return;
        }
        const success = await copyToClipboard(affiliateLink);
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
            let linkToUse: string | null = affiliateLink;
            if (!linkToUse) {
                linkToUse = await fetchAffiliateLink();
            }
            if (!linkToUse) {
                toastError('No affiliate link available');
                return;
            }
            const dataURL = await generateQRCodeDataURL(linkToUse, {
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
                `affiliate-qrcode-${affiliateCode || 'link'}.png`
            );
            toastSuccess('QR code downloaded!');
        } catch (error) {
            toastError('Failed to download QR code');
        }
    };

    return (
        <AuthGuard>
            <div className='container-xxl'>
                <AccountPageTitle className='mb-8'>
                    Affiliate Dashboard
                </AccountPageTitle>

                {isLoading && !status ? (
                    <div className='flex items-center justify-center py-20'>
                        <NeonIcon
                            icon='svg-spinners:bars-rotate-fade'
                            size={48}
                        />
                    </div>
                ) : status?.status === 'not_applied' ? (
                    <NeonBox
                        className='p-8 rounded-2xl backdrop-blur-2xl text-center'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <NeonText
                            as='h3'
                            className='h3-title mb-4'
                            glowColor='--color-purple-500'
                            glowSpread={0.5}
                        >
                            You haven't applied for the affiliate program yet.
                        </NeonText>
                        <Button
                            size='lg'
                            onClick={() => router.push('/affiliate')}
                        >
                            Apply Now
                        </Button>
                    </NeonBox>
                ) : status?.status === 'pending' ? (
                    <NeonBox
                        className='p-8 rounded-2xl backdrop-blur-2xl text-center'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.1}
                    >
                        <NeonText
                            as='h3'
                            className='h3-title mb-4 text-yellow-400'
                            glowColor='--color-yellow-500'
                            glowSpread={0.5}
                        >
                            Application Pending Approval
                        </NeonText>
                        {status.applicationDate && (
                            <p className='text-white/70 mb-4'>
                                Applied on:{' '}
                                {new Date(
                                    status.applicationDate
                                ).toLocaleDateString()}
                            </p>
                        )}
                        <p className='text-white/70'>
                            We'll notify you once your application is reviewed.
                        </p>
                    </NeonBox>
                ) : status?.status === 'rejected' ? (
                    <NeonBox
                        className='p-8 rounded-2xl backdrop-blur-2xl text-center'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                    >
                        <NeonText
                            as='h3'
                            className='h3-title mb-4 text-red-400'
                            glowColor='--color-red-500'
                            glowSpread={0.5}
                        >
                            Application Rejected
                        </NeonText>
                        {status.rejectionReason && (
                            <p className='text-white/70 mb-4'>
                                Reason: {status.rejectionReason}
                            </p>
                        )}
                        <Button
                            size='lg'
                            onClick={() => router.push('/affiliate')}
                        >
                            Apply Again
                        </Button>
                    </NeonBox>
                ) : (
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
                                            {affiliateCode || 'Loading...'}
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
                                                {affiliateLink || 'Loading...'}
                                            </p>
                                        </div>
                                        <Button
                                            size='sm'
                                            variant='neon'
                                            onClick={handleCopyLink}
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                        {dashboard?.totalReferrals || 0}
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
                                        {dashboard?.totalConversions || 0}
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
                                        {dashboard?.commissionRate || 0}%
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
                                        ${dashboard?.totalEarnings?.toFixed(2) || '0.00'}
                                    </NeonText>
                                    <p className='text-sm text-white/70'>
                                        Total Earnings
                                    </p>
                                </div>
                            </div>
                        </NeonBox>

                        {/* Earnings Breakdown */}
                        {dashboard && (
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
                                    Earnings Breakdown
                                </NeonText>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                    <div>
                                        <p className='text-sm text-white/70 mb-2'>
                                            Total Earnings
                                        </p>
                                        <p className='text-2xl font-bold text-green-400'>
                                            ${dashboard.totalEarnings?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-white/70 mb-2'>
                                            Pending Earnings
                                        </p>
                                        <p className='text-2xl font-bold text-yellow-400'>
                                            ${dashboard.pendingEarnings?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-white/70 mb-2'>
                                            Paid Earnings
                                        </p>
                                        <p className='text-2xl font-bold text-blue-400'>
                                            ${dashboard.paidEarnings?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                </div>
                                <div className='mt-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700'>
                                    <p className='text-sm text-white/70 mb-2'>
                                        <strong>Note:</strong> Payouts are processed monthly
                                        once you reach the $100 minimum threshold. Earnings
                                        are tracked separately from user coins and paid in
                                        dollars.
                                    </p>
                                    <p className='text-sm text-white/70'>
                                        <strong>Commission System:</strong> You earn a one-time commission when each referral first reaches $20 in total spending. Commission is calculated on their full total spent at qualification, not just the $20 minimum. Future purchases by the same user do not generate additional commissions.
                                    </p>
                                </div>
                            </NeonBox>
                        )}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}

