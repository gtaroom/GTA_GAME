'use client';

import clsx from 'clsx';
import {
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type MotionInViewProps = {
    children: ReactNode;
    className?: string;
    animationClassName?: string;
    once?: boolean;
    rootMargin?: string;
    threshold?: number | number[];
};

const MotionInView = ({
    children,
    className,
    animationClassName = 'motion-safe:motion-preset-fade motion-safe:motion-duration-400 motion-safe:motion-delay-100',
    once = true,
    rootMargin = '0px 0px -15% 0px',
    threshold = 0.1,
}: MotionInViewProps) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const shouldAnimate = !prefersReducedMotion;
    const ref = useRef<HTMLDivElement | null>(null);
    const [isActive, setIsActive] = useState(() => !shouldAnimate);

    useLayoutEffect(() => {
        if (!shouldAnimate) {
            setIsActive(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth =
            window.innerWidth || document.documentElement.clientWidth;
        const isInitiallyVisible =
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < viewportHeight &&
            rect.left < viewportWidth;

        if (isInitiallyVisible) {
            setIsActive(true);
            if (once) {
                return;
            }
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsActive(true);
                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!once) {
                        setIsActive(false);
                    }
                });
            },
            {
                rootMargin,
                threshold,
            }
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [once, rootMargin, shouldAnimate, threshold]);

    const combinedClassName = useMemo(
        () =>
            clsx(
                shouldAnimate && !isActive && 'motion-safe:opacity-0',
                className,
                shouldAnimate && isActive && 'motion-safe:opacity-100',
                shouldAnimate && isActive && animationClassName,
                'motion'
            ),
        [animationClassName, className, isActive, shouldAnimate]
    );

    return (
        <div ref={ref} className={combinedClassName}>
            {children}
        </div>
    );
};

export default MotionInView;
