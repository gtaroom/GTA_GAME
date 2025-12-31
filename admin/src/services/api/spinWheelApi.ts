import { baseUserApi } from "./baseUserApi";

// Reward Types
export type RewardType = "GC" | "SC";
export type RarityType = "common" | "uncommon" | "rare" | "very_rare" | "ultra_rare" | "top_reward";

export interface Reward {
  id: number;
  amount: number;
  type: RewardType;
  rarity: RarityType;
  probability: number;
  description: string;
  isActive: boolean;
}

// Trigger Types
export interface FirstTimeTrigger {
  enabled: boolean;
  spinsPerUser: number;
}

export interface RandomTrigger {
  enabled: boolean;
  probability: number;
  cooldownHours: number;
}

export interface Threshold {
  id: string;
  spendingAmount: number;
  spinsAwarded: number;
  isActive: boolean;
}

export interface ThresholdTrigger {
  enabled: boolean;
  thresholds: Threshold[];
}

export interface Triggers {
  firstTime: FirstTimeTrigger;
  random: RandomTrigger;
  threshold: ThresholdTrigger;
}

// Configuration
export interface SpinWheelConfig {
  _id?: string;
  isActive: boolean;
  rewards: Reward[];
  triggers: Triggers;
  createdAt?: string;
  updatedAt?: string;
}

// Validation
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  totalProbability: number;
}

// Statistics
export interface SpinWheelUser {
  _id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
}

export interface RecentSpin {
  _id: string;
  userId: SpinWheelUser;
  spinId: string;
  rewardId: number;
  amount: number;
  type: RewardType;
  rarity: RarityType;
  description: string;
  spunAt: string;
  claimedAt?: string;
}

export interface SpinWheelStatistics {
  totalSpins: number;
  spinsByRarity: {
    common: number;
    uncommon: number;
    rare: number;
    very_rare: number;
    ultra_rare: number;
    top_reward: number;
  };
  totalRewardsGiven: {
    GC: number;
    SC: number;
  };
  recentSpins: RecentSpin[];
  usersWithSpins: number;
  totalSpinsAvailable: number;
}

// Update Payloads
export interface UpdateConfigPayload {
  isActive?: boolean;
  rewards?: Reward[];
  triggers?: Partial<Triggers>;
}

export interface UpdateConfigResponse {
  config: SpinWheelConfig;
  validation: ValidationResult;
}

export const spinWheelApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get spin wheel configuration
    getSpinWheelConfig: builder.query<SpinWheelConfig, void>({
      query: () => "/spin-wheel/admin/config",
      transformResponse: (response: {
        statusCode: number;
        data: {
          config: SpinWheelConfig;
        };
        message: string;
      }) => response.data.config,
      providesTags: ["SpinWheelConfig"],
    }),

    // Update spin wheel configuration
    updateSpinWheelConfig: builder.mutation<UpdateConfigResponse, UpdateConfigPayload>({
      query: (payload) => ({
        url: "/spin-wheel/admin/config",
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        statusCode: number;
        data: UpdateConfigResponse;
        message: string;
      }) => response.data,
      invalidatesTags: ["SpinWheelConfig", "SpinWheelValidation"],
    }),

    // Validate configuration
    validateSpinWheelConfig: builder.query<ValidationResult, void>({
      query: () => "/spin-wheel/admin/validate-config",
      transformResponse: (response: {
        statusCode: number;
        data: ValidationResult;
        message: string;
      }) => response.data,
      providesTags: ["SpinWheelValidation"],
    }),

    // Get spin wheel statistics
    getSpinWheelStats: builder.query<SpinWheelStatistics, void>({
      query: () => "/spin-wheel/admin/stats",
      transformResponse: (response: {
        statusCode: number;
        data: SpinWheelStatistics;
        message: string;
      }) => response.data,
      providesTags: ["SpinWheelStats"],
    }),
  }),
});

export const {
  useGetSpinWheelConfigQuery,
  useUpdateSpinWheelConfigMutation,
  useValidateSpinWheelConfigQuery,
  useGetSpinWheelStatsQuery,
} = spinWheelApi;


