'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import NeonIcon from '@/components/neon/neon-icon';
import { claimBirthdayBonus, checkBonusSpins } from '@/lib/api/vip';
import { useAuth } from '@/contexts/auth-context';
import { useVip } from '@/contexts/vip-context';
import BirthdayUpdate from './birthday-update';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SpinWheelModal from '@/components/modal/spin-wheel-modal';

interface VipPerksProps {
    className?: string;
}

export default function VipPerks({ className = '' }: VipPerksProps) {
    const [isClaimingBirthday, setIsClaimingBirthday] = useState(false);
    const [isCheckingSpins, setIsCheckingSpins] = useState(false);
    const [isUsingSpin, setIsUsingSpin] = useState(false);
    const [openSpin, setOpenSpin] = useState(false);
    const [bonusSpinsInfo, setBonusSpinsInfo] = useState<{
        hasSpins: boolean;
        spinsRemaining: number;
        expiresAt?: string;
    } | null>(null);
    
    const { user, updateUserBalance } = useAuth();
    const { vipStatus, refetchVipStatus } = useVip();

    // Helper: compute 3-day birthday claim window for the current year
    const getBirthdayWindow = (birthdayIso?: string | null) => {
        if (!birthdayIso) return null;
        // Expecting YYYY-MM-DD
        const parts = birthdayIso.split('-');
        if (parts.length < 3) return null;
        const month = Number(parts[1]) - 1; // 0-based
        const day = Number(parts[2]);
        if (Number.isNaN(month) || Number.isNaN(day)) return null;
        const now = new Date();
        const year = now.getFullYear();
        const birthdayThisYear = new Date(year, month, day);
        // Start = day before; End = day after
        const start = new Date(birthdayThisYear);
        start.setDate(birthdayThisYear.getDate() - 1);
        const end = new Date(birthdayThisYear);
        end.setDate(birthdayThisYear.getDate() + 1);
        return { start, birthday: birthdayThisYear, end };
    };

    const isWithinBirthdayWindow = (() => {
        const win = getBirthdayWindow(user?.birthday as any);
        if (!win) return false;
        const now = new Date();
        return now >= win.start && now <= win.end;
    })();

    const handleClaimBirthdayBonus = async () => {
        if (!user) return;
        
        try {
            setIsClaimingBirthday(true);
            const response = await claimBirthdayBonus();
            
            if (response.success) {
                updateUserBalance(response.data.newBalance);
                alert(`🎂 You received ${response.data.bonusAmount} GC!`);
                await refetchVipStatus();
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to claim birthday bonus';
            alert(message);
        } finally {
            setIsClaimingBirthday(false);
        }
    };

    const handleCheckBonusSpins = async () => {
        try {
            setIsCheckingSpins(true);
            const response = await checkBonusSpins();
            
            if (response.success) {
                setBonusSpinsInfo({
                    hasSpins: response.data.hasSpins,
                    spinsRemaining: response.data.spinsRemaining,
                    expiresAt: response.data.expiresAt,
                });
            }
        } catch (error) {
            console.error('Failed to check bonus spins:', error);
        } finally {
            setIsCheckingSpins(false);
        }
    };

    const handleUseBonusSpin = async () => {
        if (!bonusSpinsInfo?.hasSpins) return;
        setOpenSpin(true);
    };

    if (!vipStatus) return null;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Birthday Update: show only if user has no birthday set OR cannot yet claim */}
            {(!user?.birthday) && (
                <BirthdayUpdate />
            )}
            
            {/* Current VIP Perks - Tier Style */}
            <NeonBox
                className='p-6 rounded-3xl backdrop-blur-md'
                glowColor='--color-purple-500'
                backgroundColor='--color-purple-500'
                backgroundOpacity={0.1}
            >
                <div className='text-center mb-6'>
                    <NeonText
                        as='h2'
                        className='h2-title mb-2'
                        glowColor='--color-purple-500'
                    >
                        Your Current VIP Perks
                    </NeonText>
                    <NeonText
                        as='p'
                        className='text-xl font-bold capitalize'
                        glowSpread={0.5}
                    >
                        {vipStatus.tierName} Benefits
                    </NeonText>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4 2xl:gap-6'>
                    {/* Daily Rewards - Always Available */}
                    <NeonBox
                        glowColor='--color-green-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:calendar-1'
                                glowColor='--color-green-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-green-500'
                                glowSpread={0.2}
                            >
                                Daily Rewards
                            </NeonText>
                        </div>
                        <span className='font-bold text-base capitalize leading-normal'>
                        Available
                        </span>
                    </NeonBox>

                    {/* Weekly SC Reward - Always Available */}
                    {/* <NeonBox
                        glowColor='--color-yellow-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-yellow-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:coins'
                                glowColor='--color-yellow-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-yellow-500'
                                glowSpread={0.2}
                            >
                                Weekly SC Reward
                            </NeonText>
                        </div>
                        <span className='font-bold text-base capitalize leading-normal'>
                        Available
                        </span>
                    </NeonBox> */}

                    {/* VIP Wheel */}
                    <NeonBox
                        glowColor='--color-red-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:ferris-wheel'
                                glowColor='--color-red-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-red-500'
                                glowSpread={0.2}
                            >
                                VIP Wheel
                            </NeonText>
                        </div>
                        {vipStatus.perks.drawingEntry ? (
                            <span className='font-bold text-base capitalize leading-normal'>
                                Available
                            </span>
                        ) : (
                            <NeonIcon
                                icon='lucide:lock'
                                size={22}
                                glowColor='--color-red-500'
                            />
                        )}
                    </NeonBox>

                    {/* Bonus Multiplier */}
                    <NeonBox
                        glowColor='--color-blue-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-blue-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:gamepad-2'
                                glowColor='--color-blue-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-blue-500'
                                glowSpread={0.2}
                            >
                                Bonus Multiplier
                            </NeonText>
                        </div>
                        <span className='font-bold text-base capitalize leading-normal'>
                            {vipStatus.perks.bonusMultiplier}x Bonus
                        </span>
                    </NeonBox>

                    {/* SC Redemption Limit */}
                    <NeonBox
                        glowColor='--color-purple-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:stars'
                                glowColor='--color-purple-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-purple-500'
                                glowSpread={0.2}
                            >
                                SC Redemption Limit
                            </NeonText>
                        </div>
                        <span className='font-bold text-base capitalize leading-normal'>
                            {vipStatus.perks.scRedemptionLimit} SC
                        </span>
                    </NeonBox>

                    {/* Surprise Drops */}
                    <NeonBox
                        glowColor='--color-sky-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-sky-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:gift'
                                glowColor='--color-sky-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-sky-500'
                                glowSpread={0.2}
                            >
                                Surprise Drops
                            </NeonText>
                        </div>
                        {vipStatus.perks.surpriseDrops ? (
                            <span className='font-bold text-base capitalize leading-normal'>
                                Available
                            </span>
                        ) : (
                            <NeonIcon
                                icon='lucide:lock'
                                size={22}
                                glowColor='--color-sky-500'
                            />
                        )}
                    </NeonBox>

                    {/* Birthday Gift */}
                    <NeonBox
                        glowColor='--color-fuchsia-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-fuchsia-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:cake'
                                glowColor='--color-fuchsia-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-fuchsia-500'
                                glowSpread={0.2}
                            >
                                Birthday Gift
                            </NeonText>
                        </div>
                        {vipStatus.perks.birthdayBonus > 0 ? (
                            <span className='font-bold text-base capitalize leading-normal'>
                                {vipStatus.perks.birthdayBonus} GC
                            </span>
                        ) : (
                            <NeonIcon
                                icon='lucide:lock'
                                size={22}
                                glowColor='--color-fuchsia-500'
                            />
                        )}
                    </NeonBox>

                    {/* VIP Manager */}
                    <NeonBox
                        glowColor='--color-lime-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-lime-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:tool-case'
                                glowColor='--color-lime-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-lime-500'
                                glowSpread={0.2}
                            >
                                VIP Manager
                            </NeonText>
                        </div>
                        {(vipStatus.tier === 'platinum' || vipStatus.tier === 'onyx' || vipStatus.tier === 'sapphire' || vipStatus.tier === 'ruby' || vipStatus.tier === 'emerald') ? (
                            <span className='font-bold text-base capitalize leading-normal'>
                                Available
                            </span>
                        ) : (
                            <NeonIcon
                                icon='lucide:lock'
                                size={22}
                                glowColor='--color-lime-500'
                            />
                        )}
                    </NeonBox>

                    {/* Bonus Spins */}
                    <NeonBox
                        glowColor='--color-orange-500'
                        glowSpread={0.4}
                        className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                        backgroundColor='--color-orange-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='inline-flex gap-3 items-center'>
                            <NeonIcon
                                icon='lucide:zap'
                                glowColor='--color-orange-500'
                            />
                            <NeonText
                                as='span'
                                className='font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]'
                                glowColor='--color-orange-500'
                                glowSpread={0.2}
                            >
                                Bonus Spins
                            </NeonText>
                        </div>
                        {vipStatus.perks.bonusSpins > 0 ? (
                            <span className='font-bold text-base capitalize leading-normal'>
                                {vipStatus.perks.bonusSpins} Spins
                            </span>
                        ) : (
                            <NeonIcon
                                icon='lucide:lock'
                                size={22}
                                glowColor='--color-orange-500'
                            />
                        )}
                    </NeonBox>
                </div>
            </NeonBox>

            {/* Interactive Features */}
            <div className='space-y-4'>
                {/* Birthday Bonus */}
                {vipStatus.perks.birthdayBonus > 0 && user?.birthday && (
                    <NeonBox
                        className='p-4 rounded-xl'
                        glowColor='--color-fuchsia-500'
                        backgroundColor='--color-fuchsia-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <NeonIcon
                                    icon='lucide:cake'
                                    glowColor='--color-fuchsia-500'
                                />
                                <div>
                                    <NeonText
                                        as='h3'
                                        className='text-lg font-bold'
                                        glowColor='--color-fuchsia-500'
                                    >
                                        Birthday Bonus
                                    </NeonText>
                                    <p className='text-sm text-gray-300'>
                                        {vipStatus.perks.birthdayBonus} GC available
                                    </p>
                                    {/* Instructions */}
                                    {vipStatus.birthdayBonusClaimed && (
                                        <p className='text-xs text-green-400 mt-1'>
                                            You have already claimed this year's birthday bonus.
                                        </p>
                                    )}
                                    {!vipStatus.birthdayBonusClaimed && !isWithinBirthdayWindow && (
                                        <p className='text-xs text-amber-300 mt-1'>
                                            You can claim only during your 3-day window: the day before, your birthday, and the day after.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                onClick={handleClaimBirthdayBonus}
                                disabled={isClaimingBirthday || !!vipStatus.birthdayBonusClaimed || !isWithinBirthdayWindow}
                                size='sm'
                            >
                                {isClaimingBirthday
                                    ? 'Claiming...'
                                    : vipStatus.birthdayBonusClaimed
                                        ? 'Claimed'
                                        : isWithinBirthdayWindow
                                            ? 'Claim'
                                            : 'Unavailable Now'}
                            </Button>
                        </div>
                        {/* More detailed instructions */}
                        <div className='mt-2 text-xs text-gray-300'>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>Claim period: day before, your birthday, and day after (local time).</li>
                                <li>One claim per year. Once claimed, this section will disappear.</li>
                                <li>Make sure your birthday is set correctly in your profile.</li>
                            </ul>
                        </div>
                    </NeonBox>
                )}

                {/* Bonus Spins */}
                {vipStatus.perks.bonusSpins > 0 && (
                    <NeonBox
                        className='p-4 rounded-xl'
                        glowColor='--color-green-500'
                        backgroundColor='--color-green-500'
                        backgroundOpacity={0.1}
                    >
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <NeonIcon
                                        icon='lucide:calendar-1'
                                        glowColor='--color-green-500'
                                    />
                                    <div>
                                        <NeonText
                                            as='h3'
                                            className='text-lg font-bold'
                                            glowColor='--color-green-500'
                                        >
                                            Bonus Spins
                                        </NeonText>
                                        <p className='text-sm text-gray-300'>
                                            {vipStatus.bonusSpinsRemaining} spins remaining
                                        </p>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button
                                        onClick={handleCheckBonusSpins}
                                        disabled={isCheckingSpins}
                                        size='sm'
                                        variant='secondary'
                                    >
                                        {isCheckingSpins ? 'Checking...' : 'Check'}
                                    </Button>
                                    {bonusSpinsInfo?.hasSpins && (
                                        <Button
                                            onClick={handleUseBonusSpin}
                                            disabled={isUsingSpin}
                                            size='sm'
                                        >
                                            {isUsingSpin ? 'Using...' : 'Use Spin'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {bonusSpinsInfo && (
                                <div className='text-sm text-gray-300'>
                                    {bonusSpinsInfo.hasSpins ? (
                                        <p>
                                            {bonusSpinsInfo.spinsRemaining} spins available
                                            {bonusSpinsInfo.expiresAt && (
                                                <span> (expires {new Date(bonusSpinsInfo.expiresAt).toLocaleDateString()})</span>
                                            )}
                                        </p>
                                    ) : (
                                        <p>No bonus spins available</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </NeonBox>
                )}

                <Dialog open={openSpin} onOpenChange={setOpenSpin}>
                    <DialogContent showScrollBar={false} className='sm:max-w-fit' neonBoxClass='p-0!'>
                        <SpinWheelModal onSpinsUpdate={(spins) => {
                            setBonusSpinsInfo(prev => prev ? { ...prev, spinsRemaining: spins, hasSpins: spins > 0 } : prev);
                            refetchVipStatus();
                        }} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
