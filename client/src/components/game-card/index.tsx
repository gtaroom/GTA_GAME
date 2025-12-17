'use client';
import NeonBox from '@/components/neon/neon-box';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GameDataProps } from '@/types/global.type';
import type { NeonBoxPublicProps } from '@/types/neon.types';
import { NEON_BOX_DEFAULTS } from '@/types/neon.types';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameCardModalFlow } from '../game-card-modal-flow';
import { useWalletBalance } from '@/contexts/wallet-balance-context';

interface GameCardProps extends NeonBoxPublicProps {
    game: GameDataProps;
    className?: string;
    showBadge?: boolean;
    animation?: boolean;
    playable?: boolean;
}

const GameCard: React.FC<GameCardProps> = React.memo(
    ({
        game,
        className,
        showBadge = true,
        animation = false,
        playable = true,
        glowColor = `--color-${game.color}-500`,
        intensity = NEON_BOX_DEFAULTS.intensity,
        glowLayers = NEON_BOX_DEFAULTS.glowLayers,
        glowSpread = NEON_BOX_DEFAULTS.glowSpread,
        borderColor = NEON_BOX_DEFAULTS.borderColor,
        borderWidth = NEON_BOX_DEFAULTS.borderWidth,
        insetGlow = NEON_BOX_DEFAULTS.insetGlow,
        backgroundColor = NEON_BOX_DEFAULTS.backgroundColor,
        backgroundOpacity = NEON_BOX_DEFAULTS.backgroundOpacity,
        ...neonProps
    }) => {
        const {
            title = 'Game Card',
            thumbnail = '/game-thumbnails/1.jpg',
            badge,
        } = game;

        const wrapperClasses = cn(
            'relative aspect-[1/1.1] w-full overflow-hidden rounded-[10px]',
            animation && 'scale-effect',
            className
        );

        const router = useRouter();
        const [modalOpen, setModalOpen] = useState(false);
        const { balance: userBalance, loading: balanceLoading } = useWalletBalance();

        // Determine game type from types array (from API) or fallback to type field
        const gameTypes = (game as any).types || [game.type || 'exclusive'];
        const isIframeGame = gameTypes.includes('bonus') || gameTypes.includes('signature');
        const isExclusiveGame = gameTypes.includes('exclusive') || (!isIframeGame && gameTypes.length === 0);
        const isSignatureGame = gameTypes.includes('signature');

        // Balance validation constants
        const MIN_SIGNATURE_BALANCE = 10; // 10 GC minimum for signature games
        const hasEnoughBalanceForSignature = userBalance > MIN_SIGNATURE_BALANCE;

        // Handle game click
        const handleGameClick = () => {
            if (isIframeGame) {
                // Check balance for signature games
                if (isSignatureGame && !hasEnoughBalanceForSignature) {
                    // Show insufficient balance message and redirect to buy coins
                    alert(`Insufficient balance! You need to add coins to play signature games. You currently have ${userBalance} GC.`);
                    router.push('/buy-coins');
                    return;
                }
                
                // Navigate to dedicated game page for bonus/signature games
                router.push(`/play/${game._id}`);
            } else {
                // Show account modal for exclusive games
                setModalOpen(true);
            }
        };

        const CardContent = (
            <NeonBox
                className={wrapperClasses}
                glowColor={glowColor}
                intensity={intensity}
                glowLayers={glowLayers}
                glowSpread={glowSpread}
                borderColor={borderColor}
                borderWidth={borderWidth}
                insetGlow={insetGlow}
                backgroundColor={backgroundColor}
                backgroundOpacity={backgroundOpacity}
                {...neonProps}
            >
                {showBadge && badge && (
                    <Badge className='absolute top-3 left-3' variant={badge} />
                )}
                <Image
                    src={thumbnail}
                    alt={title}
                    width={500}
                    height={500}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 12vw"
                    className='h-full w-full object-cover object-center'
                    priority={animation}
                />
            </NeonBox>
        );

        if (playable) {
            return (
                <>
                    <button
                        type='button'
                        className='w-full'
                        onClick={handleGameClick}
                    >
                        {CardContent}
                    </button>
                    
                    {/* Show account flow modal for exclusive games only */}
                    {isExclusiveGame && (
                        <GameCardModalFlow
                            open={modalOpen}
                            onOpenChange={setModalOpen}
                            game={{
                                _id: game._id || '',
                                name: game.name || game.title,
                                link: game.link || '',
                                types: game.types || [],
                                thumbnail: game.thumbnail,
                                description: game.description || game.provider,
                            }}
                        />
                    )}
                </>
            );
        }

        return <div>{CardContent}</div>;
    }
);

export default GameCard;
