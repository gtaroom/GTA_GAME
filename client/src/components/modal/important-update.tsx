'use client';

import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'next-transition-router';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'importantUpdateAccepted';

export interface ImportantUpdateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept: () => void;
    onDecline: () => void;
}

export default function ImportantUpdateModal({
    open,
    onOpenChange,
    onAccept,
    onDecline,
}: ImportantUpdateModalProps) {
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);

    // Schedule opening after 5s if not already accepted
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (localStorage.getItem(STORAGE_KEY) === 'true') return;

        const timer = setTimeout(() => onOpenChange(true), 5000);
        return () => clearTimeout(timer);
    }, [onOpenChange]);

    const handleAccept = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        onOpenChange(false);
        onAccept();
    }, [onOpenChange, onAccept]);

    const handleDecline = useCallback(() => {
        onOpenChange(false);
        onDecline();
    }, [onOpenChange, onDecline]);

    return (
        <Dialog
            open={open}
            onOpenChange={val => {
                // If closed via backdrop or ESC, treat as decline
                if (!val) handleDecline();
                onOpenChange(val);
            }}
        >
            <DialogContent
                className='max-sm:max-w-[calc(100%-24px)]! sm:max-w-[540px]!'
                neonBoxClass='max-sm:pt-7'
            >
                <div className='max-sm:pt-0 sm:px-6 py-5 text-center'>
                    <DialogTitle
                        className='mb-4  max-sm:max-w-[220px]! max-sm:mx-auto!'
                        asChild
                    >
                        <NeonText as='h4' className='h4-title mb-3'>
                            Important Update
                        </NeonText>
                    </DialogTitle>

                    <p className='font-bold text-base leading-7.5 capitalize mb-5'>
                        We’ve updated our{' '}
                        <Link href='#' className='underline underline-offset-4'>
                            Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href='#' className='underline underline-offset-4'>
                            Privacy Policy
                        </Link>
                        . Please review and accept the new policies to continue
                        using the site.
                    </p>

                    <div className='flex flex-col gap-3 mb-8'>
                        <div className='site-checkbox flex items-center gap-3 max-sm:justify-center!'>
                            <Checkbox
                                id='terms-confirm'
                                checked={agreedTerms}
                                onCheckedChange={c => setAgreedTerms(!!c)}
                            />
                            <NeonText
                                as='label'
                                htmlFor='terms-confirm'
                                className='text-xs! sm:text-sm! lg:text-base! capitalize'
                                glowSpread={0.5}
                            >
                                I agree to the updated Terms & Conditions
                            </NeonText>
                        </div>
                        <div className='site-checkbox flex items-center gap-3 max-sm:justify-center!'>
                            <Checkbox
                                id='privacy-confirm'
                                checked={agreedPrivacy}
                                onCheckedChange={c => setAgreedPrivacy(!!c)}
                            />
                            <NeonText
                                as='label'
                                htmlFor='privacy-confirm'
                                className='text-xs! sm:text-sm! lg:text-base! capitalize'
                                glowSpread={0.5}
                            >
                                I agree to the updated Privacy Policy
                            </NeonText>
                        </div>
                    </div>

                    <ButtonGroup className='gap-4 sm:gap-6'>
                        <Button
                            size='lg'
                            onClick={handleAccept}
                            disabled={!(agreedTerms && agreedPrivacy)}
                        >
                            Accept
                        </Button>
                        <Button
                            size='lg'
                            variant='secondary'
                            onClick={handleDecline}
                        >
                            Decline
                        </Button>
                    </ButtonGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
}
