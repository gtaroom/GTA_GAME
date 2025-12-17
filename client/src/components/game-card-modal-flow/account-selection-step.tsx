import { useWalletBalance } from '@/contexts/wallet-balance-context';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { Link } from 'next-transition-router';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type {
    GameAccountStatusResponse,
    GameModalStepProps,
} from '../../types/game-account.types';
import NeonIcon from '../neon/neon-icon';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';
import GameModalTitle from './game-modal-title';

interface AccountSelectionStepProps extends GameModalStepProps {
    accountStatus?: GameAccountStatusResponse['data'] | null;
}

export default function AccountSelectionStep({
    game,
    onSelect,
    accountStatus,
}: AccountSelectionStepProps) {
    const { balance: userBalance, loading: balanceLoading } =
        useWalletBalance();
    const { xs } = useBreakPoint();
    const router = useRouter();

    // Balance validation constants
    const MIN_BALANCE_REQUIRED = 500;
    const hasEnoughBalance = userBalance >= MIN_BALANCE_REQUIRED;

    // If user already has an account, show different message
    const hasAccount = accountStatus?.hasAccount;
    const hasPendingRequest = accountStatus?.hasPendingRequest;

    const accountOptions = [
        {
            icon: 'lucide:lock',
            title: 'I have an account',
            value: 1,
            color: '--color-sky-500',
            disabled: false, // Always available
        },
        {
            icon: 'lucide:user-plus',
            title: 'Create an account',
            value: 2,
            color: '--color-pink-500',
            disabled: false, // CHANGED: Allow everyone to proceed
        },
    ];

    return (
        <div className='max-w-[400px] px-2 mx-auto'>
            <GameModalTitle
                title={game.name}
                description={
                    hasAccount
                        ? `Welcome back! You already have an account for ${game.name}.`
                        : `To play ${game.name}, you need to store or create a game account.`
                }
            />
            <div className='flex flex-col text-center items-center w-full'>
                <NeonText
                    as='span'
                    glowColor='--color-blue-500'
                    className='text-base font-bold mb-5 uppercase'
                >
                    {hasAccount
                        ? 'Your account is ready!'
                        : 'Choose one of the options below'}
                </NeonText>

                {hasAccount ? (
                    <div className='mb-6'>
                        <NeonText
                            glowColor='--color-green-500'
                            className='text-lg font-bold text-green-400 mb-4'
                        >
                            ✅ Account Ready
                        </NeonText>
                        {accountStatus?.accountDetails && (
                            <div className='text-sm opacity-80 mb-4'>
                                Username:{' '}
                                <span className='font-semibold'>
                                    {accountStatus.accountDetails.username}
                                </span>
                            </div>
                        )}
                        <Button
                            neon
                            variant='neon'
                            size='lg'
                            onClick={() => onSelect?.(3)} // Go directly to game play
                            glowColor='--color-green-500'
                            backgroundColor='--color-green-500'
                            backgroundOpacity={0.2}
                            glowSpread={0.6}
                            className='w-full'
                        >
                            Start Playing
                        </Button>
                    </div>
                ) : hasPendingRequest ? (
                    <div className='mb-6'>
                        <NeonIcon
                            icon='svg-spinners:bars-rotate-fade'
                            glowColor='--color-orange-500'
                            size={40}
                            className='mb-4'
                        />
                        <NeonText
                            glowColor='--color-orange-500'
                            className='text-lg font-bold text-orange-400 mb-4'
                        >
                            ⏳ Account Request Pending
                        </NeonText>
                        <p className='text-sm opacity-80 mb-4'>
                            Your account request is being processed. You'll be
                            notified when it's ready.
                        </p>
                    </div>
                ) : (
                    <div className={`mb-2 ${xs ? 'space-y-5!' : 'space-y-3!'}`}>
                        {accountOptions.map(option => (
                            <Button
                                neon
                                variant='neon'
                                key={option.value}
                                size='lg'
                                neonBoxClass='rounded-md'
                                className={`w-full btn-neon ${xs ? 'mb-4' : 'mb-2'} ${option.disabled ? (option.value === 2 ? 'cursor-not-allowed ring-2 ring-yellow-400/50' : 'opacity-50 cursor-not-allowed') : ''}`}
                                btnInnerClass='inline-flex items-center gap-3 uppercase'
                                onClick={() => {
                                    // CHANGED: Always proceed to next step, no redirection
                                    if (!option.disabled) {
                                        onSelect?.(option.value);
                                    }
                                }}
                                disabled={option.disabled && option.value !== 2}
                                glowColor={
                                    option.disabled && option.value === 2
                                        ? '--color-yellow-500'
                                        : option.color
                                }
                                backgroundColor={
                                    option.disabled && option.value === 2
                                        ? '--color-yellow-500'
                                        : option.color
                                }
                                backgroundOpacity={0.2}
                                glowSpread={0.6}
                            >
                                <NeonIcon
                                    icon={
                                        option.disabled
                                            ? 'lucide:lock'
                                            : option.icon
                                    }
                                    glowColor={option.color}
                                    size={xs ? 32 : 22}
                                />
                                <NeonText
                                    glowColor={option.color}
                                    glowSpread={0.6}
                                    className={`${xs ? 'text-base' : 'text-sm'} font-bold text-white flex items-center gap-2`}
                                >
                                    {option.disabled && option.value === 2 ? (
                                        <>
                                            <span>Need an Account</span>
                                            <Link
                                                href='/buy-coins'
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                                className='inline-flex items-center gap-1 bg-yellow-400 text-black px-2 py-[2px] rounded-md text-[0.75em] font-extrabold shadow hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400'
                                            >
                                                <NeonIcon
                                                    icon='lucide:coins'
                                                    size={14}
                                                    glowColor='--color-yellow-500'
                                                />
                                                Buy Coins
                                            </Link>
                                        </>
                                    ) : (
                                        option.title
                                    )}
                                </NeonText>
                            </Button>
                        ))}
                    </div>
                )}

                <div className='text-yellow-300 text-start mb-5 flex items-start gap-2'>
                    <Image
                        src='/sections-icon/coins.png'
                        height={40}
                        width={40}
                        alt='Coins'
                    />
                    <div className='flex-1'>
                        <NeonText
                            glowColor={
                                hasEnoughBalance
                                    ? '--color-yellow-500'
                                    : '--color-red-500'
                            }
                            glowSpread={0.2}
                            className='text-base font-bold text-white capitalize leading-[1.3]'
                        >
                            {balanceLoading
                                ? 'Loading balance...'
                                : hasEnoughBalance
                                  ? `You have ${userBalance.toLocaleString()}+ Gold Coins, so you're eligible to create a game account.`
                                  : `You need ${MIN_BALANCE_REQUIRED - userBalance} more Gold Coins to create a game account.`}
                        </NeonText>
                        {!hasEnoughBalance && (
                            <div className='mt-2'>
                                <Link
                                    href='/buy-coins'
                                    className='text-blue-400 hover:text-blue-300 underline text-sm font-semibold'
                                >
                                    Buy Gold Coins →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <span className='font-extrabold text-base'>
                    Need Help?{' '}
                    <Link href='#' className='underline'>
                        Contact Support
                    </Link>
                </span>
            </div>
        </div>
    );
}
