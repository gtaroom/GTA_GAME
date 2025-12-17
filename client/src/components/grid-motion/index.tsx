'use client';

import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { gamesData } from '@/data/games';
import type { GameDataProps } from '@/types/global.type';

import GameCard from '../game-card';

type GridMotionProps = { items?: GameDataProps[] };

const ROWS = 6;
const COLS = 8;
const TOTAL = ROWS * COLS;
const REPEAT = 4;
const DEFAULT_SPEED = 0.01;
const MOUSE_STRENGTH = 0.05;
const BASE_DURATION = 0.45;
const INERTIA = [0.6, 0.5, 0.4, 0.35];

const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function GridMotion({ items }: GridMotionProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<HTMLDivElement[]>([]);
    const scrollMax = useRef<number[]>([]);
    const quickMoves = useRef<ReturnType<typeof gsap.quickTo>[]>([]);
    const t = useRef(0.5);
    const dir = useRef(1);
    const mouseX = useRef(0);
    const windowWidth = useRef(1);

    const data = (items && items.length ? items : gamesData).slice(0, TOTAL);

    const autoX = useCallback(
        (idx: number, tVal: number, max: number) =>
            idx % 2 === 0 ? lerp(-max, 0, tVal) : lerp(0, -max, tVal),
        []
    );

    const measureAndSnap = useCallback(() => {
        scrollMax.current = rowRefs.current.map(row =>
            row ? Math.max(0, row.scrollWidth - row.clientWidth) : 0
        );
        rowRefs.current.forEach((row, idx) => {
            const max = scrollMax.current[idx] || 0;
            gsap.set(row, { x: autoX(idx, t.current, max) });
        });
    }, [autoX]);

    useLayoutEffect(() => {
        windowWidth.current = window.innerWidth;
        measureAndSnap();
        const onResize = () => {
            windowWidth.current = window.innerWidth;
            requestAnimationFrame(measureAndSnap);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [measureAndSnap]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            windowWidth.current = window.innerWidth;
            mouseX.current = windowWidth.current / 2;

            quickMoves.current = rowRefs.current.map((row, idx) =>
                gsap.quickTo(row, 'x', {
                    duration: BASE_DURATION + INERTIA[idx % INERTIA.length],
                    ease: 'power3.out',
                    overwrite: 'auto',
                })
            );

            const update = () => {
                const delta = gsap.ticker.deltaRatio(60);
                t.current = clamp(
                    t.current + dir.current * DEFAULT_SPEED * delta * 0.016,
                    0,
                    1
                );
                if (t.current === 1 || t.current === 0) dir.current *= -1;

                const prog = mouseX.current / windowWidth.current;
                const mouseOffset = (prog - 0.5) * 2 * MOUSE_STRENGTH;

                quickMoves.current.forEach((move, idx) => {
                    const max = scrollMax.current[idx] || 0;
                    const target = clamp(
                        autoX(idx, t.current, max) -
                            mouseOffset * Math.max(120, max * 0.25),
                        -max,
                        0
                    );
                    move(target);
                });
            };

            gsap.ticker.add(update);

            const onMouse = (e: MouseEvent) => (mouseX.current = e.clientX);
            const onTouch = (e: TouchEvent) =>
                (mouseX.current = e.touches?.[0]?.clientX ?? mouseX.current);

            window.addEventListener('mousemove', onMouse, { passive: true });
            window.addEventListener('touchmove', onTouch, { passive: true });

            return () => {
                gsap.ticker.remove(update);
                window.removeEventListener('mousemove', onMouse);
                window.removeEventListener('touchmove', onTouch);
            };
        }, gridRef);

        return () => ctx.revert();
    }, [autoX]);

    return (
        <div ref={gridRef} className='h-full w-full overflow-hidden'>
            <section className='relative flex h-screen w-full items-center justify-center overflow-hidden'>
                <div className='relative z-[2] grid h-[140vh] w-[80vw] flex-none origin-[center_center] rotate-[-15deg] grid-cols-[100%] grid-rows-[repeat(6,1fr)] gap-5'>
                    {Array.from({ length: ROWS }).map((_, rowIdx) => (
                        <div
                            key={rowIdx}
                            ref={el => {
                                if (el) rowRefs.current[rowIdx] = el;
                            }}
                            className='grid auto-cols-[180px] grid-flow-col gap-5 will-change-transform'
                        >
                            {Array.from({ length: COLS * REPEAT }).map(
                                (_, colIdx) => {
                                    const base =
                                        rowIdx * COLS + (colIdx % COLS);
                                    const game =
                                        data[base] ||
                                        data[(rowIdx * COLS) % data.length];
                                    return game ? (
                                        <GameCard
                                            playable={false}
                                            key={`${game.id}-${colIdx}`}
                                            game={game}
                                        />
                                    ) : (
                                        <div
                                            key={`empty-${rowIdx}-${colIdx}`}
                                            className='rounded-xl bg-neutral-800/30'
                                        />
                                    );
                                }
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
