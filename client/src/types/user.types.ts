export interface UserName {
  first: string;
  middle: string;
  last: string;
}

export interface UserAvatar {
  url: string | null;
  localPath: string;
}

export interface User {
  name: UserName;
  avatar: UserAvatar;
  _id: string;
  email: string;
  phone: string;
  birthday?: string | null;
  isEmailVerified: boolean;
  acceptSMSTerms: boolean;
  acceptSMSMarketing: boolean;
  isPhoneVerified: boolean;
  isKYC: boolean;
  isOpted: boolean;
  loginType: string;
  state: string;
  role: string;
  isSmsOpted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  refreshToken: string;
  sweepCoins: number;
  claimedSweepBonus: boolean;
  claimedDailyBonus: boolean;
  isNewUser: boolean;
  loginStreak: number;
  balance: number;
}

export interface UserApiResponse {
  statusCode: number;
  success: boolean;
  data: User;
  message: string;
}

export interface ClaimBonusResponse {
  statusCode: number;
  success: boolean;
  data: {
    goldCoins: number;
    isNewUser?: boolean;
  };
  message: string;
}

export interface ClaimDailyRewardResponse {
  statusCode: number;
  success: boolean;
  data: {
    goldCoins: number;
    balance: number;
    claimedDailyBonus: boolean;
    loginStreak: number;
  };
  message: string;
}
