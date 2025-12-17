# Buy Coins Module

A well-structured, type-safe module for handling coin purchases with multiple payment methods including GoatPayments integration.

## Architecture

### 📁 Directory Structure
```
src/app/(account)/buy-coins/
├── components/           # UI Components
│   ├── payment-modal.tsx
│   ├── goat-payments-modal.tsx
│   ├── coin-calculator.tsx
│   └── coin-packages.tsx
├── hooks/               # Custom Hooks
│   ├── usePaymentModal.ts
│   └── useGoatPayments.ts
├── services/            # Business Logic
│   ├── payment-service.ts
│   └── goat-payments-service.ts
├── config/             # Configuration
│   ├── payment-methods.ts
│   └── goat-payments.ts
├── types/              # Shared Types
│   └── index.ts
├── success/            # Success Page
│   └── page.tsx
├── failed/             # Failed Page
│   └── page.tsx
├── index.ts            # Barrel Exports
└── page.tsx            # Main Page
```

## 🎯 Key Features

### Payment Methods
- **GoatPayments**: Card, Apple Pay, Google Pay
- **Plisio**: Crypto payments
- **Soap**: Card/Bank transfer
- **CentryOS**: CashApp payments

### Components
- **CoinCalculator**: Custom amount calculation with bonus logic
- **CoinPackages**: Predefined packages
- **PaymentModal**: Payment method selection
- **GoatPaymentsModal**: GoatPayments-specific UI

### Hooks
- **usePaymentModal**: Payment modal state management
- **useGoatPayments**: GoatPayments integration logic

## 🔧 Usage

### Basic Usage
```typescript
import { CoinCalculator, CoinPackages, PaymentModal } from '@/app/(account)/buy-coins';

// Use components
<CoinCalculator />
<CoinPackages />
<PaymentModal isOpen={isOpen} onClose={onClose} selectedPackage={package} />
```

### Custom Hook Usage
```typescript
import { useGoatPayments } from '@/app/(account)/buy-coins';

const { processCardPayment, processApplePay, processGooglePay, isLoading, error } = useGoatPayments();

// Process payment
await processCardPayment({
    totalGC: 1000,
    bonusGC: 100,
    price: "$10.00",
    amount: 10
});
```

## 📋 Types

### Core Types
```typescript
interface CoinPackage {
    totalGC: number;
    bonusGC?: number;
    tag?: string;
    price: string;
    amount: number;
    productId?: string;
}

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error';
```

## 🔄 Payment Flow

1. **Package Selection**: User selects predefined package or calculates custom amount
2. **Payment Method**: User chooses payment method (GoatPayments, Plisio, etc.)
3. **Processing**: Payment is processed through appropriate service
4. **Result**: Success redirect to `/buy-coins/success` or failure to `/buy-coins/failed`

## 🛡️ Error Handling

- **Availability Checks**: Apple Pay/Google Pay device compatibility
- **Modal Conflicts**: Proper modal management to prevent UI conflicts
- **Loading States**: Clear loading indicators during processing
- **Error Redirects**: Automatic redirect to failure page with error details

## 🎨 Design System

- **NeonBox**: Consistent styling with glow effects
- **NeonIcon**: Icon system with glow support
- **NeonText**: Typography with neon effects
- **Responsive**: Mobile-first design with breakpoint support

## 🔐 Security

- **Token Handling**: Secure payment token processing
- **PCI Compliance**: Uses GoatPayments' PCI-compliant infrastructure
- **No Card Storage**: Cards never stored on servers
- **SSL Encryption**: All communications encrypted

## 📱 Mobile Support

- **Apple Pay**: iOS Safari support with availability checks
- **Google Pay**: Android Chrome support with Payment Request API
- **Responsive UI**: Mobile-optimized payment flows
- **Touch Friendly**: Large touch targets and gestures

## 🧪 Testing

Each layer is designed for easy testing:
- **Services**: Pure functions with dependency injection
- **Hooks**: Isolated state management
- **Components**: Props-based with clear interfaces
- **Types**: TypeScript ensures type safety

## 🚀 Performance

- **Lazy Loading**: Components loaded on demand
- **Memoization**: useCallback for expensive operations
- **Singleton Services**: Shared service instances
- **Event Cleanup**: Proper event listener management

## 📚 Best Practices

- **Type Safety**: Comprehensive TypeScript coverage
- **Separation of Concerns**: Clear layer boundaries
- **Reusability**: Shared types and components
- **Maintainability**: Well-documented and structured code
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA labels and keyboard navigation
