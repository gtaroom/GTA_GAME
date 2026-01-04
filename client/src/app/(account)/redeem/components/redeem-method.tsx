'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth-context';
import { useVip } from '@/contexts/vip-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useKYCVerification } from '@/hooks/useKYCVerification';
import { getGames } from '@/lib/api/games';
import { createWithdrawal } from '@/lib/api/wallet';
import { cn } from '@/lib/utils';
import type { Game } from '@/types/game.types';
import type { WithdrawalResponse } from '@/types/wallet.types';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SecBox } from './sec-box';

type GameType = 'signature' | 'exclusive';
type PaymentGateway = 'card_transfer' | 'bank_ach';

export default function RedeemMethod() {
    const { user, refetchUser } = useAuth();
    const { vipStatus } = useVip();
    const { redirectToKYC } = useKYCVerification();
    const { sm, xl, lg } = useBreakPoint();
    const ELEMENT_SIZE = xl ? 'lg' : sm ? 'md' : 'sm';

    // State management
    const [gameType, setGameType] = useState<GameType>('exclusive');
    const [paymentGateway, setPaymentGateway] = useState<PaymentGateway | null>(
        null
    );
    const [exclusiveGames, setExclusiveGames] = useState<Game[]>([]);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [gameUsername, setGameUsername] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetchingGames, setFetchingGames] = useState(false);
    const [gameDropdownOpen, setGameDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch exclusive games when gameType is 'exclusive'
    useEffect(() => {
        if (gameType === 'exclusive') {
            setFetchingGames(true);
            getGames({ types: ['exclusive'], limit: 100 })
                .then(response => {
                    if (response.success) {
                        setExclusiveGames(response.data.games);
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch exclusive games:', error);
                    setError('Failed to load exclusive games');
                })
                .finally(() => setFetchingGames(false));
        }
    }, [gameType]);

    // Validation
    const amountNum = parseFloat(amount);
    const maxRedemptionLimit = vipStatus?.perks?.scRedemptionLimit || 500; // Fallback to 500 if VIP data not loaded
    const isAmountValid =
        !isNaN(amountNum) && amountNum >= 50 && amountNum <= maxRedemptionLimit;

    // Only check insufficient balance for signature games (exclusive games are third-party)
    const hasInsufficientBalance =
        gameType === 'signature' && amountNum > (user?.sweepCoins || 0);

    const canSubmit =
        paymentGateway !== null &&
        isAmountValid &&
        !hasInsufficientBalance &&
        (gameType === 'signature' ||
            (gameType === 'exclusive' && selectedGame && gameUsername));

    // Handle submission
    const handleSubmit = async () => {
        if (!canSubmit) return;

        // Check KYC verification first
        if (!user?.isKYC) {
            // Redirect to KYC verification with current page as return URL
            const currentUrl =
                window.location.pathname + window.location.search;
            redirectToKYC({
                redirectUrl: currentUrl,
                showToast: true,
                toastMessage:
                    'KYC verification is required to redeem winnings. Redirecting to verification...',
            });
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                amount: amountNum,
                paymentGateway:
                    paymentGateway === 'card_transfer' ? 'payouts' : 'soap',
                gameName:
                    gameType === 'exclusive' ? selectedGame : 'featuredGames',
                username: gameType === 'exclusive' ? gameUsername : 'featured',
            };

            const response = (await createWithdrawal(
                payload
            )) as WithdrawalResponse;

            if (response.success) {
                setSuccess(
                    response.message ||
                        'Redemption request submitted successfully!'
                );

                // Refetch user data to update balance
                await refetchUser();

                // Reset form
                setAmount('');
                setSelectedGame('');
                setGameUsername('');
                setPaymentGateway(null);
            } else {
                setError(
                    response.message || 'Failed to submit redemption request'
                );
            }
        } catch (error) {
            console.error('Redemption error:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'An error occurred during redemption'
            );
        } finally {
            setLoading(false);
        }
    };

    interface InputSettingsProps {
        size: 'sm' | 'md' | 'lg';
        glowColor: string;
        glowSpread: number;
        backgroundColor: string;
        backgroundOpacity: number;
        borderColor: string;
    }

    const inputSettings: InputSettingsProps = {
        size: ELEMENT_SIZE,
        glowColor: 'var(--color-purple-500)',
        glowSpread: 0.5,
        backgroundColor: 'var(--color-purple-500)',
        backgroundOpacity: 0.08,
        borderColor: 'var(--color-white)',
    };

    return (
        <section className='mb-12'>
            <NeonBox
                glowColor='--color-purple-500'
                glowSpread={0.5}
                backgroundColor='--color-purple-500'
                backgroundOpacity={0.1}
                className='xxl:p-10 lg:p-8 md:p-6 p-5 rounded-lg flex flex-col items-start justify-between backdrop-blur-2xl'
            >
                {/* Game Type Selection */}
                <SecBox title='Select Game Type*'>
                    <ButtonGroup className='xl:gap-8 lg:gap-7 gap-6'>
                        {/* <Button
                            neon
                            variant='neon'
                            size={ELEMENT_SIZE}
                            glowColor='--color-cyan-500'
                            glowSpread={gameType === 'signature' ? 0.8 : 0.3}
                            backgroundColor='--color-cyan-500'
                            backgroundOpacity={gameType === 'signature' ? 0.2 : 0.05}
                            neonBoxClass='rounded-md w-full'
                            className='w-full flex-1'
                            btnInnerClass='inline-flex items-center gap-3'
                            onClick={() => {
                                setGameType('signature');
                                setSelectedGame('');
                                setGameUsername('');
                            }}
                        >
                            <NeonIcon
                                icon='mdi:signature-freehand'
                                size={lg ? 24 : 22}
                                glowColor='--color-cyan-500'
                            />
                            Signature Games
                        </Button> */}
                        <Button
                            neon
                            variant='neon'
                            size={ELEMENT_SIZE}
                            glowColor='--color-orange-500'
                            glowSpread={gameType === 'exclusive' ? 0.8 : 0.3}
                            backgroundColor='--color-orange-500'
                            backgroundOpacity={
                                gameType === 'exclusive' ? 0.2 : 0.05
                            }
                            neonBoxClass='rounded-md w-full'
                            className='w-full flex-1'
                            btnInnerClass='inline-flex items-center gap-3'
                            onClick={() => setGameType('exclusive')}
                        >
                            <NeonIcon
                                icon='mdi:star-circle'
                                size={lg ? 24 : 22}
                                glowColor='--color-orange-500'
                            />
                            Exclusive Games
                        </Button>
                    </ButtonGroup>
                </SecBox>

                {/* Payment Gateway Selection */}
                <SecBox title='Payment Method*'>
                    <ButtonGroup className='xl:gap-8 lg:gap-7 gap-6'>
                        <Button
                            neon
                            variant='neon'
                            size={ELEMENT_SIZE}
                            glowColor='--color-blue-500'
                            glowSpread={
                                paymentGateway === 'card_transfer' ? 0.8 : 0.3
                            }
                            backgroundColor='--color-blue-500'
                            backgroundOpacity={
                                paymentGateway === 'card_transfer' ? 0.2 : 0.05
                            }
                            neonBoxClass='rounded-md w-full'
                            className='w-full flex-1'
                            btnInnerClass='inline-flex items-center gap-3'
                            onClick={() => setPaymentGateway('card_transfer')}
                        >
                            <NeonIcon
                                icon='icon-park-outline:bank-card'
                                size={lg ? 24 : 22}
                                glowColor='--color-blue-500'
                            />
                            Card / Transfer
                        </Button>
                        <Button
                            neon
                            variant='neon'
                            size={ELEMENT_SIZE}
                            glowColor='--color-fuchsia-500'
                            glowSpread={
                                paymentGateway === 'bank_ach' ? 0.8 : 0.3
                            }
                            backgroundColor='--color-fuchsia-500'
                            backgroundOpacity={
                                paymentGateway === 'bank_ach' ? 0.2 : 0.05
                            }
                            neonBoxClass='rounded-md w-full'
                            className='w-full flex-1'
                            btnInnerClass='inline-flex items-center gap-3'
                            onClick={() => setPaymentGateway('bank_ach')}
                        >
                            <NeonIcon
                                icon='mingcute:bank-line'
                                size={lg ? 24 : 22}
                                glowColor='--color-fuchsia-500'
                            />
                            Direct Bank (ACH)
                        </Button>
                    </ButtonGroup>
                </SecBox>

                {/* Exclusive Game Selection (only for exclusive games) */}
                {gameType === 'exclusive' && (
                    <SecBox title='Select Game*'>
                        <Popover
                            open={gameDropdownOpen}
                            onOpenChange={setGameDropdownOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    role='combobox'
                                    aria-expanded={gameDropdownOpen}
                                    className='w-full px-6'
                                    neonBoxClass='rounded-[8px] w-full'
                                    btnInnerClass='w-full'
                                    variant='neon'
                                    neon={true}
                                    disabled={fetchingGames}
                                    {...inputSettings}
                                >
                                    <div className='flex w-full items-center justify-between'>
                                        <span
                                            className={cn(
                                                !selectedGame && 'text-white/80'
                                            )}
                                        >
                                            {fetchingGames
                                                ? 'Loading games...'
                                                : selectedGame
                                                  ? exclusiveGames.find(
                                                        g =>
                                                            g.name ===
                                                            selectedGame
                                                    )?.name
                                                  : 'Select a Game'}
                                        </span>
                                        <ChevronDownIcon
                                            size={16}
                                            className='shrink-0 text-white/60'
                                            aria-hidden='true'
                                        />
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
                                align='start'
                            >
                                <Command>
                                    <CommandInput placeholder='Search Games...' />
                                    <CommandList>
                                        <CommandEmpty>
                                            No game found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {exclusiveGames.map(game => (
                                                <CommandItem
                                                    key={game._id}
                                                    value={game.name}
                                                    onSelect={currentValue => {
                                                        setSelectedGame(
                                                            currentValue ===
                                                                selectedGame
                                                                ? ''
                                                                : currentValue
                                                        );
                                                        setGameDropdownOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    {game.name}
                                                    {selectedGame ===
                                                        game.name && (
                                                        <CheckIcon
                                                            size={16}
                                                            className='ml-auto'
                                                        />
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </SecBox>
                )}

                {/* Redeem Amount */}
                <SecBox title='Redeem Amount*'>
                    {/* REDEMPTION FEE NOTICE - ADDED */}
                    <NeonBox
                        glowColor='--color-yellow-500'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.15}
                        className='p-3 rounded-lg border border-yellow-500/30 mb-4'
                    >
                        <div className='flex items-start gap-2'>
                            <NeonIcon
                                icon='lucide:info'
                                size={16}
                                glowColor='--color-yellow-500'
                                className='mt-0.5 flex-shrink-0'
                            />
                            <div className='space-y-1'>
                                <p className='text-xs font-semibold text-yellow-400'>
                                    Redemption Fee Notice
                                </p>
                                <p className='text-xs text-yellow-200/90'>
                                    A $3.00 processing fee applies at the time of redemption.
                                </p>
                            </div>
                        </div>
                    </NeonBox>

                    <Input
                        className='mb-4'
                        type='number'
                        placeholder={`Enter amount (min 50SC, max ${maxRedemptionLimit}SC)`}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        {...inputSettings}
                    />

                    <div className='flex flex-col gap-2'>
                        <span className='inline-flex items-center gap-2 text-green-400 font-bold text-base'>
                            Available Balance:{' '}
                            <Image
                                src='/coins/sweep-coin.svg'
                                height={20}
                                width={20}
                                alt='SC Icon'
                            />{' '}
                            {(user?.sweepCoins || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{' '}
                            SC
                        </span>

                        {/* Live Calculation - Show when amount is valid - ADDED */}
                        {amount && isAmountValid && !hasInsufficientBalance && (
                            <NeonBox
                                glowColor='--color-green-500'
                                backgroundColor='--color-green-500'
                                backgroundOpacity={0.1}
                                className='p-3 rounded-lg border border-green-500/20 mt-2'
                            >
                                <div className='space-y-1.5 text-xs'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-gray-400'>
                                            Redemption Amount:
                                        </span>
                                        <span className='font-semibold text-green-300'>
                                            ${amountNum.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-gray-400'>
                                            Processing Fee:
                                        </span>
                                        <span className='font-semibold text-yellow-400'>
                                            -$3.00
                                        </span>
                                    </div>
                                    <div className='h-px bg-green-500/30 my-1'></div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-gray-300 font-semibold'>
                                            You'll Receive:
                                        </span>
                                        <span className='font-bold text-green-400 text-sm'>
                                            ${(amountNum - 3).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </NeonBox>
                        )}

                        {/* Validation Messages */}
                        {amount && !isAmountValid && (
                            <NeonText className='text-red-400 text-sm'>
                                {amountNum < 50
                                    ? 'Minimum redemption amount is 50 SC'
                                    : `Maximum redemption amount is ${maxRedemptionLimit} SC (based on your VIP tier)`}
                            </NeonText>
                        )}
                        {amount && isAmountValid && hasInsufficientBalance && (
                            <NeonText className='text-red-400 text-sm'>
                                Insufficient balance
                            </NeonText>
                        )}

                        {/* VIP Tier Info */}
                        {vipStatus && (
                            <NeonText className='text-blue-400 text-xs mt-2'>
                                Your {vipStatus.tierName} tier allows up to{' '}
                                {maxRedemptionLimit} SC redemption per day
                            </NeonText>
                        )}
                    </div>
                </SecBox>

                {/* Game Username (only for exclusive games) */}
                {gameType === 'exclusive' && (
                    <SecBox title='Game Username*'>
                        <Input
                            className='sm:mb-4 xs:mb-2 mb-1'
                            type='text'
                            placeholder='Enter your game username'
                            value={gameUsername}
                            onChange={e => setGameUsername(e.target.value)}
                            {...inputSettings}
                        />
                    </SecBox>
                )}

                {/* Submit Button */}
                <Button
                    variant='secondary'
                    size={ELEMENT_SIZE}
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className='disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {loading ? 'Processing...' : 'Submit Request'}
                </Button>

                {/* Success Message */}
                {success && (
                    <div className='w-full mt-2 mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg'>
                        <NeonText className='text-green-400 text-sm font-bold'>
                            {success}
                        </NeonText>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className='w-full mt-2 mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg'>
                        <NeonText className='text-red-400 text-sm font-bold'>
                            {error}
                        </NeonText>
                    </div>
                )}
            </NeonBox>
        </section>
    );
}
