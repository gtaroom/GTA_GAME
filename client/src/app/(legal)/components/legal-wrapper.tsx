'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { useIsLoggedIn } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface LegalWrapperProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    className?: string; // Prop for classname
}

const LegalWrapper = ({
    children,
    title,
    description,
    className,
}: LegalWrapperProps) => {
    const { isLoggedIn } = useIsLoggedIn();
    return (
        <div
            className={cn(
                isLoggedIn
                    ? 'pt-0'
                    : 'pt-[clamp(0rem,_-0.25rem_+_1.25vw,_1.25rem)]',
                className
            )}
        >
            <div className='container-xxl relative z-[1] mx-auto'>
                <section className='mx-auto mb-10 max-w-[1000px] text-center'>
                    {title && (
                        <NeonText as='h1' className='h1-title mb-3 break-words'>
                            {title}
                        </NeonText>
                    )}
                    {description && (
                        <p className='tracking-common xl:text-xl md:text-lg text-base font-bold'>
                            {description}
                        </p>
                    )}
                </section>
                <section>
                    <NeonBox
                        glowColor='--color-purple-500'
                        backgroundColor='--color-purple-500'
                        backgroundOpacity={0.1}
                        className='w-full rounded-[20px] p-[24px] sm:p-[36px] md:p-[50px] backdrop-blur-xs'
                    >
                        {children}
                    </NeonBox>
                </section>
            </div>
        </div>
    );
};

export default LegalWrapper;
