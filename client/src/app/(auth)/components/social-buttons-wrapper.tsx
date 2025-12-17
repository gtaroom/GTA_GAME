import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { cn } from '@/lib/utils';

const SocialButtonsWrapper = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <>
            <div className='mb-8 flex w-full items-center gap-5'>
                <NeonBox className='h-[1px] w-full !border-b-0' />
                <NeonText className='text-base font-bold' as='span'>
                    OR
                </NeonText>
                <NeonBox className='h-[1px] w-full !border-b-0' />
            </div>

            <div className={cn('flex w-full flex-col gap-6', className)}>
                {children}
            </div>
        </>
    );
};

export default SocialButtonsWrapper;
