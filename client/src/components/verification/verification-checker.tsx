'use client';

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import EmailMarketingConsent from '../modal/email-marketing-consent';
import EmailVerificationPrompt from '../modal/email-verification-prompt';
import PhoneVerificationPrompt from '../modal/phone-verification-prompt';
import SmsMarketingConsent from '../modal/sms-marketing-consent';

const INITIAL_DELAY = 15000; // 15 seconds (increased from 10)
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MODAL_DELAY = 3000; // 3 seconds between modals

export default function VerificationChecker() {
    const { user } = useAuth();
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        // Wait 10 seconds before showing any modal
        const timer = setTimeout(() => {
            checkAndShowNextModal();
        }, INITIAL_DELAY);

        return () => clearTimeout(timer);
    }, [user]);

    const checkAndShowNextModal = () => {
        if (!user) return;
        if (typeof window === 'undefined') return; // SSR guard

        const userId = user._id;
        const now = Date.now();

        // Priority 1: Phone Verification
        if (!user.isPhoneVerified) {
            const dismissedKey = `phone_verification_dismissed_${userId}`;
            let lastDismissed: string | null = null;
            try {
                lastDismissed = window.localStorage.getItem(dismissedKey);
            } catch {}

            if (
                !lastDismissed ||
                now - parseInt(lastDismissed) > REMINDER_INTERVAL
            ) {
                setActiveModal('phone');
                return;
            }
        }

        // Priority 2: Email Verification
        if (!user.isEmailVerified) {
            const dismissedKey = `email_verification_dismissed_${userId}`;
            let lastDismissed: string | null = null;
            try {
                lastDismissed = window.localStorage.getItem(dismissedKey);
            } catch {}

            if (
                !lastDismissed ||
                now - parseInt(lastDismissed) > REMINDER_INTERVAL
            ) {
                setActiveModal('email');
                return;
            }
        }

        // Priority 3: Email Marketing Consent

        // if (!user.isOpted) {
        //     const askedKey = `email_consent_asked_${userId}`;
        //     let hasBeenAsked: string | null = null;
        //     try {
        //         hasBeenAsked = window.localStorage.getItem(askedKey);
        //     } catch {}

        //     if (!hasBeenAsked) {
        //         setActiveModal('email-consent');
        //         return;
        //     }
        // }

        // Priority 4: SMS Marketing Consent
        if (!user.isSmsOpted) {
            const askedKey = `sms_consent_asked_${userId}`;
            let hasBeenAsked: string | null = null;
            try {
                hasBeenAsked = window.localStorage.getItem(askedKey);
            } catch {}

            if (!hasBeenAsked) {
                setActiveModal('sms-consent');
                return;
            }
        }
    };

    const handlePhoneModalClose = (
        action: 'verify' | 'dismiss' | 'skip_all'
    ) => {
        if (action === 'dismiss' && user && typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    `phone_verification_dismissed_${user._id}`,
                    Date.now().toString()
                );
            } catch {}
        }

        if (action === 'skip_all') {
            handleSkipAllModals();
            return;
        }

        setActiveModal(null);

        // Check for next modal after a delay (longer for better UX)
        setTimeout(checkAndShowNextModal, MODAL_DELAY);
    };

    const handleEmailModalClose = (action: 'verify' | 'dismiss') => {
        if (action === 'dismiss' && user && typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    `email_verification_dismissed_${user._id}`,
                    Date.now().toString()
                );
            } catch {}
        }
        setActiveModal(null);

        // Check for next modal after a delay (longer for better UX)
        setTimeout(checkAndShowNextModal, MODAL_DELAY);
    };

    const handleEmailConsentClose = (consented: boolean) => {
        if (user && typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    `email_consent_asked_${user._id}`,
                    'true'
                );
            } catch {}
        }
        setActiveModal(null);

        // Check for next modal after a delay (longer for better UX)
        setTimeout(checkAndShowNextModal, MODAL_DELAY);
    };

    const handleSmsConsentClose = (consented: boolean) => {
        if (user && typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    `sms_consent_asked_${user._id}`,
                    'true'
                );
            } catch {}
        }
        setActiveModal(null);
    };

    const handleSkipAllModals = () => {
        if (user && typeof window !== 'undefined') {
            try {
                // Mark all modals as dismissed for 24 hours
                const now = Date.now().toString();
                window.localStorage.setItem(
                    `phone_verification_dismissed_${user._id}`,
                    now
                );
                window.localStorage.setItem(
                    `email_verification_dismissed_${user._id}`,
                    now
                );
                window.localStorage.setItem(
                    `email_consent_asked_${user._id}`,
                    'true'
                );
                window.localStorage.setItem(
                    `sms_consent_asked_${user._id}`,
                    'true'
                );
            } catch {}
        }
        setActiveModal(null);
    };

    if (!user) return null;

    return (
        <>
            <PhoneVerificationPrompt
                open={activeModal === 'phone'}
                onClose={handlePhoneModalClose}
                phone={user.phone}
            />

            <EmailVerificationPrompt
                open={activeModal === 'email'}
                onClose={handleEmailModalClose}
                email={user.email}
            />

            <EmailMarketingConsent
                open={activeModal === 'email-consent'}
                onClose={handleEmailConsentClose}
            />

            <SmsMarketingConsent
                open={activeModal === 'sms-consent'}
                onClose={handleSmsConsentClose}
            />
        </>
    );
}
