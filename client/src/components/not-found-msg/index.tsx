'use client';

import { gsap } from 'gsap';
// import { useRouter } from 'next/navigation';
import { useTransitionRouter } from 'next-transition-router';
import { useEffect, useRef } from 'react';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';
import { Button } from '../ui/button';

export default function NotFoundMsg(): React.ReactNode {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const footerRef = useRef<HTMLElement | null>(null);
    const left4Ref = useRef<HTMLSpanElement | null>(null);
    const zeroRef = useRef<HTMLSpanElement | null>(null);
    const right4Ref = useRef<HTMLSpanElement | null>(null);
    const headlineRef = useRef<HTMLHeadingElement | null>(null);
    const subtitleRef = useRef<HTMLParagraphElement | null>(null);
    const decorativeBoxesRef = useRef<HTMLDivElement | null>(null);
    const router = useTransitionRouter();
    // const router = useRouter();

    useEffect(() => {
        if (
            !containerRef.current ||
            !footerRef.current ||
            !left4Ref.current ||
            !zeroRef.current ||
            !right4Ref.current ||
            !headlineRef.current ||
            !subtitleRef.current ||
            !decorativeBoxesRef.current
        ) {
            return;
        }

        gsap.set(containerRef.current, { autoAlpha: 0 });

        const tl = gsap.timeline({ delay: 1 });

        tl.set(containerRef.current, { autoAlpha: 1 });

        tl.from(
            [left4Ref.current, right4Ref.current],
            {
                y: -200,
                opacity: 0,
                stagger: 0.2,
                duration: 1,
                ease: 'bounce.out',
            },
            '>-0.3'
        );

        tl.from(
            zeroRef.current,
            {
                x: '100vw',
                rotation: 360,
                duration: 1.2,
                ease: 'power4.out',
            },
            '<0.2'
        );

        tl.to(
            zeroRef.current,
            {
                y: 10,
                rotate: 10,
                duration: 1.2,
                ease: 'elastic.out(1, 0.5)',
            },
            '>-0'
        );

        tl.from(
            headlineRef.current,
            {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: 'back.out(1.7)',
            },
            '>-0.5'
        );

        tl.from(
            subtitleRef.current,
            {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: 'power2.out',
            },
            '>-0.3'
        );

        tl.from(
            decorativeBoxesRef.current.children,
            {
                opacity: 0,
                scale: 0,
                rotation: 180,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            },
            '>-0.4'
        );

        tl.from(
            footerRef.current,
            {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: 'power2.out',
            },
            '>-0.2'
        );

        gsap.to(decorativeBoxesRef.current.children, {
            y: -10,
            duration: 2,
            ease: 'sine.inOut',
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
            delay: 3,
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className='flex flex-col items-center justify-center overflow-hidden min-h-svh text-zinc-100 relative z-10 px-4'
        >
            {/* Decorative floating boxes */}
            <div
                ref={decorativeBoxesRef}
                className='absolute inset-0 pointer-events-none'
            >
                <NeonBox
                    glowColor='--color-fuchsia-500'
                    backgroundColor='--color-fuchsia-500'
                    backgroundOpacity={0.2}
                    className='absolute top-20 lg:-left-20 sm:left-5 left-15 sm:w-8 sm:h-8 w-6 h-6'
                />
                <NeonBox
                    glowColor='--color-green-500'
                    backgroundColor='--color-green-500'
                    backgroundOpacity={0.2}
                    className='absolute top-40 lg:-right-30 sm:-right-0 right-10 sm:w-6 sm:h-6 h-5 w-5'
                />
                <NeonBox
                    glowColor='--color-cyan-500'
                    backgroundColor='--color-cyan-500'
                    backgroundOpacity={0.2}
                    className='absolute bottom-40 lg:-left-40 sm:left-0 left-10 sm:w-10 sm:h-10 w-8 h-8'
                />
                <NeonBox
                    glowColor='--color-blue-500'
                    backgroundColor='--color-blue-500'
                    backgroundOpacity={0.2}
                    className='absolute bottom-60 lg:-right-20 sm:right-0 right-10 sm:w-4 sm:h-4 w-3.5 h-3.5'
                />
                <NeonBox
                    glowColor='--color-yellow-500'
                    backgroundColor='--color-yellow-500'
                    backgroundOpacity={0.2}
                    className='absolute bottom-15 right-1/3 w-7 h-7'
                />
            </div>

            {/* Main headline */}
            <NeonText
                as='h2'
                ref={headlineRef}
                className='sm:text-3xl text-2xl md:text-4xl font-bold mb-4 text-center max-xs:max-w-[200px] max-xs:leading-10'
            >
                OOPS! PAGE NOT FOUND
            </NeonText>

            {/* Main 404 display */}
            <h1 className='flex items-center text-[clamp(8.125rem,_6.25rem_+_9.375vw,_17.5rem)] leading-none gap-4 md:gap-8 [&>span]:font-semibold [&>span]:font-nunito mb-8'>
                <NeonText as='span' ref={left4Ref}>
                    4
                </NeonText>
                <NeonText as='span' ref={zeroRef}>
                    0
                </NeonText>
                <NeonText as='span' ref={right4Ref}>
                    4
                </NeonText>
            </h1>

            {/* Subtitle */}
            <NeonText
                as='p'
                ref={subtitleRef}
                className='lg:text-lg text-base lg:leading-10 leading-8 md:text-xl lg:mb-14 mb-12  text-center max-w-md font-bold capitalize'
            >
                The page you're looking for has vanished into the digital void
            </NeonText>

            <footer ref={footerRef} className='text-center space-y-4'>
                <Button
                    size='lg'
                    onClick={() => router.push('/')}
                    className='mb-4'
                >
                    Back Home
                </Button>
            </footer>
        </div>
    );
}
