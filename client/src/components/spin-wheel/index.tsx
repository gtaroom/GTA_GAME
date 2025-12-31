// src/components/SpinWheel.tsx
'use client';

import { useBreakPoint } from '@/hooks/useBreakpoint';
import { SpinWheelProps } from '@/types/spin-wheel';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import NeonText from '../neon/neon-text';

const SpinWheel: React.FC<SpinWheelProps> = ({
    options,
    onSpin,
    size = 300,
    spinDuration = 3500,
    disabled = false,
    requestWinnerIndex,
    easing = 'cubic-bezier(0.12, 0.66, 0.12, 1)',
    revealOffsetMs = 250,
    pointerOffsetDeg = 0,
    disableIdleRotation = false,
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const timeoutRef = useRef<number>(0);
    const idleIntervalRef = useRef<number>(0);
    const targetIndexRef = useRef<number | null>(null);
    const animationStartTimeRef = useRef<number>(0);
    const constantSpinIntervalRef = useRef<number>(0);
    const decelerationStartTimeRef = useRef<number>(0);
    const finalTargetRotationRef = useRef<number | null>(null);
    const [isDecelerating, setIsDecelerating] = useState(false);
    const isSpinningActiveRef = useRef<boolean>(false);
    const currentRotationRef = useRef<number>(0); // Track current rotation during spin
    const { xs } = useBreakPoint();
    const segmentAngle = 360 / options.length;
    const radius = size / 2;

    useEffect(() => {
        // Don't start idle rotation if disabled or if wheel is spinning
        if (!disableIdleRotation && !isSpinning) {
            idleIntervalRef.current = window.setInterval(() => {
                setRotation(prev => {
                    const newRot = prev + 0.2; // slow rotation speed
                    currentRotationRef.current = newRot; // Keep ref in sync
                    return newRot;
                });
            }, 16); // ~60fps
        } else {
            // Stop idle rotation if disabled or spinning
            if (idleIntervalRef.current) {
                clearInterval(idleIntervalRef.current);
                idleIntervalRef.current = 0;
            }
        }

        return () => {
            if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
        };
    }, [isSpinning, disableIdleRotation]);
    
    // Keep ref in sync with state
    useEffect(() => {
        currentRotationRef.current = rotation;
    }, [rotation]);

    const createSegmentPath = (i: number) => {
        const start = (i * segmentAngle - 90) * (Math.PI / 180);
        const end = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
        const r = radius * 0.8;
        const x1 = radius + r * Math.cos(start);
        const y1 = radius + r * Math.sin(start);
        const x2 = radius + r * Math.cos(end);
        const y2 = radius + r * Math.sin(end);
        const largeArc = segmentAngle > 180 ? 1 : 0;
        return `M ${radius} ${radius} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    const getTextPosition = (i: number) => {
        const mid =
            (i * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
        const tr = radius * 0.55;
        return {
            x: radius + tr * Math.cos(mid),
            y: radius + tr * Math.sin(mid),
            angle: i * segmentAngle + segmentAngle / 2,
        };
    };

    const handleSpin = useCallback(() => {
        if (isSpinning || disabled || options.length === 0) return;
        
        // ⏸ STOP IDLE ROTATION IMMEDIATELY
        if (idleIntervalRef.current) {
            clearInterval(idleIntervalRef.current);
            idleIntervalRef.current = 0;
        }
        
        // Clear any existing constant spin
        if (constantSpinIntervalRef.current) {
            cancelAnimationFrame(constantSpinIntervalRef.current);
            constantSpinIntervalRef.current = 0;
        }

        // START SPINNING IMMEDIATELY - no waiting!
        setIsSpinning(true);
        setIsDecelerating(false);
        isSpinningActiveRef.current = true;

        // console.log('🎡 ===== SPIN STARTED IMMEDIATELY =====');

        animationStartTimeRef.current = Date.now();
        targetIndexRef.current = null;
        finalTargetRotationRef.current = null;
        decelerationStartTimeRef.current = 0;

        // Capture current rotation from ref (most accurate)
        const initialRotation = currentRotationRef.current || rotation;
        currentRotationRef.current = initialRotation;
        
        // Start constant speed spinning IMMEDIATELY
        const spinSpeed = 0.6; // slightly faster for more visual impact
        
        const constantSpin = () => {
            // Check if we should stop (using ref to avoid closure issues)
            if (!isSpinningActiveRef.current || isDecelerating) {
                if (constantSpinIntervalRef.current) {
                    cancelAnimationFrame(constantSpinIntervalRef.current);
                    constantSpinIntervalRef.current = 0;
                }
                return;
            }
            
            // Update both ref and state to keep them in sync
            currentRotationRef.current += spinSpeed;
            setRotation(currentRotationRef.current);
            constantSpinIntervalRef.current = requestAnimationFrame(constantSpin);
        };
        
        constantSpinIntervalRef.current = requestAnimationFrame(constantSpin);
        
        // Store stop function for later use
        const stopConstantSpin = () => {
            isSpinningActiveRef.current = false;
            if (constantSpinIntervalRef.current) {
                cancelAnimationFrame(constantSpinIntervalRef.current);
                constantSpinIntervalRef.current = 0;
            }
        };

        // Call API in parallel (don't wait for it)
        let targetIndex: number | null = null;
        
        if (requestWinnerIndex) {
            // Handle both Promise and direct number return
            const handleWinnerIndex = (idx: number) => {
                const apiResponseTime = Date.now() - animationStartTimeRef.current;
                // console.log(`🎡 ✅ API responded in ${apiResponseTime}ms, target index:`, idx);
                
                if (typeof idx === 'number' && idx >= 0 && idx < options.length) {
                    targetIndexRef.current = idx;
                    targetIndex = idx;
                    
                    // Stop constant spinning
                    stopConstantSpin();
                    
                    // ============================================
                    // SIMPLE CALCULATION FOR SPIN WHEEL LANDING
                    // ============================================
                    // 
                    // The wheel has 12 segments, each 30°.
                    // The pointer is fixed at 12 o'clock (top).
                    // When rotation = 0°, segment 0 starts at 12 o'clock.
                    // 
                    // Segment N's center is at: (N * 30 + 15)° from 12 o'clock (clockwise)
                    //   - Segment 0 center: 15°
                    //   - Segment 1 center: 45°
                    //   - Segment 11 center: 345°
                    // 
                    // When we apply CSS rotate(R), the wheel rotates R° clockwise.
                    // A point at angle A moves to angle A + R (relative to fixed pointer).
                    // 
                    // To align segment N's center with the pointer at 0°:
                    //   We need: (N * 30 + 15) + R = 360° (or 0°)
                    //   So: R = 360 - (N * 30 + 15) = 345 - N * 30
                    // 
                    // For segment 0: R = 345°
                    // For segment 1: R = 315°
                    // For segment 11: R = 15°
                    
                    const segmentCenterFromTop = idx * segmentAngle + (segmentAngle / 2);
                    let targetNormalizedAngle = (360 - segmentCenterFromTop + 360) % 360;
                    
                    // Account for pointer offset if any
                    targetNormalizedAngle = (targetNormalizedAngle + pointerOffsetDeg + 360) % 360;
                    
                    // console.log(`🎯 ===== CALCULATING FINAL ROTATION (SIMPLIFIED) =====`);
                    // console.log(`🎯 Target index: ${idx}`);
                    // console.log(`🎯 Segment center from top: ${segmentCenterFromTop.toFixed(1)}°`);
                    // console.log(`🎯 Target rotation: ${targetNormalizedAngle.toFixed(1)}°`);
                    // console.log(`🎯 Formula: 360 - ${segmentCenterFromTop.toFixed(1)} = ${targetNormalizedAngle.toFixed(1)}°`);
                    
                    // Prevent multiple calculations
                    if (finalTargetRotationRef.current !== null) {
                        // console.log('🎯 ⚠️ Already calculated, using existing value');
                        setIsDecelerating(true);
                        return;
                    }
                    
                    // Get current rotation from ref (most accurate, avoids stale state)
                    // Use ref instead of state to get the exact current rotation
                    const currentRot = currentRotationRef.current;
                    
                    // Calculate final target using the accurate current rotation
                    const calculateFinalRotation = () => {
                        // Normalize current rotation to 0-360 range
                        const currentRotNormalized = ((currentRot % 360) + 360) % 360;
                        
                        // Add several full rotations for smooth deceleration (3-5 more rotations)
                        const additionalRotations = 360 * (3 + Math.random() * 2); // 3-5 more rotations
                        
                        // Calculate the exact rotation needed to reach target
                        // We want: (currentRot + additionalRotations + correction) % 360 = targetNormalizedAngle
                        const currentAfterRotations = ((currentRot + additionalRotations) % 360 + 360) % 360;
                        let correction = targetNormalizedAngle - currentAfterRotations;
                        if (correction < 0) correction += 360;
                        if (correction === 0) correction = 360; // At least one full rotation
                        
                        const finalRotation = currentRot + additionalRotations + correction;
                        
                        // Store in ref BEFORE setting state to prevent recalculation
                        finalTargetRotationRef.current = finalRotation;
                        decelerationStartTimeRef.current = Date.now();
                        
                        // Verify the calculation
                        const finalNormalized = ((finalRotation % 360) + 360) % 360;
                        let diff = Math.abs(finalNormalized - targetNormalizedAngle);
                        if (diff > 180) diff = 360 - diff;
                        
                        // console.log(`🎯 Starting deceleration:`);
                        // console.log(`🎯   Current rotation (from ref): ${currentRot.toFixed(1)}° (normalized: ${currentRotNormalized.toFixed(1)}°)`);
                        // console.log(`🎯   Target normalized: ${targetNormalizedAngle.toFixed(1)}°`);
                        // console.log(`🎯   Additional rotations: ${(additionalRotations / 360).toFixed(1)}`);
                        // console.log(`🎯   Current after rotations: ${currentAfterRotations.toFixed(1)}°`);
                        // console.log(`🎯   Correction needed: ${correction.toFixed(1)}°`);
                        // console.log(`🎯   Final rotation: ${finalRotation.toFixed(1)}°`);
                        // console.log(`🎯   Final normalized: ${finalNormalized.toFixed(1)}°`);
                        // console.log(`🎯   Difference: ${diff.toFixed(1)}° (should be < 1°)`);
                        
                        if (diff > 1) {
                            // console.error(`🎯 ❌ ERROR: Calculation still off! Recalculating...`);
                            // Force correct it - use simpler formula
                            const forceCorrection = (targetNormalizedAngle - currentAfterRotations + 360) % 360;
                            const forceCorrected = currentRot + additionalRotations + (forceCorrection === 0 ? 360 : forceCorrection);
                            const forceNormalized = ((forceCorrected % 360) + 360) % 360;
                            const forceDiff = Math.abs(forceNormalized - targetNormalizedAngle);
                            // console.log(`🎯 🔧 Force corrected: ${forceCorrected.toFixed(1)}° (normalized: ${forceNormalized.toFixed(1)}°, diff: ${forceDiff.toFixed(1)}°)`);
                            finalTargetRotationRef.current = forceCorrected;
                            setIsDecelerating(true);
                            setRotation(forceCorrected);
                            currentRotationRef.current = forceCorrected;
                            return;
        } else {
                            // console.log(`🎯 ✅ Calculation is correct!`);
                        }
                        
                        // Start deceleration and update rotation
                        setIsDecelerating(true);
                        setRotation(finalRotation);
                        currentRotationRef.current = finalRotation;
                    };
                    
                    // Execute the calculation
                    calculateFinalRotation();
                }
            };
            
            // Start API call immediately - handle both Promise and direct return
            const result = requestWinnerIndex();
            if (result instanceof Promise) {
                result
                    .then(handleWinnerIndex)
                    .catch((err) => {
                        // console.error('🎡 ❌ API call failed:', err);
                        // If API fails, stop spinning after minimum time
                        stopConstantSpin();
                        setTimeout(() => {
                            setIsSpinning(false);
                            setIsDecelerating(false);
                        }, 3000);
                    });
            } else if (typeof result === 'number') {
                // Direct number return (synchronous)
                handleWinnerIndex(result);
            }
        }

        // Set timeout to call onSpin callback after deceleration completes
        const decelerationDuration = 3500; // 3.5 seconds for smooth deceleration
        const minSpinTime = 2000; // Minimum 2 seconds before API response can trigger deceleration

        timeoutRef.current = window.setTimeout(() => {
            // Use the target index from API (stored in ref)
            const winnerIndex = targetIndexRef.current ?? targetIndex ?? 0;
            
            // Ensure index is valid
            const finalWinnerIndex = (winnerIndex >= 0 && winnerIndex < options.length) 
                ? winnerIndex 
                : 0;
            
            // console.log(`🎯 Animation complete! Winner index: ${finalWinnerIndex}`);
            const winner = options[finalWinnerIndex];
            // console.log(`🎯 Winner option:`, winner);
            
            // Call onSpin callback
            onSpin?.(winner);
            
            // Reset after a short delay
            setTimeout(() => {
                setIsSpinning(false);
                setIsDecelerating(false);
                isSpinningActiveRef.current = false;
                targetIndexRef.current = null;
                finalTargetRotationRef.current = null;
            }, 500);
        }, minSpinTime + decelerationDuration);
    }, [
        isSpinning,
        disabled,
        rotation,
        segmentAngle,
        options,
        onSpin,
        requestWinnerIndex,
        pointerOffsetDeg,
        isDecelerating,
    ]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
            if (constantSpinIntervalRef.current) cancelAnimationFrame(constantSpinIntervalRef.current);
        };
    }, []);

    if (options.length === 0) {
        return <div>No options available</div>;
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='mb-0 spin-wheel-wrapper motion-safe:motion-scale-loop-[1.02] motion-safe:motion-duration-2000 motion-safe:motion-ease-linear'>
                <div
                    style={{
                        width: size,
                        height: size,
                        transform: `rotate(${rotation}deg)`,
                        transition: isDecelerating
                            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 1)` // Smooth deceleration easing
                            : isSpinning
                            ? 'none' // No transition during constant speed spinning
                            : 'none',
                    }}
                    className='relative'
                >
                    <svg width={size} height={size}>
                        <defs>
                            <filter
                                id='glow'
                                x='-50%'
                                y='-50%'
                                width='200%'
                                height='200%'
                            >
                                <feGaussianBlur
                                    stdDeviation='3'
                                    result='coloredBlur'
                                />
                                <feMerge>
                                    <feMergeNode in='coloredBlur' />
                                    <feMergeNode in='SourceGraphic' />
                                </feMerge>
                            </filter>

                            {/* Gradients */}
                            {options.map(opt => {
                                if (typeof opt.color === 'object') {
                                    const { from, to, deg = 0 } = opt.color;
                                    const rad = (deg * Math.PI) / 180;
                                    const x1 = 50 - Math.cos(rad) * 50;
                                    const y1 = 50 - Math.sin(rad) * 50;
                                    const x2 = 50 + Math.cos(rad) * 50;
                                    const y2 = 50 + Math.sin(rad) * 50;
                                    return (
                                        <linearGradient
                                            key={opt.id}
                                            id={`grad-${opt.id}`}
                                            x1={`${x1}%`}
                                            y1={`${y1}%`}
                                            x2={`${x2}%`}
                                            y2={`${y2}%`}
                                        >
                                            <stop
                                                offset='0%'
                                                stopColor={from}
                                            />
                                            <stop
                                                offset='100%'
                                                stopColor={to}
                                            />
                                        </linearGradient>
                                    );
                                }
                                return null;
                            })}
                        </defs>

                        {/* Render segments with glow */}
                        {options.map((opt, i) => {
                            const pos = getTextPosition(i);
                            const fillValue =
                                typeof opt.color === 'string'
                                    ? opt.color
                                    : `url(#grad-${opt.id})`;
                            const foSize = radius * 0.5;

                            return (
                                <g key={opt.id}>
                                    <path
                                        d={createSegmentPath(i)}
                                        fill={fillValue}
                                        stroke='none'
                                    />

                                    {/* White dividing line between segments */}
                                    <path
                                        d={createSegmentPath(i)}
                                        fill='none'
                                        stroke='rgba(255, 255, 255, 0.6)'
                                        strokeWidth='2'
                                        strokeLinejoin='miter'
                                        vectorEffect='non-scaling-stroke'
                                        filter='url(#glow)'
                                    />

                                    <foreignObject
                                        x={pos.x - foSize / 2}
                                        y={pos.y - foSize / 2}
                                        width={foSize}
                                        height={foSize}
                                        transform={`rotate(${pos.angle}, ${pos.x}, ${pos.y})`}
                                    >
                                        <div
                                            className='flex flex-col items-center justify-center text-white xs:text-sm text-xs! font-bold pointer-events-none'
                                            style={{
                                                width: foSize,
                                                height: foSize,
                                                fontWeight: 'black',
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Enhanced Pointer - Points to winning segment */}
                <div 
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none'
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                    }}
                >
                    <div className='bg-[url("/spin-wheel/center-arrow.avif")] h-34 w-34 bg-contain bg-center bg-no-repeat relative'>
                        {/* Glow effect around pointer */}
                        <div 
                            className='absolute inset-0 rounded-full blur-xl opacity-60'
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
                                animation: 'pointer-glow 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>
                <div
                    className='bg-[url("/spin-wheel/background.avif")]  h-full w-full bg-contain bg-center bg-no-repeat transform -translate-x-1/2 -translate-y-1/2 z-[-1] rotate-45 pointer-events-none'
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isDecelerating
                            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 1)` // Smooth deceleration easing
                            : isSpinning
                            ? 'none' // No transition during constant speed spinning
                            : 'none',
                    }}
                ></div>
            </div>

            {/* Game-Style Arcade Spin Button - Hidden while spinning */}
            {!isSpinning && (
                <div className='mt-6 mb-4'>
                    <button
                onClick={handleSpin}
                        disabled={disabled}
                        className={`
                            relative px-10 py-4 rounded-xl
                            text-white font-black text-xl uppercase tracking-wider
                            transition-all duration-200 ease-out
                            disabled:cursor-not-allowed disabled:opacity-50
                            ${!disabled ? 'hover:scale-105 active:scale-95' : ''}
                        `}
                        style={{
                            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                            boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), 0 8px 25px rgba(217, 119, 6, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            minWidth: '220px',
                        }}
                    >
                        <span className='flex items-center justify-center gap-3'>
                            <span className='text-2xl'>🎯</span>
                            <span>SPIN NOW!</span>
                        </span>
                    </button>
                </div>
            )}
            
            {/* CSS Animations */}
            <style jsx>{`
                @keyframes pointer-glow {
                    0%, 100% {
                        opacity: 0.6;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default SpinWheel;
