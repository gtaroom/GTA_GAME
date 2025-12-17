/**
 * Game Card Modal Flow Module Exports
 * Centralized exports for the game modal flow components
 */

// Types
export type {
    Game,
    GameModalFlowProps,
    GameModalStepProps,
    GamePlayModalProps,
    GameAccountStatusResponse,
    GameAccountDetailsResponse,
    StoreExistingAccountRequest,
    StoreExistingAccountResponse,
    RequestNewAccountRequest,
    RequestNewAccountResponse,
    GameAccountFormData,
    AccountSelectionType,
    AccountSelectionOption,
    StoreAccountStepProps,
    CreateAccountStepProps,
    ProcessInfo,
    UseGameAccountReturn,
} from '@/types/game-account.types';

// Components
export { default as GameCardModalFlow } from './game-modal-flow';
export { default as AccountSelectionStep } from './account-selection-step';
export { default as StoreAccountStep } from './store-account-step';
export { default as CreateAccountStep } from './create-account-step';
export { default as GamePlayStep } from './game-play-modal';

// Hooks
export { useGameAccount } from '@/hooks/useGameAccount';

// API
export {
    getGameAccountStatus,
    getGameAccountDetails,
    storeExistingAccount,
    requestNewAccount,
} from '@/lib/api/game-accounts';
