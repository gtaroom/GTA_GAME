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
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const timeoutRef = useRef<number>(0);
    const idleIntervalRef = useRef<number>(0);
    const { xs } = useBreakPoint();
    const segmentAngle = 360 / options.length;
    const radius = size / 2;

    useEffect(() => {
        if (!isSpinning) {
            idleIntervalRef.current = window.setInterval(() => {
                setRotation(prev => prev + 0.2); // slow rotation speed
            }, 16); // ~60fps
        }

        return () => {
            if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
        };
    }, [isSpinning]);

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

    const handleSpin = useCallback(async () => {
        if (isSpinning || disabled || options.length === 0) return;
        setIsSpinning(true);

        // ⏸ Stop idle rotation while spinning
        if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);

        // If a winner is requested externally, compute the angle to land on that index
        let targetIndex: number | null = null;
        if (requestWinnerIndex) {
            try {
                const idx = await requestWinnerIndex();
                if (typeof idx === 'number' && idx >= 0 && idx < options.length) {
                    targetIndex = idx;
                }
            } catch {}
        }

        // Calculate the absolute target angle for the server-selected index
        let finalTargetAngle: number;
        if (targetIndex !== null) {
            // Segments are rendered starting at -90deg (12 o'clock in SVG coords)
            // Segment 0 spans from -90 to -90+segmentAngle
            // To land segment N under the top pointer, we need to rotate so that segment's center aligns
            const segmentStartAngle = -90 + (targetIndex * segmentAngle);
            const segmentCenterAngle = segmentStartAngle + (segmentAngle / 2);
            // The wheel shows what's at the top (0deg in display), so we need to rotate
            // so that segmentCenterAngle ends up at 0deg
            finalTargetAngle = (360 - segmentCenterAngle + pointerOffsetDeg + 360) % 360;
            console.log(`🎯 Target index: ${targetIndex}, Segment angle: ${segmentAngle}deg, Center: ${segmentCenterAngle}deg, Final target: ${finalTargetAngle}deg`);
        } else {
            // Random spin
            finalTargetAngle = Math.random() * 360;
        }

        // Add multiple full rotations for visual effect
        const fullRotations = 360 * 6;
        // Normalize current rotation to 0-360
        const currentNormalized = ((rotation % 360) + 360) % 360;
        // Calculate shortest path to target (we can go positive direction)
        let delta = finalTargetAngle - currentNormalized;
        if (delta < 0) delta += 360;
        
        const jitter = (Math.random() - 0.5) * (segmentAngle * 0.05);
        const newRot = rotation + fullRotations + delta + jitter;
        console.log(`🎡 Spinning from ${rotation.toFixed(1)}° (normalized: ${currentNormalized.toFixed(1)}°) to ${newRot.toFixed(1)}° (target: ${finalTargetAngle.toFixed(1)}°, delta: ${delta.toFixed(1)}°)`);
        setRotation(newRot);

        timeoutRef.current = window.setTimeout(() => {
            // If we had a target, use it directly; otherwise compute from final angle
            const winnerIndex = targetIndex !== null ? targetIndex : (() => {
                const finalAngle = newRot % 360;
                const segmentAngle360 = (360 - finalAngle + 90 - pointerOffsetDeg + 360) % 360;
                return Math.floor(segmentAngle360 / segmentAngle) % options.length;
            })();
            // reveal a bit before end for snappier feel
            window.setTimeout(() => onSpin?.(options[winnerIndex]), Math.max(0, spinDuration - revealOffsetMs));
            window.setTimeout(() => setIsSpinning(false), spinDuration);
        }, 16);
    }, [
        isSpinning,
        disabled,
        rotation,
        segmentAngle,
        options,
        onSpin,
        spinDuration,
        requestWinnerIndex,
    ]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
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
                        transition: isSpinning
                            ? `transform ${spinDuration}ms ${easing}`
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

                                    <path
                                        d={createSegmentPath(i)}
                                        fill='none'
                                        stroke={
                                            typeof opt.color === 'string'
                                                ? opt.color
                                                : '#fff'
                                        }
                                        strokeWidth='1'
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

                {/* <div className='bg-[url("/spin-wheel/selected-line.avif")] absolute top-4 left-1/2 h-full w-14 bg-cover bg-center bg-no-repeat transform -translate-x-1/2 z-10'></div> */}
                <div className='bg-[url("/spin-wheel/center-arrow.avif")] absolute top-1/2 left-1/2 h-34 w-34 bg-contain bg-center bg-no-repeat transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none'></div>
                <div
                    className='bg-[url("/spin-wheel/background.avif")] absolute top-1/2 left-1/2 h-full w-full bg-contain bg-center bg-no-repeat transform -translate-x-1/2 -translate-y-1/2 z-[-1] rotate-45 pointer-events-none'
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning
                            ? `transform ${spinDuration}ms ${easing}`
                            : 'none',
                    }}
                ></div>
            </div>

            <NeonText as='h4' className='h4-title capitalize md:mb-3'>Unlock Rewards!</NeonText>
            {/* Spin button */}
            <Button
                size={xs ? 'lg' : 'md'}
                onClick={handleSpin}
                disabled={isSpinning || disabled}
            >
                {isSpinning ? 'Spinning...' : 'SPIN NOW'}
            </Button>
        </div>
    );
};

export default SpinWheel;
