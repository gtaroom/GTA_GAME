'use client';

import { gsap } from 'gsap';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type NeonParticlesProps = {
    count?: number;
    sizeMin?: number;
    sizeMax?: number;
    speed?: number;
    colors?: [string, string, string];
    zIndex?: number;
    className?: string;
};

type Shape = 'cross' | 'ring' | 'dot';

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    shape: Shape;
    rot: number;
    rotSpeed: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: readonly T[]) => arr[(Math.random() * arr.length) | 0];

const DEFAULTS = {
    count: 10,
    sizeMin: 4,
    sizeMax: 10,
    speed: 0.6,
    colors: ['#9333ea', '#6366f1', '#d946ef'] as [string, string, string],
};

export default memo(function GlobalParticleBg({
    count = DEFAULTS.count,
    sizeMin = DEFAULTS.sizeMin,
    sizeMax = DEFAULTS.sizeMax,
    speed = DEFAULTS.speed,
    colors = DEFAULTS.colors,
    zIndex = 0,
    className,
}: NeonParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isClient, setIsClient] = useState(false);
    const particlesRef = useRef<Particle[]>([]);
    const dprRef = useRef(1);
    const sizeConfig = useRef({ width: 0, height: 0 });

    // Client-side hydration effect
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Resize & DPR setup
    useLayoutEffect(() => {
        if (!isClient) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;
        
        const resize = () => {
            const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
            dprRef.current = dpr;
            const { innerWidth: w, innerHeight: h } = window;
            sizeConfig.current = { width: w, height: h };
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [isClient]);

    // Initialize particles on prop change (only on client)
    useEffect(() => {
        if (!isClient) return;
        
        const { width: W, height: H } = sizeConfig.current;
        particlesRef.current = Array.from({ length: count }).map(() => {
            const size = rand(sizeMin, sizeMax);
            const theta = rand(0, Math.PI * 2);
            const speedPx = rand(12, 38) * speed;
            return {
                x: rand(0, W),
                y: rand(0, H),
                vx: Math.cos(theta) * speedPx,
                vy: Math.sin(theta) * speedPx,
                size,
                color: pick(colors),
                shape: pick<Shape>(['cross', 'ring', 'dot']),
                rot: rand(0, Math.PI * 2),
                rotSpeed: rand(-0.8, 0.8),
            };
        });
    }, [isClient, count, sizeMin, sizeMax, speed, colors]);

    // Draw loop
    const draw = useCallback((dt: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { width: W, height: H } = sizeConfig.current;
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        for (const p of particlesRef.current) {
            // integrate
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.rotSpeed * dt;

            // wrap
            const m = 40;
            if (p.x < -m) p.x = W + m;
            else if (p.x > W + m) p.x = -m;
            if (p.y < -m) p.y = H + m;
            else if (p.y > H + m) p.y = -m;

            // draw
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.shadowBlur = Math.max(8, p.size * 1.8);
            ctx.shadowColor = p.color;

            switch (p.shape) {
                case 'dot':
                    ctx.beginPath();
                    ctx.fillStyle = p.color;
                    ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.lineWidth = Math.max(1, p.size * 0.15);
                    ctx.strokeStyle = p.color;
                    ctx.stroke();
                    break;
                case 'ring':
                    ctx.beginPath();
                    ctx.lineWidth = Math.max(1.2, p.size * 0.22);
                    ctx.strokeStyle = p.color;
                    ctx.arc(0, 0, p.size * 0.75, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                case 'cross': {
                    const half = p.size * 0.8;
                    ctx.lineWidth = Math.max(1.2, p.size * 0.18);
                    ctx.strokeStyle = p.color;
                    ctx.rotate(Math.PI / 4);
                    ctx.beginPath();
                    ctx.moveTo(-half, 0);
                    ctx.lineTo(half, 0);
                    ctx.moveTo(0, -half);
                    ctx.lineTo(0, half);
                    ctx.stroke();
                    break;
                }
            }
            ctx.restore();
        }

        ctx.globalCompositeOperation = 'source-over';
    }, []);

    // Start GSAP ticker
    useEffect(() => {
        if (!isClient || !canvasRef.current) return;
        
        const ticker = gsap.ticker;
        const onTick = () => draw(ticker.deltaRatio(60) / 60);
        ticker.add(onTick);
        return () => ticker.remove(onTick);
    }, [draw, isClient]);

    // Don't render on server to prevent hydration mismatch
    if (!isClient) {
        return null;
    }

    return (
        <div
            className={className}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex,
                pointerEvents: 'none',
            }}
            aria-hidden='true'
        >
            <canvas ref={canvasRef} />
        </div>
    );
});
