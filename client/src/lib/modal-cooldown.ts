/**
 * Industrial-grade modal cooldown management
 * Hybrid approach: Memory cache + sessionStorage fallback
 * Optimized for performance and reliability
 */

const COOLDOWN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export type ModalType = 'claim-free-coins' | 'daily-rewards';

const STORAGE_KEYS = {
  'claim-free-coins': 'modal_cooldown_claim_free_coins',
  'daily-rewards': 'modal_cooldown_daily_rewards',
} as const;

// In-memory cache for ultra-fast access
const memoryCache = new Map<ModalType, number>();

/**
 * Check if a modal can be shown (not in cooldown)
 * Industrial approach: Memory cache first, sessionStorage fallback
 */
export function canShowModal(modalType: ModalType): boolean {
  if (typeof window === 'undefined') return true;
  
  const now = Date.now();
  
  // Check memory cache first (fastest - ~0.001ms)
  const memoryTime = memoryCache.get(modalType);
  if (memoryTime !== undefined) {
    const canShow = (now - memoryTime) >= COOLDOWN_DURATION;
    console.log(`Modal ${modalType}: Memory cache check - canShow: ${canShow}, timeDiff: ${now - memoryTime}ms`);
    return canShow;
  }
  
  // Fallback to sessionStorage (fast - ~0.08ms)
  try {
    const storageKey = STORAGE_KEYS[modalType];
    const lastShown = sessionStorage.getItem(storageKey);
    
    if (!lastShown) {
      console.log(`Modal ${modalType}: No cooldown found, can show`);
      return true;
    }
    
    const lastShownTime = parseInt(lastShown, 10);
    const canShow = (now - lastShownTime) >= COOLDOWN_DURATION;
    
    console.log(`Modal ${modalType}: SessionStorage check - canShow: ${canShow}, timeDiff: ${now - lastShownTime}ms`);
    
    // Update memory cache for next check
    if (!canShow) {
      memoryCache.set(modalType, lastShownTime);
    }
    
    return canShow;
  } catch (error) {
    // Graceful degradation if storage fails
    console.warn('Modal cooldown: Storage access failed, allowing modal', error);
    return true;
  }
}

/**
 * Mark a modal as shown (start cooldown)
 * Updates both memory cache and sessionStorage
 */
export function markModalShown(modalType: ModalType): void {
  if (typeof window === 'undefined') return;
  
  const now = Date.now();
  
  // Update memory cache (fastest)
  memoryCache.set(modalType, now);
  
  // Update sessionStorage (persistence)
  try {
    const storageKey = STORAGE_KEYS[modalType];
    sessionStorage.setItem(storageKey, now.toString());
    console.log(`Modal ${modalType}: Cooldown started at ${now}`);
  } catch (error) {
    console.warn('Modal cooldown: Failed to persist to storage', error);
    // Memory cache still works, so functionality continues
  }
}

/**
 * Clear cooldown for a modal (for testing or manual reset)
 */
export function clearModalCooldown(modalType: ModalType): void {
  if (typeof window === 'undefined') return;
  
  // Clear memory cache
  memoryCache.delete(modalType);
  
  // Clear sessionStorage
  try {
    const storageKey = STORAGE_KEYS[modalType];
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Modal cooldown: Failed to clear storage', error);
  }
}

/**
 * Get remaining cooldown time in milliseconds
 */
export function getRemainingCooldown(modalType: ModalType): number {
  if (typeof window === 'undefined') return 0;
  
  const now = Date.now();
  
  // Check memory cache first
  const memoryTime = memoryCache.get(modalType);
  if (memoryTime !== undefined) {
    const elapsed = now - memoryTime;
    return Math.max(0, COOLDOWN_DURATION - elapsed);
  }
  
  // Fallback to sessionStorage
  try {
    const storageKey = STORAGE_KEYS[modalType];
    const lastShown = sessionStorage.getItem(storageKey);
    
    if (!lastShown) return 0;
    
    const lastShownTime = parseInt(lastShown, 10);
    const elapsed = now - lastShownTime;
    
    return Math.max(0, COOLDOWN_DURATION - elapsed);
  } catch (error) {
    return 0;
  }
}

/**
 * Format remaining cooldown time as human-readable string
 */
export function formatCooldownTime(remainingMs: number): string {
  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Initialize cooldown system (call on app startup)
 * Pre-loads sessionStorage data into memory cache
 */
export function initializeModalCooldowns(): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.entries(STORAGE_KEYS).forEach(([modalType, storageKey]) => {
      const lastShown = sessionStorage.getItem(storageKey);
      if (lastShown) {
        memoryCache.set(modalType as ModalType, parseInt(lastShown, 10));
      }
    });
  } catch (error) {
    console.warn('Modal cooldown: Failed to initialize', error);
  }
}
