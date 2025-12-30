/**
 * Game Account Types
 * Comprehensive types for game account management
 */

export interface GameAccountStatusResponse {
    statusCode: number;
    data: {
        gameId: string;
        gameName: string;
        hasAccount: boolean;
        hasExistingAccount: boolean;
        isCredentialsStored: boolean;
        hasPendingRequest: boolean;
        accountDetails?: {
            username: string;
            hasExistingAccount: boolean;
            isCredentialsStored: boolean;
        };
    };
    message: string;
}

export interface GameAccountDetailsResponse {
    statusCode: number;
    data: {
        userId: string;
        gameId: string;
        gameName: string;
        username: string;
        password: string;
        hasExistingAccount: boolean;
        isCredentialsStored: boolean;
    };
    message: string;
}

export interface StoreExistingAccountRequest {
    gameId: string;
    username?: string;
    password?: string;
    storeCredentials: boolean;
}

export interface StoreExistingAccountResponse {
    statusCode: number;
    data: {
        userId: string;
        gameId: string;
        gameName: string;
        username: string;
        password: string;
        hasExistingAccount: boolean;
        isCredentialsStored: boolean;
    };
    message: string;
}

export interface RequestNewAccountRequest {
    gameId: string;
    amount?: number; // Recharge amount in dollars
}

export interface RequestNewAccountResponse {
    statusCode: number;
    data: {
        userId: string;
        gameId: string;
        gameName: string;
        userEmail: string;
        status: string;
    };
    message: string;
}

export interface GameAccountFormData {
    username: string;
    password: string;
    storeCredentials: boolean;
}

// Game Modal Flow Types
export interface Game {
    _id: string;
    name: string;
    types: string[];
    thumbnail: string;
    description?: string;
    minBet?: number;
    maxBet?: number;
    link?: string; // Game URL for iframe games (bonus/signature)
    // Add other game properties as needed
}

export interface GameModalFlowProps {
    open: boolean;
    onOpenChange?: (val: boolean) => void;
    game: Game | null;
}

export interface GameModalStepProps {
    game: Game;
    onBack?: () => void;
    onSuccess?: () => void;
    onSelect?: (step: number) => void;
}

export interface GamePlayModalProps {
    game: Game;
    accountDetails?: GameAccountDetailsResponse['data'];
    hasStoredCredentials?: boolean;
    onTriggerSaveCredentials?: (username: string, password: string) => void;
}

// Account Selection Types
export type AccountSelectionType = 'existing' | 'new';

export interface AccountSelectionOption {
    icon: string;
    title: string;
    value: AccountSelectionType;
    color: string;
}

// Store Account Step Types
export interface StoreAccountStepProps extends GameModalStepProps {
    onSubmit: (data: GameAccountFormData) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

// Create Account Step Types
export interface CreateAccountStepProps extends GameModalStepProps {
    onRequestAccount: (amount?: number) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
    hasPendingRequest?: boolean;
}

// Process Info Types
export interface ProcessInfo {
    icon?: string;
    description: string;
    color: string;
}

// Game Account Hook Types
export interface UseGameAccountReturn {
    accountStatus: GameAccountStatusResponse['data'] | null;
    accountDetails: GameAccountDetailsResponse['data'] | null;
    isLoading: boolean;
    error: string | null;
    checkAccountStatus: (gameId: string) => Promise<void>;
    getAccountDetails: (gameId: string) => Promise<void>;
    storeExistingAccount: (data: StoreExistingAccountRequest) => Promise<void>;
    requestNewAccount: (data: RequestNewAccountRequest) => Promise<void>;
    clearError: () => void;
}
