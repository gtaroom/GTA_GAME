import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { claimNewUserBonus, claimDailyReward } from '@/lib/api/auth';
import { canShowModal, markModalShown, type ModalType } from '@/lib/modal-cooldown';

export function useNewUserFlow() {
  const { user, updateUserBalance, updateUserFlags } = useAuth();
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we should show modals when user data changes
  useEffect(() => {
    if (!user) return;

    console.log('=== Modal Check ===');
    console.log(`User isNewUser: ${user.isNewUser}, claimedDailyBonus: ${user.claimedDailyBonus}`);
    console.log(`Current modal: ${currentModal}`);
    console.log(`Can show claim-free-coins: ${canShowModal('claim-free-coins')}`);
    console.log(`Can show daily-rewards: ${canShowModal('daily-rewards')}`);

    // Show claim free coins modal if user is new and not in cooldown
    if (user.isNewUser && !currentModal && canShowModal('claim-free-coins')) {
      console.log('Showing claim-free-coins modal');
      setCurrentModal('claim-free-coins');
      return;
    }

    // Show daily rewards modal if:
    // 1. User is not new (or has claimed new user bonus)
    // 2. Hasn't claimed daily bonus yet
    // 3. No modal is currently showing
    // 4. Not in cooldown
    if (!user.claimedDailyBonus && !currentModal && canShowModal('daily-rewards')) {
      console.log('Showing daily-rewards modal');
      setCurrentModal('daily-rewards');
    } else {
      console.log('Daily-rewards conditions not met:');
      console.log(`- !user.isNewUser: ${!user.isNewUser}`);
      console.log(`- !user.claimedDailyBonus: ${!user.claimedDailyBonus}`);
      console.log(`- !currentModal: ${!currentModal}`);
      console.log(`- canShowModal('daily-rewards'): ${canShowModal('daily-rewards')}`);
    }
  }, [user, currentModal]);

  const handleClaimNewUserBonus = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await claimNewUserBonus();
      
      if (response.success) {
        // Update user state optimistically
        updateUserBalance(response.data.goldCoins);
        updateUserFlags({ isNewUser: false });
        
        // Close current modal and show daily rewards (no cooldown for successful claim)
        setCurrentModal('daily-rewards');
      } else {
        setError(response.message || 'Failed to claim bonus');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim bonus');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyReward = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await claimDailyReward();
      
      if (response.success) {
        // Update user state optimistically
        updateUserBalance(response.data.goldCoins);
        updateUserFlags({ 
          claimedDailyBonus: true,
          loginStreak: user.loginStreak + 1
        });
        
        // Close modal completely (no cooldown for successful claim)
        setCurrentModal(null);
      } else {
        setError(response.message || 'Failed to claim daily reward');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim daily reward');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    const closedModal = currentModal;
    
    // Mark modal as shown to start cooldown
    if (currentModal) {
      markModalShown(currentModal);
    }
    setCurrentModal(null);
    setError(null);
    
    // Check if we should show the next modal after closing current one
    setTimeout(() => {
      if (!user) return;
      
      console.log(`Closed modal: ${closedModal}`);
      console.log(`User isNewUser: ${user.isNewUser}, claimedDailyBonus: ${user.claimedDailyBonus}`);
      console.log(`Can show daily-rewards: ${canShowModal('daily-rewards')}`);
      
      // If we just closed claim-free-coins and user is not new, show daily-rewards
      // Check daily-rewards cooldown specifically (not claim-free-coins cooldown)
      if (closedModal === 'claim-free-coins' && 
          !user.isNewUser && 
          !user.claimedDailyBonus && 
          canShowModal('daily-rewards')) { // This checks daily-rewards cooldown, not claim-free-coins
        console.log('Showing daily-rewards modal after closing claim-free-coins');
        setCurrentModal('daily-rewards');
      }
    }, 100); // Small delay to ensure state updates
  };

  return {
    currentModal,
    loading,
    error,
    user,
    handleClaimNewUserBonus,
    handleClaimDailyReward,
    closeModal,
  };
}
