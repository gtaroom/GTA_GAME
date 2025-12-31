'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { checkSpinWheelEligibility } from '@/lib/api/vip';

interface SpinWheelContextValue {
    showSpinWheel: boolean;
    spinsAvailable: number;
    isChecking: boolean;
    openModal: () => void;
    closeModal: () => void;
    handleSpinsUpdate: (spinsRemaining: number) => void;
}

const SpinWheelContext = createContext<SpinWheelContextValue | null>(null);

// Spin wheel has its own lightweight cooldown (30 minutes)
const SPIN_WHEEL_COOLDOWN = 30 * 60 * 1000;

function canShowSpinWheelModal(): boolean {
    if (typeof window === 'undefined') return true;
    
    const now = Date.now();
    const storageKey = 'modal_cooldown_spin_wheel';
    
    try {
        const lastShown = sessionStorage.getItem(storageKey);
        if (!lastShown) return true;
        
        const lastShownTime = parseInt(lastShown, 10);
        const timeSinceLastShown = now - lastShownTime;
        return timeSinceLastShown >= SPIN_WHEEL_COOLDOWN;
    } catch {
        return true;
    }
}

function markSpinWheelModalShown(): void {
    if (typeof window === 'undefined') return;
    
    try {
        sessionStorage.setItem('modal_cooldown_spin_wheel', Date.now().toString());
    } catch (error) {
        // console.warn('Failed to mark spin wheel modal as shown', error);
    }
}

function isOtherModalActive(): boolean {
    if (typeof window === 'undefined') return false;
    
    const openDialogs = document.querySelectorAll('[data-slot="dialog"][data-state="open"]');
    const spinWheelDialog = document.querySelector('[data-slot="dialog"][data-state="open"]')?.querySelector('[data-slot="dialog-content"]')?.textContent?.includes('Treasure Wheel');
    
    if (openDialogs.length > 0 && !spinWheelDialog) {
        return true;
    }
    
    return false;
}

export function SpinWheelProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, isInitializing } = useAuth();
    const [showSpinWheel, setShowSpinWheel] = useState(false);
    const [spinsAvailable, setSpinsAvailable] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasCheckedRef = useRef(false);

    // Fast eligibility check - NO cooldown blocking, always check eligibility
    const checkForSpins = useCallback(async (forceCheck = false) => {
        if (!isLoggedIn || isInitializing) {
            return;
        }
        
        if (isChecking && !forceCheck) {
            return;
        }
        
        // Only check if modal is already showing or other modal is active (don't block eligibility check)
        if (!forceCheck) {
            if (showSpinWheel) return;
            if (isOtherModalActive()) {
                if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
                checkTimeoutRef.current = setTimeout(() => {
                    checkForSpins(true);
                }, 2000);
                return;
            }
        }

        setIsChecking(true);
        // console.log('🎰 Checking spin wheel eligibility...');
        
        try {
            // Always call eligibility API - no cooldown blocking
            const response = await checkSpinWheelEligibility();
            
            if (response?.success && response.data?.eligible) {
                const spins = response.data?.spinsAvailable || 0;
                setSpinsAvailable(spins);
                
                // Only auto-show modal if cooldown allows (but eligibility was always checked)
                if (spins > 0 && canShowSpinWheelModal() && !showSpinWheel && !isOtherModalActive()) {
                    // console.log('🎰 ✅ Spins available! Showing modal automatically');
                    setShowSpinWheel(true);
                    markSpinWheelModalShown();
                    hasCheckedRef.current = true;
                }
            } else {
                setSpinsAvailable(0);
            }
        } catch (error) {
            // console.error('🎰 Failed to check spin wheel eligibility:', error);
        } finally {
            setIsChecking(false);
        }
    }, [isLoggedIn, isInitializing, isChecking, showSpinWheel]);

    // Check eligibility on login/refresh
    useEffect(() => {
        if (!isLoggedIn) {
            setShowSpinWheel(false);
            setSpinsAvailable(0);
            hasCheckedRef.current = false;
            return;
        }

        if (isInitializing) return;

        if (hasCheckedRef.current) return;

        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = setTimeout(() => {
            if (isLoggedIn && !isInitializing && !hasCheckedRef.current) {
                hasCheckedRef.current = true;
                checkForSpins();
            }
        }, 0);

        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
                checkTimeoutRef.current = null;
            }
        };
    }, [isLoggedIn, isInitializing, checkForSpins]);

    const closeModal = useCallback(() => {
        // console.log('🎰 Closing spin wheel modal');
        setShowSpinWheel(false);
    }, []);

    const openModal = useCallback(() => {
        if (spinsAvailable > 0) {
            // console.log('🎰 Opening spin wheel modal manually');
            setShowSpinWheel(true);
        } else {
            // console.log('🎰 Cannot open modal - no spins available');
        }
    }, [spinsAvailable]);

    const handleSpinsUpdate = useCallback((spinsRemaining: number) => {
        setSpinsAvailable(spinsRemaining);
    }, []);

    return (
        <SpinWheelContext.Provider
            value={{
                showSpinWheel,
                spinsAvailable,
                isChecking,
                openModal,
                closeModal,
                handleSpinsUpdate,
            }}
        >
            {children}
        </SpinWheelContext.Provider>
    );
}

export function useSpinWheel() {
    const context = useContext(SpinWheelContext);
    if (!context) {
        throw new Error('useSpinWheel must be used within a SpinWheelProvider');
    }
    return context;
}

