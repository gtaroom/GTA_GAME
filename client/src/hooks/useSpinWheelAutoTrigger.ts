import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { checkSpinWheelEligibility } from '@/lib/api/vip';

// Spin wheel has its own lightweight cooldown (30 minutes instead of 2 hours)
// This prevents spam but allows it to show more frequently
const SPIN_WHEEL_COOLDOWN = 30 * 60 * 1000; // 30 minutes

// Check if spin wheel modal can be shown
function canShowSpinWheelModal(): boolean {
  if (typeof window === 'undefined') return true;
  
  const now = Date.now();
  const storageKey = 'modal_cooldown_spin_wheel';
  
  try {
    const lastShown = sessionStorage.getItem(storageKey);
    if (!lastShown) return true;
    
    const lastShownTime = parseInt(lastShown, 10);
    const timeSinceLastShown = now - lastShownTime;
    const canShow = timeSinceLastShown >= SPIN_WHEEL_COOLDOWN;
    
    if (!canShow) {
      const remainingMinutes = Math.ceil((SPIN_WHEEL_COOLDOWN - timeSinceLastShown) / (60 * 1000));
      console.log(`🎰 Spin wheel cooldown: ${remainingMinutes} minutes remaining`);
    }
    
    return canShow;
  } catch {
    return true; // If storage fails, allow modal
  }
}

// Mark spin wheel modal as shown
function markSpinWheelModalShown(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem('modal_cooldown_spin_wheel', Date.now().toString());
    console.log('🎰 Spin wheel modal cooldown started');
  } catch (error) {
    console.warn('Failed to mark spin wheel modal as shown', error);
  }
}

// Check if any other modal is currently active
function isOtherModalActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for any open dialogs (but not our spin wheel)
  const openDialogs = document.querySelectorAll('[data-slot="dialog"][data-state="open"]');
  const spinWheelDialog = document.querySelector('[data-slot="dialog"][data-state="open"]')?.querySelector('[data-slot="dialog-content"]')?.textContent?.includes('Treasure Wheel');
  
  // If there are other dialogs open (not spin wheel), return true
  if (openDialogs.length > 0 && !spinWheelDialog) {
    console.log('🎰 Another modal is active, will wait for it to close');
    return true;
  }
  
  return false;
}

export function useSpinWheelAutoTrigger() {
  const { isLoggedIn, isInitializing } = useAuth();
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinsAvailable, setSpinsAvailable] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);

  // Fast eligibility check - optimized for speed
  const checkForSpins = useCallback(async (forceCheck = false) => {
    if (!isLoggedIn || isInitializing) {
      console.log('🎰 Skipping check: not logged in or initializing');
      return;
    }
    
    // Prevent multiple simultaneous checks
    if (isChecking && !forceCheck) {
      console.log('🎰 Check already in progress');
      return;
    }
    
    // Don't check if modal is already shown or in cooldown (unless forced)
    if (!forceCheck) {
      if (showSpinWheel) {
        console.log('🎰 Modal already showing');
        return;
      }
      
      if (!canShowSpinWheelModal()) {
        console.log('🎰 Modal in cooldown');
        return;
      }
      
      // Check if other modals are active
      if (isOtherModalActive()) {
        console.log('🎰 Other modal active, will retry in 2 seconds');
        // Retry after a short delay
        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = setTimeout(() => {
          checkForSpins(true);
        }, 2000);
        return;
      }
    }

    setIsChecking(true);
    console.log('🎰 Checking spin wheel eligibility...');
    const startTime = Date.now();
    
    try {
      const response = await checkSpinWheelEligibility();
      const duration = Date.now() - startTime;
      console.log(`🎰 Eligibility check completed in ${duration}ms:`, response);
      
      if (response?.success && response.data?.eligible && response.data?.spinsAvailable > 0) {
        setSpinsAvailable(response.data.spinsAvailable);
        
        // Only show modal if not in cooldown and not already showing
        if (canShowSpinWheelModal() && !showSpinWheel && !isOtherModalActive()) {
          console.log('🎰 ✅ Spins available! Showing modal automatically');
          setShowSpinWheel(true);
          markSpinWheelModalShown();
          hasCheckedRef.current = true;
        } else {
          console.log('🎰 Spins available but modal blocked:', {
            canShow: canShowSpinWheelModal(),
            alreadyShowing: showSpinWheel,
            otherModalActive: isOtherModalActive(),
          });
        }
      } else {
        setSpinsAvailable(0);
        console.log('🎰 No spins available');
      }
    } catch (error) {
      console.error('🎰 Failed to check spin wheel eligibility:', error);
      // Don't show error to user, just fail silently
    } finally {
      setIsChecking(false);
    }
  }, [isLoggedIn, isInitializing, isChecking, showSpinWheel]);

  // Check eligibility ONLY on login/refresh (like /user API)
  // This runs once when user logs in or page refreshes
  useEffect(() => {
    if (!isLoggedIn) {
      setShowSpinWheel(false);
      setSpinsAvailable(0);
      hasCheckedRef.current = false;
      return;
    }

    // If still initializing, wait for it to complete
    if (isInitializing) {
      console.log('🎰 Waiting for auth initialization...');
      return;
    }

    // Only check if we haven't checked yet (prevents re-checking on re-renders)
    if (hasCheckedRef.current) {
      console.log('🎰 Already checked eligibility on this session');
      return;
    }

    // Check immediately (like /user API - no delay needed)
    console.log('🎰 User logged in/refreshed! Checking eligibility (one-time check)...');
    
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => {
      // Double-check that we're still logged in and not initializing
      if (isLoggedIn && !isInitializing && !hasCheckedRef.current) {
        hasCheckedRef.current = true; // Mark as checked BEFORE calling (prevents race conditions)
        checkForSpins();
      }
    }, 0); // No delay - check immediately like /user API

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    };
  }, [isLoggedIn, isInitializing, checkForSpins]);

  // NO periodic checks - only check on login/refresh (like /user API)
  // Removed: periodic intervals, visibility changes, mutation observers

  const closeModal = useCallback(() => {
    console.log('🎰 Closing spin wheel modal');
    setShowSpinWheel(false);
  }, []);

  // Open modal manually (from sidebar click, etc.)
  const openModal = useCallback(() => {
    if (spinsAvailable > 0) {
      console.log('🎰 Opening spin wheel modal manually');
      setShowSpinWheel(true);
    } else {
      console.log('🎰 Cannot open modal - no spins available');
    }
  }, [spinsAvailable]);

  const handleSpinsUpdate = useCallback((spinsRemaining: number) => {
    setSpinsAvailable(spinsRemaining);
    
    // DON'T close modal when spins hit 0!
    // The user might be viewing their congratulations screen.
    // Modal will close when user clicks OK or closes it manually.
    // This prevents the modal from closing mid-celebration.
  }, []);

  return {
    showSpinWheel,
    spinsAvailable,
    closeModal,
    openModal, // For manual opening from sidebar, etc.
    handleSpinsUpdate,
    checkForSpins, // Expose for manual triggering
  };
}
