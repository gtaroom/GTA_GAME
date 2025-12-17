'use client';

import { Icon } from '@iconify/react';

import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';

type MessageType = 'success' | 'danger' | 'warning' | 'info';

interface StatusMessageProps {
    type: MessageType;
    title: string;
    description?: string;
    buttonText?: string;
    onClose?: () => void;
}

const typeConfig: Record<MessageType, { icon: string; color: string }> = {
    success: {
        icon: 'mdi:check-decagram',
        color: '--color-green-500',
    },
    danger: {
        icon: 'mdi:alert-octagon',
        color: '--color-red-500',
    },
    warning: {
        icon: 'mdi:alert',
        color: '--color-yellow-500',
    },
    info: {
        icon: 'mdi:information',
        color: '--color-sky-500',
    },
};

export default function StatusMessage({
    type,
    title,
    description,
    buttonText = 'Ok',
    onClose,
}: StatusMessageProps) {
    const config = typeConfig[type];

    return (
        <div className='mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 rounded-xl p-6 text-center text-white'>
            <div className='flex items-center gap-3'>
                <Icon
                    color={`var(${config.color})`}
                    icon={config.icon}
                    className={'text-[64px]'}
                />
                <NeonText as='h2' className='h1-title' glowColor={config.color}>
                    {title}
                </NeonText>
            </div>

            {description && (
                <p className='text-lg leading-relaxed font-semibold text-gray-200'>
                    {description}
                </p>
            )}

            <Button onClick={onClose} variant='secondary' size='lg'>
                {buttonText}
            </Button>
        </div>
    );
}
