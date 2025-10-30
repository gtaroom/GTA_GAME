'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { useBreakPoint } from '../../hooks/useBreakpoint';
import { cn } from '../../lib/utils';
import AccountSelectionStep from './account-selection-step';
import CreateAccountStep from './create-account-step';
import GamePlayStep from './game-play-modal';
import StoreAccountStep from './store-account-step';
import { useGameAccount } from '../../hooks/useGameAccount';
import type { GameModalFlowProps, Game } from '../../types/game-account.types';
import NeonIcon from '../neon/neon-icon';
import { useWalletBalance } from '@/contexts/wallet-balance-context';

export default function GameCardModalFlow({
    open,
    onOpenChange,
    game,
}: GameModalFlowProps) {
    const [step, setStep] = useState(0);
    const [internalOpen, setInternalOpen] = useState(open);
    const { lg } = useBreakPoint();
    const { refresh: refreshWalletBalance } = useWalletBalance();
    

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
        if (accountStatus?.hasAccount && accountStatus?.isCredentialsStored && game) {
            getAccountDetails(game._id);
        }
    }, [accountStatus?.hasAccount, accountStatus?.isCredentialsStored, game, getAccountDetails]);

    const handleOpenChange = (val: boolean) => {
        setInternalOpen(val);
        onOpenChange?.(val);
    };

    const handleStoreExistingAccount = async (formData: { username: string; password: string; storeCredentials: boolean }) => {
        if (!game) return;
        
        await storeExistingAccount({
            gameId: game._id,
            username: formData.username,
            password: formData.password,
            storeCredentials: formData.storeCredentials,
        });
    };

    const handleRequestNewAccount = async (amount?: number) => {
        if (!game) return;
        
        await requestNewAccount({
            gameId: game._id,
            amount: amount, // Pass the recharge amount if provided
        });

        await refreshWalletBalance();
    };

    // Determine the appropriate step based on account status
    useEffect(() => {
        if (!accountStatus) return;

        // If user has an account, go directly to game play
        if (accountStatus.hasAccount) {
            setStep(3); // Game play step
            return;
        }

        // If user has a pending request, show the create account step with process info
        if (accountStatus.hasPendingRequest) {
            setStep(2); // Create account step (showing process info)
            return;
        }

        // If no account and no pending request, show account selection
        if (!accountStatus.hasAccount && !accountStatus.hasExistingAccount) {
            setStep(0); // Account selection step
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
                <DialogTitle className='sr-only'>Game Account Management</DialogTitle>
 
 {isLoading ?
  <NeonIcon
                            icon='svg-spinners:bars-rotate-fade'
                            glowColor='--color-orange-500'
                            size={40}
                            className='mb-4'
                        /> : <>


                {/* Show Account Selection Step only when no account exists */}
                {step === 0 && !accountStatus?.hasAccount && !accountStatus?.hasExistingAccount && (
                    <AccountSelectionStep 
                        game={game}
                        onSelect={setStep}
                        accountStatus={accountStatus}
                    />
                )}
                
                {/* Show Store Account Step when user selects "I have an account" */}
                {step === 1 && (
                    <StoreAccountStep
                        game={game}
                        onBack={() => setStep(0)}
                        onSuccess={() => setStep(3)}
                        onSubmit={handleStoreExistingAccount}
                        isLoading={isLoading}
                        error={error}
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
                        hasPendingRequest={accountStatus?.hasPendingRequest || false}
                    />
                )}
                
                {/* Show Game Play Step when user has an account */}
                {step === 3 && accountStatus?.hasAccount && (
                    <GamePlayStep 
                        game={game}
                        accountDetails={accountDetails || undefined}
                    />
                )}
                </>
            }
            </DialogContent>

          
        </Dialog>
    );
}