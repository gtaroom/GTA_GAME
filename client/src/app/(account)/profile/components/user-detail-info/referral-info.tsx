'use client';

import { useEffect, useState } from 'react';
import { useReferral } from '@/hooks/useReferral';
import InfoLabel from '../info-label';
import { Button } from '@/components/ui/button';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { downloadQRCode } from '@/lib/utils/qrcode';
import { toastSuccess, toastError } from '@/lib/toast';
import Image from 'next/image';

export default function ReferralInfo() {
    const {
        referralLink,
        referralCode,
        stats,
        isLoading,
        qrCodeDataURL,
        fetchReferralLink,
        generateQR,
        downloadQR,
    } = useReferral();
    const [qrGenerated, setQrGenerated] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralLink();
    }, [fetchReferralLink]);

    const handleCopyLink = async () => {
        if (!referralLink) {
            await fetchReferralLink();
            return;
        }
        const success = await copyToClipboard(referralLink);
        if (success) {
            setCopied(true);
            toastSuccess('Referral link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toastError('Failed to copy link');
        }
    };

    const handleGenerateQR = async () => {
        try {
            await generateQR();
            setQrGenerated(true);
        } catch (error) {
            toastError('Failed to generate QR code');
        }
    };

    const handleDownloadQR = async () => {
        try {
            await downloadQR();
        } catch (error) {
            toastError('Failed to download QR code');
        }
    };

    const referralInfo = [
        {
            icon: 'lucide:link',
            text: 'Referral Link',
            content: (
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='truncate text-base font-semibold max-w-[200px]'>
                        {referralLink || 'Loading...'}
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
            icon: 'lucide:user-check',
            text: 'Total Invited',
            content: (
                <span className='text-base font-semibold'>
                    {stats.totalInvited || 0}
                </span>
            ),
        },
        {
            icon: 'lucide:user-check-check',
            text: 'Qualified Referrals',
            content: (
                <span className='text-base font-semibold text-green-400'>
                    {stats.qualified || 0}
                </span>
            ),
        },
        {
            icon: 'lucide:coins',
            text: 'Total Rewards Earned',
            content: (
                <div className='inline-flex items-center gap-2'>
                    <Image
                        src='/coins/bronze-coin.svg'
                        height={20}
                        width={20}
                        alt='Gold Coin'
                        className='w-[20px] aspect-square'
                    />
                    <span className='text-base font-extrabold text-yellow-400'>
                        {stats.totalRewards || 0}
                    </span>
                </div>
            ),
        },
    ];

    return (
        <>
            {referralInfo.map(({ icon, text, content }, index) => (
                <li key={index}>
                    <InfoLabel icon={icon} text={text} />
                    {content}
                </li>
            ))}
            {/* QR Code Section */}
            <li className='col-span-full mt-4'>
                <div className='flex flex-col gap-4'>
                    <InfoLabel icon='lucide:qr-code' text='QR Code' />
                    {!qrGenerated && !qrCodeDataURL ? (
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
                            {qrCodeDataURL && (
                                <div className='flex items-center gap-4'>
                                    <img
                                        src={qrCodeDataURL}
                                        alt='Referral QR Code'
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
                            )}
                        </div>
                    )}
                </div>
            </li>
        </>
    );
}

