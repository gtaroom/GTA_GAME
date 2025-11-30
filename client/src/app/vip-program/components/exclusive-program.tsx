'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVip } from '@/contexts/vip-context';
import { getTierImage, getTierColor } from '@/lib/vip-utils';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';

export default function ExclusiveProgram() {
    const [activeTab, setActiveTab] = useState('tab-1');
    const { vipTiers, vipStatus, isLoading } = useVip();

    // Map API tier data to display format
    const exclusiveProgram = useMemo(() => {
        if (!vipTiers) return [];
        
        return vipTiers.map((tier) => {
            const features = [
                {
                    label: 'Daily Rewards',
                    icon: 'lucide:calendar-1',
                    rightSec: 'Available',
                    isLock: false,
                    color: '--color-green-500',
                },
                // {
                //     label: 'Weekly SC Reward',
                //     icon: 'lucide:coins',
                //     rightSec: 'Available',
                //     isLock: false,
                //     color: '--color-yellow-500',
                // },
                {
                    label: 'VIP Wheel',
                    icon: 'lucide:ferris-wheel',
                    rightSec: tier.drawingEntry ? 'Available' : 'Locked',
                    isLock: !tier.drawingEntry,
                    color: '--color-red-500',
                },
                {
                    label: 'Bonus Multiplier',
                    icon: 'lucide:gamepad-2',
                    rightSec: tier.bonusMultiplier > 1 ? `${tier.bonusMultiplier}x Bonus` : 'No Bonus',
                    isLock: tier.bonusMultiplier <= 1,
                    color: '--color-blue-500',
                },
                {
                    label: 'SC Redemption Limit',
                    icon: 'lucide:stars',
                    rightSec: `$${tier.scRedemptionLimit}`,
                    isLock: false,
                    color: '--color-purple-500',
                },
                {
                    label: 'Surprise Drops',
                    icon: 'lucide:gift',
                    rightSec: tier.surpriseDrops ? 'Available' : 'Locked',
                    isLock: !tier.surpriseDrops,
                    color: '--color-sky-500',
                },
                {
                    label: 'Birthday Gift',
                    icon: 'lucide:cake',
                    rightSec: tier.birthdayBonus > 0 ? `${tier.birthdayBonus} GC` : 'No Gift',
                    isLock: tier.birthdayBonus === 0,
                    color: '--color-fuchsia-500',
                },
                {
                    label: 'VIP Manager',
                    icon: 'lucide:tool-case',
                    rightSec: tier.tier === 'platinum' || tier.tier === 'onyx' || tier.tier === 'sapphire' || tier.tier === 'ruby' || tier.tier === 'emerald' ? 'Available' : 'Locked',
                    isLock: !(tier.tier === 'platinum' || tier.tier === 'onyx' || tier.tier === 'sapphire' || tier.tier === 'ruby' || tier.tier === 'emerald'),
                    color: '--color-lime-500',
                },
                {
                    label: 'Bonus Spins',
                    icon: 'lucide:zap',
                    rightSec: tier.bonusSpins > 0 ? `${tier.bonusSpins} Spins` : 'No Spins',
                    isLock: tier.bonusSpins === 0,
                    color: '--color-orange-500',
                },
            ];

            return {
                tier: tier.name.replace(' Tier', ''), // Remove "Tier" suffix for display
                image: getTierImage(tier.tier),
                color: getTierColor(tier.tier),
                features,
            };
        });
    }, [vipTiers]);

    // Set active tab based on current VIP status
    const currentTierIndex = useMemo(() => {
        if (!vipStatus || !exclusiveProgram.length) return 0;
        const index = exclusiveProgram.findIndex(program => 
            program.tier.toLowerCase() === vipStatus.tier.toLowerCase()
        );
        return index >= 0 ? index : 0;
    }, [vipStatus, exclusiveProgram]);

    // Update active tab when VIP status changes
    useEffect(() => {
        if (exclusiveProgram.length > 0) {
            setActiveTab(`tab-${currentTierIndex + 1}`);
        }
    }, [currentTierIndex, exclusiveProgram.length]);

    if (isLoading) {
        return (
            <section className='mb-20'>
                <div className='container-xxl'>
                    <div className='text-center mb-8'>
                        <NeonText as='h2' className='h2-title mb-2'>
                            Exclusive VIP Program
                        </NeonText>
                        <NeonText
                            as='p'
                            className='text-xl font-bold capitalize'
                            glowSpread={0.5}
                        >
                            Loading VIP tiers...
                        </NeonText>
                    </div>
                </div>
            </section>
        );
    }

    if (!exclusiveProgram.length) {
        return (
            <section className='mb-20'>
                <div className='container-xxl'>
                    <div className='text-center mb-8'>
                        <NeonText as='h2' className='h2-title mb-2'>
                            Exclusive VIP Program
                        </NeonText>
                        <NeonText
                            as='p'
                            className='text-xl font-bold capitalize'
                            glowSpread={0.5}
                        >
                            No VIP tiers available
                        </NeonText>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='mb-20'>
            <div className='container-xxl'>
                <div className='text-center mb-8'>
                    <NeonText as='h2' className='h2-title mb-2'>
                        Exclusive VIP Program
                    </NeonText>
                    <NeonText
                        as='p'
                        className='text-xl font-bold capitalize'
                        glowSpread={0.5}
                    >
                        Discover an unrivaled gaming experience
                    </NeonText>
                </div>

                {/* All Feature Games */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='relative text-center '
                >
                    <ScrollArea type='always' className='mb-8 -mx-3'>
                        <TabsList className='text-foreground h-auto gap-6 rounded-none p-3 w-full justify-start'>
                            {exclusiveProgram.map((program, index) => (
                                <TabsTrigger
                                    removeDefaultStyle
                                    key={index}
                                    value={`tab-${index + 1}`}
                                    className='w-full flex-grow-1 flex-shrink-0 basis-[130px]'
                                >
                                    <NeonBox
                                        glowColor={program.color}
                                        backgroundColor={program.color}
                                        backgroundOpacity={
                                            activeTab === `tab-${index + 1}`
                                                ? 0.3
                                                : 0.1
                                        }
                                        glowSpread={0.6}
                                        enableHover
                                        className='relative rounded-xl p-5 w-full flex flex-col items-center gap-2.5 backdrop-blur-lg'
                                    >
                                        <Image
                                            src={program.image}
                                            alt={program.tier}
                                            width={100}
                                            height={100}
                                            className='w-[60px]'
                                        />
                                        <NeonText
                                            glowColor={program.color}
                                            className='text-base font-bold uppercase'
                                            glowSpread={0.4}
                                        >
                                            {program.tier}
                                        </NeonText>

                                        <div
                                            className={`absolute top-3 right-3 w-2 aspect-square rounded-full bg-white ${
                                                activeTab === `tab-${index + 1}`
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            }`}
                                        ></div>
                                    </NeonBox>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>

                    <NeonBox
                        className='sm:p-4 p-4 lg:p-6 2xl:p-9 rounded-3xl backdrop-blur-md'
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                    >
                        {exclusiveProgram.map((program, index) => (
                            <TabsContent key={index} value={`tab-${index + 1}`}>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4 2xl:gap-6'>
                                    {program.features.map((feature, index) => (
                                        <NeonBox
                                            key={index}
                                            glowColor={feature.color}
                                            glowSpread={0.4}
                                            className='w-full p-2 md:px-4 md:py-3 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 flex flex-wrap items-center justify-between rounded-lg'
                                            backgroundColor={feature.color}
                                            backgroundOpacity={0.1}
                                        >
                                            <div className='inline-flex gap-3 items-center'>
                                                <NeonIcon
                                                    icon={feature.icon}
                                                    glowColor={feature.color}
                                                />
                                                <NeonText
                                                    as='span'
                                                    className={`font-bold text-lg max-xs:text-base uppercase leading-normal d-inline-block truncate max-w-[180px] xl:max-w-[187px] lg:max-w-[139px]`}
                                                    glowColor={feature.color}
                                                    glowSpread={0.2}
                                                >
                                                    {feature.label}
                                                </NeonText>
                                            </div>
                                            {feature.isLock ? (
                                                <NeonIcon
                                                    icon='lucide:lock'
                                                    size={22}
                                                    glowColor={feature.color}
                                                />
                                            ) : (
                                                <span className='font-bold text-base capitalize leading-normal'>
                                                    {feature.rightSec}
                                                </span>
                                            )}
                                        </NeonBox>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </NeonBox>
                </Tabs>
            </div>
        </section>
    );
}