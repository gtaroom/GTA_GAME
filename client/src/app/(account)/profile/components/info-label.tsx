import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

export default function InfoLabel({
    icon = 'lucide:star',
    text = 'Title',
    className,
    rightSec,
}: {
    icon: string;
    text: string;
    className?: string;
    rightSec?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'inline-flex gap-3 max-xs:flex-col sm:items-center items-start justify-between text-white/80 w-full flex-wrap',
                className
            )}
        >
            <div className='inline-flex max-xs:w-full sm:items-center items-start gap-2'>
                <Icon icon={icon} fontSize={20} />
                <span className='text-base capitalize whitespace-nowrap'>
                    {text}
                </span>
            </div>
            {rightSec && <>{rightSec}</>}
        </div>
    );
}
