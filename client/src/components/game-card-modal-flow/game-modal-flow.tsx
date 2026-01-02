'use client';
import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useEffect, useState } from 'react';
import { useBreakPoint } from '../../hooks/useBreakpoint';
import { useGameAccount } from '../../hooks/useGameAccount';
import type { GameModalFlowProps } from '../../types/game-account.types';
import NeonIcon from '../neon/neon-icon';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import AccountSelectionStep from './account-selection-step';
import CreateAccountStep from './create-account-step';
import GamePlayStep from './game-play-modal';
import StoreAccountStep from './store-account-step';

export default function GameCardModalFlow({
    open,
    onOpenChange,
    game,
}: GameModalFlowProps) {
    const [step, setStep] = useState(0);
    const [internalOpen, setInternalOpen] = useState(open);
    const { lg } = useBreakPoint();
    const { refresh: refreshWalletBalance } = useWalletBalance();

    // NEW: State for pending credentials when user wants to save from GamePlayStep
    const [pendingCredentials, setPendingCredentials] = useState<{
        username: string;
        password: string;
    } | null>(null);

    const {
        accountStatus,
        accountDetails,
        isLoading,
        error,
        checkAccountStatus,
        getAccountDetails,
        storeExistingAccount,
        requestNewAccount,
        clearError,
    } = useGameAccount();

    useEffect(() => {
        setInternalOpen(open);
    }, [open]);

    useEffect(() => {
        if (!internalOpen) {
            const timeout = setTimeout(() => {
                setStep(0);
                setPendingCredentials(null); // Clear pending credentials on close
                clearError();
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [internalOpen, clearError]);

    // Check account status when game changes
    useEffect(() => {
        if (game && internalOpen) {
            checkAccountStatus(game._id);
        }
    }, [game, internalOpen, checkAccountStatus]);

    // Get account details if user has an account and credentials are stored
    useEffect(() => {
        if (
            accountStatus?.hasAccount &&
            accountStatus?.isCredentialsStored &&
            game
        ) {
            getAccountDetails(game._id);
        }
    }, [
        accountStatus?.hasAccount,
        accountStatus?.isCredentialsStored,
        game,
        getAccountDetails,
    ]);

    const handleOpenChange = (val: boolean) => {
        setInternalOpen(val);
        onOpenChange?.(val);
    };

    const handleStoreExistingAccount = async (formData: {
        username: string;
        password: string;
        storeCredentials: boolean;
    }) => {
        if (!game) return;

        await storeExistingAccount({
            gameId: game._id,
            username: formData.username,
            password: formData.password,
            storeCredentials: formData.storeCredentials,
        });

        // After successful save, clear pending credentials and refresh account status
        setPendingCredentials(null);
        await checkAccountStatus(game._id);
        setStep(3); // Go back to GamePlayStep
    };

    const handleRequestNewAccount = async (amount?: number) => {
        if (!game) return;

        await requestNewAccount({
            gameId: game._id,
            amount: amount,
        });

        await refreshWalletBalance();
    };

    // NEW: Handle when user wants to save credentials from GamePlayStep
    const handleTriggerSaveCredentials = (
        username: string,
        password: string
    ) => {
        setPendingCredentials({ username, password });
        setStep(1); // Go to StoreAccountStep
    };

    // Determine the appropriate step based on account status
    useEffect(() => {
        if (!accountStatus) return;

        // If user has an account with stored credentials, go directly to game play
        if (accountStatus.hasAccount && accountStatus.isCredentialsStored) {
            setStep(3);
            return;
        }

        // If user has an account but no stored credentials, show game play with editable fields
        if (accountStatus.hasAccount && !accountStatus.isCredentialsStored) {
            setStep(3);
            return;
        }

        // If user has a pending request, show the create account step with process info
        if (accountStatus.hasPendingRequest) {
            setStep(2);
            return;
        }

        // If no account and no pending request, show account selection
        if (!accountStatus.hasAccount && !accountStatus.hasExistingAccount) {
            setStep(0);
            return;
        }
    }, [accountStatus]);

    if (!game) {
        return null;
    }

    const { xs } = useBreakPoint();

    return (
        <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                showScrollBar={true}
                showCloseButton={isLoading ? false : true}
            >
                <DialogTitle className='sr-only'>
                    Game Account Management
                </DialogTitle>

                {isLoading ? (
                    <NeonIcon
                        icon='svg-spinners:bars-rotate-fade'
                        glowColor='--color-orange-500'
                        size={40}
                        className='mb-4'
                    />
                ) : (
                    <>
                        {/* Show Account Selection Step only when no account exists */}
                        {step === 0 &&
                            !accountStatus?.hasAccount &&
                            !accountStatus?.hasExistingAccount && (
                                <AccountSelectionStep
                                    game={game}
                                    onSelect={selectedStep => {
                                        if (selectedStep === 1) {
                                            // User clicked "I have an account"
                                            // Go directly to GamePlayStep with empty editable fields
                                            setStep(3);
                                        } else {
                                            // Other selections (create new account, etc.)
                                            setStep(selectedStep);
                                        }
                                    }}
                                    accountStatus={accountStatus}
                                />
                            )}

                        {/* Show Store Account Step ONLY when triggered from GamePlayStep */}
                        {step === 1 && pendingCredentials && (
                            <StoreAccountStep
                                game={game}
                                onBack={() => {
                                    setPendingCredentials(null);
                                    setStep(3); // Go back to GamePlayStep
                                }}
                                onSuccess={() => {
                                    setPendingCredentials(null);
                                    setStep(3); // Stay on GamePlayStep after saving
                                }}
                                onSubmit={handleStoreExistingAccount}
                                isLoading={isLoading}
                                error={error}
                                // Pre-fill the form with pending credentials
                                initialData={{
                                    username: pendingCredentials.username,
                                    password: pendingCredentials.password,
                                    storeCredentials: true, // Default to checked since they want to save
                                }}
                            />
                        )}

                        {/* Show Create Account Step when user selects "I need a new account" or has pending request */}
                        {step === 2 && (
                            <CreateAccountStep
                                game={game}
                                onBack={() => setStep(0)}
                                onSuccess={() => setStep(3)}
                                onRequestAccount={handleRequestNewAccount}
                                isLoading={isLoading}
                                error={error}
                                hasPendingRequest={
                                    accountStatus?.hasPendingRequest || false
                                }
                                requestStatus={accountStatus?.status}
                                rejectionReason={accountStatus?.rejectionReason}
                            />
                        )}

                        {/* Show Game Play Step */}
                        {step === 3 && (
                            <GamePlayStep
                                game={game}
                                accountDetails={accountDetails || undefined}
                                hasStoredCredentials={
                                    accountStatus?.isCredentialsStored || false
                                }
                                onTriggerSaveCredentials={
                                    handleTriggerSaveCredentials
                                }
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
