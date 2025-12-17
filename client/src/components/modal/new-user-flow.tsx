'use client';

import { Dialog } from '@/components/ui/dialog';
import ClaimFreeCoins from './claim-free-coins';
import DailyRewards from './daily-rewards';
import { useNewUserFlow } from '@/hooks/useNewUserFlow';

export default function NewUserFlowModal() {
  const {
    currentModal,
    loading,
    error,
    user,
    handleClaimNewUserBonus,
    handleClaimDailyReward,
    closeModal,
  } = useNewUserFlow();

  if (!currentModal) return null;

  return (
    <Dialog 
      open={!!currentModal} 
      onOpenChange={(open) => {
        // Only apply cooldown when user manually closes modal (not after claiming)
        if (!open) {
          closeModal();
        }
      }}
    >
      {currentModal === 'claim-free-coins' && (
        <ClaimFreeCoins
          onClaim={handleClaimNewUserBonus}
          loading={loading}
          error={error}
        />
      )}
      
      {currentModal === 'daily-rewards' && (
        <DailyRewards
          user={user}
          onClaim={handleClaimDailyReward}
          loading={loading}
          error={error}
        />
      )}
    </Dialog>
  );
}
