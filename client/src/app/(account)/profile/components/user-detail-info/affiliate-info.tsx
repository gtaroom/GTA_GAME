'use client';

import { useEffect, useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import InfoLabel from '../info-label';
import { Button } from '@/components/ui/button';
import NeonIcon from '@/components/neon/neon-icon';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { downloadQRCode } from '@/lib/utils/qrcode';
import { generateQRCodeDataURL } from '@/lib/utils/qrcode';
import { toastSuccess, toastError } from '@/lib/toast';
import { useTransitionRouter } from 'next-transition-router';
import NeonText from '@/components/neon/neon-text';

export default function AffiliateInfo() {
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
        let linkToCopy: string | null = affiliateLink;
        if (!linkToCopy) {
            linkToCopy = await fetchAffiliateLink();
        }
        if (!linkToCopy) {
            toastError('No affiliate link available');
            return;
        }
        const success = await copyToClipboard(linkToCopy);
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
                toastError('No affiliate link available. Please try again.');
                return;
            }
            const dataURL = await generateQRCodeDataURL(linkToUse, {
                width: 300,
                margin: 2,
            });
            setQrCodeDataURL(dataURL);
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

    // Show application status
    if (!status || status.status === 'not_applied') {
        return (
            <li className='col-span-full'>
                <div className='flex flex-col gap-4'>
                    <InfoLabel
                        icon='lucide:user-plus'
                        text='Affiliate Status'
                    />
                    <NeonText
                        as='p'
                        className='text-base font-semibold mb-4'
                        glowColor='--color-purple-500'
                        glowSpread={0.5}
                    >
                        You haven't applied for the affiliate program yet.
                    </NeonText>
                    <Button
                        size='sm'
                        variant='neon'
                        onClick={() => router.push('/affiliate')}
                        className='w-fit'
                    >
                        Apply Now
                    </Button>
                </div>
            </li>
        );
    }

    if (status.status === 'pending') {
        return (
            <li className='col-span-full'>
                <div className='flex flex-col gap-2'>
                    <InfoLabel
                        icon='lucide:clock'
                        text='Affiliate Status'
                    />
                    <NeonText
                        as='p'
                        className='text-base font-semibold text-yellow-400'
                        glowColor='--color-yellow-500'
                        glowSpread={0.5}
                    >
                        Pending Approval
                    </NeonText>
                    {status.applicationDate && (
                        <p className='text-sm text-white/70'>
                            Applied on:{' '}
                            {new Date(
                                status.applicationDate
                            ).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </li>
        );
    }

    if (status.status === 'rejected') {
        return (
            <li className='col-span-full'>
                <div className='flex flex-col gap-2'>
                    <InfoLabel
                        icon='lucide:x-circle'
                        text='Affiliate Status'
                    />
                    <NeonText
                        as='p'
                        className='text-base font-semibold text-red-400'
                        glowColor='--color-red-500'
                        glowSpread={0.5}
                    >
                        Application Rejected
                    </NeonText>
                    {status.rejectionReason && (
                        <p className='text-sm text-white/70'>
                            Reason: {status.rejectionReason}
                        </p>
                    )}
                </div>
            </li>
        );
    }

    // Approved status - show dashboard data
    const affiliateInfo = [
        {
            icon: 'lucide:code',
            text: 'Affiliate Code',
            content: (
                <span className='text-base font-semibold font-mono'>
                    {affiliateCode || 'Loading...'}
                </span>
            ),
        },
        {
            icon: 'lucide:link',
            text: 'Affiliate Link',
            content: (
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='truncate text-base font-semibold max-w-[200px]'>
                        {affiliateLink || 'Loading...'}
                    </span>
                    <Button
                        size='sm'
                        variant='neon'
                        onClick={handleCopyLink}
                        disabled={isLoading}
                        className={`h-8 px-3 transition-all ${copied ? 'bg-green-500/20' : ''}`}
                    >
                        <NeonIcon
                            icon={copied ? 'lucide:check' : 'lucide:copy'}
                            size={16}
                            className='mr-1'
                        />
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
            ),
        },
        {
            icon: 'lucide:users',
            text: 'Total Referrals',
            content: (
                <span className='text-base font-semibold'>
                    {dashboard?.totalReferrals || 0}
                </span>
            ),
        },
        {
            icon: 'lucide:user-check-check',
            text: 'Qualified Referrals',
            content: (
                <span className='text-base font-semibold text-green-400'>
                    {dashboard?.totalConversions || 0}
                </span>
            ),
        },
        {
            icon: 'lucide:dollar-sign',
            text: 'Total Earnings',
            content: (
                <span className='text-base font-extrabold text-green-400'>
                    ${dashboard?.totalEarnings?.toFixed(2) || '0.00'}
                </span>
            ),
        },
        {
            icon: 'lucide:percent',
            text: 'Commission Rate',
            content: (
                <span className='text-base font-semibold'>
                    {dashboard?.commissionRate || 0}%
                </span>
            ),
        },
    ];

    return (
        <>
            <li className='col-span-full mb-2'>
                <div className='flex items-center gap-2'>
                    <InfoLabel icon='lucide:check-circle' text='Status' />
                    <NeonText
                        as='span'
                        className='text-base font-semibold text-green-400'
                        glowColor='--color-green-500'
                        glowSpread={0.5}
                    >
                        Approved
                    </NeonText>
                    <Button
                        size='sm'
                        variant='neon'
                        onClick={() => router.push('/affiliate/dashboard')}
                        className='ml-auto h-8 px-3'
                    >
                        View Dashboard
                    </Button>
                </div>
            </li>
            {affiliateInfo.map(({ icon, text, content }, index) => (
                <li key={index}>
                    <InfoLabel icon={icon} text={text} />
                    {content}
                </li>
            ))}
            {/* QR Code Section */}
            <li className='col-span-full mt-4'>
                <div className='flex flex-col gap-4'>
                    <InfoLabel icon='lucide:qr-code' text='QR Code' />
                    {!qrCodeDataURL ? (
                        <Button
                            size='sm'
                            variant='neon'
                            onClick={handleGenerateQR}
                            disabled={isLoading}
                            className='w-fit'
                        >
                            <NeonIcon
                                icon='lucide:qr-code'
                                size={16}
                                className='mr-2'
                            />
                            Generate QR Code
                        </Button>
                    ) : (
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-4'>
                                <img
                                    src={qrCodeDataURL}
                                    alt='Affiliate QR Code'
                                    className='w-32 h-32 border-2 border-purple-500 rounded-lg p-2 bg-white'
                                />
                                <Button
                                    size='sm'
                                    variant='neon'
                                    onClick={handleDownloadQR}
                                    className='w-fit'
                                >
                                    <NeonIcon
                                        icon='lucide:download'
                                        size={16}
                                        className='mr-2'
                                    />
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </li>
        </>
    );
}

