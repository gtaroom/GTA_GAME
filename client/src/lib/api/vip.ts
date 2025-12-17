import { httpWithErrorHandling } from '../api-error-handler';

// VIP API Types
export interface VipStatusResponse {
  statusCode: number;
  data: {
    tier: string;
    tierName: string;
    isVipConfirmed: boolean;
    last7DaysSpending: number;
    totalLifetimeSpending: number;
    arcadeTickets: number;
    arcadeTicketsNeededForNextTier: number;
    vipPeriodStartDate: string;
    vipPeriodEndDate: string;
    daysRemainingInPeriod: number;
    perks: {
      bonusMultiplier: number;
      birthdayBonus: number;
      scRedemptionLimit: number;
      drawingEntry: boolean;
      surpriseDrops: boolean;
      bonusSpins: number;
      bonusSpinFrequencyDays: number;
    };
    bonusSpinsRemaining: number;
    bonusSpinsGrantedAt: string;
    bonusSpinsExpireAt: string;
    tierHistory: Array<{
      tier: string;
      achievedAt: string;
      spendingAtTime: number;
    }>;
    nextTier: {
      tier: string;
      name: string;
      minSpend: number;
      spendingNeeded: number;
      message: string;
    };
    // Birthday-related fields
    birthdayBonusClaimed?: boolean;
    birthdayBonusWindowActive?: boolean;
  };
  message: string;
  success: boolean;
}

export interface VipTiersResponse {
  statusCode: number;
  data: {
    tiers: Array<{
      tier: string;
      name: string;
      minSpend: number;
      bonusMultiplier: number;
      birthdayBonus: number;
      scRedemptionLimit: number;
      drawingEntry: boolean;
      surpriseDrops: boolean;
      bonusSpins: number;
      bonusSpinFrequencyDays: number;
    }>;
  };
  message: string;
  success: boolean;
}

export interface BirthdayBonusResponse {
  statusCode: number;
  data: {
    bonusAmount: number;
    newBalance: number;
  };
  message: string;
  success: boolean;
}

export interface BonusSpinsCheckResponse {
  statusCode: number;
  data: {
    hasSpins: boolean;
    spinsRemaining: number;
    expiresAt?: string;
    message: string;
  };
  message: string;
  success: boolean;
}

export interface UseBonusSpinResponse {
  statusCode: number;
  data: {
    success: boolean;
    spinsRemaining: number;
    message: string;
    spinResult?: {
      rewardId: number;
      amount: number;
      type: 'GC' | 'SC';
      rarity?: string;
      description?: string;
      timestamp?: string;
      spinId: string;
    };
  };
  message: string;
  success: boolean;
}

export interface RedemptionLimitResponse {
  statusCode: number;
  data: {
    dailyLimit: number;
    tier: string;
    tierName: string;
  };
  message: string;
  success: boolean;
}

export interface UpdateBirthdayResponse {
  statusCode: number;
  data: {
    birthday: string;
  };
  message: string;
  success: boolean;
}

// VIP API Functions
export function getVipStatus() {
  return httpWithErrorHandling<VipStatusResponse>('/vip/status', { method: 'GET' });
}

export function getAllVipTiers() {
  return httpWithErrorHandling<VipTiersResponse>('/vip/tiers', { method: 'GET' });
}

export function claimBirthdayBonus() {
  return httpWithErrorHandling<BirthdayBonusResponse>('/vip/birthday-bonus/claim', { method: 'POST' });
}

export function checkBonusSpins() {
  return httpWithErrorHandling<BonusSpinsCheckResponse>('/vip/bonus-spins/check', { method: 'GET' });
}

export function useBonusSpin(gameId: string, gameName: string) {
  return httpWithErrorHandling<UseBonusSpinResponse>('/vip/bonus-spins/use', { 
    method: 'POST',
    body: { gameId, gameName }
  });
}

// Spin-wheel config
export interface SpinWheelConfigResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    rewards: Array<{
      id: number;
      amount: number;
      type: 'GC' | 'SC';
      rarity?: string;
    }>;
  };
}

export function getSpinWheelConfig() {
  return httpWithErrorHandling<SpinWheelConfigResponse>('/spin-wheel/config', { method: 'GET' });
}

export interface ClaimSpinRewardResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    newBalance: number;
    spinId: string;
  };
}

export function claimSpinReward(spinId: string) {
  return httpWithErrorHandling<ClaimSpinRewardResponse>('/spin-wheel/claim', {
    method: 'POST',
    body: { spinId },
  });
}

export function getRedemptionLimit() {
  return httpWithErrorHandling<RedemptionLimitResponse>('/vip/redemption-limit', { method: 'GET' });
}

export function updateBirthday(birthday: string) {
  return httpWithErrorHandling<UpdateBirthdayResponse>('/vip/birthday', { 
    method: 'PUT',
    body: { birthday }
  });
}
