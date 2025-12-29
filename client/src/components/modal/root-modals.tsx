'use client';

import { useCallback, useEffect, useState } from 'react';
import ExclusiveOfferModal from './exclusive-offer';
import ImportantUpdateModal from './important-update';
import NewUserFlowModal from './new-user-flow';
import SpinWheelModal from './spin-wheel-modal';
import { useSpinWheel } from '@/contexts/spin-wheel-context';
import { Dialog } from '../ui/dialog';

const STORAGE_KEY = 'importantUpdateAccepted';

export default function RootModals() {
    const [showImportant, setShowImportant] = useState(false);
    const [showExclusive, setShowExclusive] = useState(false);
    const { showSpinWheel, spinsAvailable, closeModal, handleSpinsUpdate } = useSpinWheel();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (localStorage.getItem(STORAGE_KEY) === 'true') return;

        const timer = setTimeout(() => setShowImportant(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    const scheduleExclusive = useCallback(() => {
        const timer = setTimeout(() => setShowExclusive(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleImportantClose = useCallback(
        (accepted: boolean) => {
            setShowImportant(false);

            if (accepted) {
                localStorage.setItem(STORAGE_KEY, 'true');
            }

            scheduleExclusive();
        },
        [scheduleExclusive]
    );

    return (
        <>
            <ImportantUpdateModal
                open={false}
                onOpenChange={isOpen => {
                    if (!isOpen) handleImportantClose(false);
                    setShowImportant(isOpen);
                }}
                onAccept={() => handleImportantClose(true)}
                onDecline={() => handleImportantClose(false)}
            />

            <ExclusiveOfferModal
                open={showExclusive}
                onOpenChange={setShowExclusive}
            />

            {/* New User Flow Modals */}
            <NewUserFlowModal />

            {/* Auto-triggered Spin Wheel Modal */}
            <Dialog 
                open={showSpinWheel} 
                onOpenChange={(open) => {
                    // Only close if user explicitly closes (not during internal state changes)
                    if (!open) {
                        closeModal();
                    }
                }}
            >
                {showSpinWheel && (
                    <SpinWheelModal
                        initialSpinsAvailable={spinsAvailable}
                        onSpinsUpdate={handleSpinsUpdate}
                        onClose={closeModal}
                    />
                )}
            </Dialog>
        </>
    );
}
