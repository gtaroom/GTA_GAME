# Game Card Modal Flow Module

A comprehensive, type-safe module for handling game account management and game play modal flows with dynamic game integration.

## Architecture

### 📁 Directory Structure
```
src/components/game-card-modal-flow/
├── index.tsx                    # Main modal flow controller
├── account-selection-step.tsx   # Account selection UI
├── store-account-step.tsx      # Store existing account form
├── create-account-step.tsx     # Request new account flow
├── game-play-modal.tsx         # Game play interface
├── game-modal-title.tsx        # Shared title component
└── index.ts                    # Barrel exports

src/types/
└── game-account.types.ts       # Comprehensive type definitions

src/lib/api/
└── game-accounts.ts            # Game account API functions

src/hooks/
└── useGameAccount.ts           # Game account management hook
```

## 🎯 Key Features

### Dynamic Game Integration
- **Game-Specific Modals**: Modal content adapts based on selected game
- **Account Status Checking**: Automatic account verification before showing options
- **Smart Flow**: Direct to game play if account exists, otherwise show setup flow

### Account Management
- **Existing Account Storage**: Store username/password with credential saving option
- **New Account Requests**: Request account creation through support team
- **Account Status Tracking**: Real-time account status and pending request handling

### API Integration
- **Account Status**: `/games/${gameId}/user-status` - Check if user has account
- **Account Details**: `/game-accounts/my-account/${gameId}` - Get stored credentials
- **Store Account**: `/game-accounts/store-existing` - Store existing credentials
- **Request Account**: `/game-accounts/request-new` - Request new account creation

## 🔧 Usage

### Basic Usage
```typescript
import { GameCardModalFlow } from '@/components/game-card-modal-flow';

const game = {
    _id: 'game123',
    name: 'Ocean King',
    type: 'exclusive',
    thumbnail: '/game-thumbnails/ocean-king.jpg',
};

<GameCardModalFlow
    open={isModalOpen}
    onOpenChange={setIsModalOpen}
    game={game}
/>
```

### Custom Hook Usage
```typescript
import { useGameAccount } from '@/hooks/useGameAccount';

const {
    accountStatus,
    accountDetails,
    isLoading,
    error,
    checkAccountStatus,
    storeExistingAccount,
    requestNewAccount,
} = useGameAccount();

// Check account status
await checkAccountStatus('game123');

// Store existing account
await storeExistingAccount({
    gameId: 'game123',
    username: 'player123',
    password: 'password123',
    storeCredentials: true,
});

// Request new account
await requestNewAccount({
    gameId: 'game123',
});
```

## 📋 Types

### Core Game Types
```typescript
interface Game {
    _id: string;
    name: string;
    type: 'exclusive' | 'signature' | 'featured';
    thumbnail: string;
    description?: string;
    minBet?: number;
    maxBet?: number;
}

interface GameModalFlowProps {
    open: boolean;
    onOpenChange?: (val: boolean) => void;
    game: Game | null;
}
```

### Account Management Types
```typescript
interface GameAccountStatusResponse {
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

interface StoreExistingAccountRequest {
    gameId: string;
    username?: string;
    password?: string;
    storeCredentials: boolean;
}
```

## 🔄 Modal Flow

### Step 0: Account Selection
- **Has Account**: Shows "Start Playing" button, goes directly to game play
- **Pending Request**: Shows pending status with spinner
- **No Account**: Shows "I have an account" and "I need a new account" options

### Step 1: Store Existing Account
- **Form Fields**: Username, Password, Store Credentials checkbox
- **API Call**: `/game-accounts/store-existing`
- **Success**: Redirects to game play (Step 3)

### Step 2: Request New Account
- **Process Info**: Shows account creation process steps
- **API Call**: `/game-accounts/request-new`
- **Success**: Shows pending status, user gets notified when ready

### Step 3: Game Play
- **Game Interface**: Full-screen game play modal
- **Account Info**: Shows stored account details if available
- **Controls**: Home, Refresh, Like, Volume, Bug Report, Full Screen

## 🛡️ Error Handling

### Comprehensive Error Management
- **API Errors**: Clear error messages for failed requests
- **Form Validation**: Required field validation
- **Loading States**: Visual feedback during API calls
- **Network Issues**: Graceful handling of connection problems

### User Experience
- **Clear Messaging**: User-friendly error descriptions
- **Retry Options**: Easy retry for failed operations
- **Fallback States**: Graceful degradation when services unavailable

## 🎨 Design System

### Consistent Styling
- **NeonBox**: Consistent glow effects and backgrounds
- **NeonIcon**: Icon system with glow support
- **NeonText**: Typography with neon effects
- **Responsive**: Mobile-first design with breakpoint support

### Visual Hierarchy
- **Step Indicators**: Clear progress through modal steps
- **Status Indicators**: Visual feedback for account states
- **Action Buttons**: Prominent CTAs with proper states

## 🔐 Security

### Credential Handling
- **Secure Storage**: Credentials stored securely on backend
- **Optional Storage**: User choice to store or not store credentials
- **No Local Storage**: Credentials never stored in browser
- **Encrypted Transmission**: All API calls use HTTPS

### Account Protection
- **Status Verification**: Always verify account status before actions
- **Permission Checks**: Ensure user has access to requested game
- **Session Management**: Proper session handling for account operations

## 📱 Mobile Support

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets and gestures
- **Adaptive Layout**: Layout adjusts based on screen size
- **Performance**: Optimized for mobile performance

### Cross-Platform
- **iOS Safari**: Full support with proper viewport handling
- **Android Chrome**: Complete functionality
- **Desktop**: Enhanced experience with larger modals

## 🧪 Testing

### Testable Architecture
- **Pure Functions**: API functions are pure and testable
- **Mocked Dependencies**: Easy to mock API calls
- **Component Isolation**: Each step can be tested independently
- **Type Safety**: TypeScript ensures type correctness

### Test Scenarios
- **Account Status**: Test different account states
- **Form Validation**: Test form submission and validation
- **API Integration**: Test API success and failure scenarios
- **User Flows**: Test complete user journeys

## 🚀 Performance

### Optimization Features
- **Lazy Loading**: Components loaded on demand
- **Memoization**: useCallback for expensive operations
- **State Management**: Efficient state updates
- **API Caching**: Appropriate caching strategies

### Bundle Size
- **Tree Shaking**: Only import what's needed
- **Code Splitting**: Modal components split from main bundle
- **Type Imports**: Type-only imports where possible

## 📚 Best Practices

### Code Quality
- **Type Safety**: Comprehensive TypeScript coverage
- **Separation of Concerns**: Clear layer boundaries
- **Reusability**: Shared types and components
- **Maintainability**: Well-documented and structured code

### Error Boundaries
- **Graceful Degradation**: Handle errors without breaking UI
- **User Feedback**: Clear error messages and recovery options
- **Logging**: Proper error logging for debugging
- **Monitoring**: Track errors for improvement

## 🔧 Configuration

### Environment Setup
```typescript
// API endpoints are configurable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Game-specific configurations
const GAME_CONFIG = {
    minCoinsRequired: 500,
    accountCreationTime: 'few minutes',
    supportContact: '/support',
};
```

### Customization
- **Themes**: Easy to customize colors and styling
- **Text**: Configurable text and messages
- **Flow**: Customizable modal flow steps
- **Validation**: Configurable form validation rules

This module provides a complete, production-ready solution for game account management with excellent user experience and developer experience.
