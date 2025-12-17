import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
export default function ItemStatus({
    status,
    enableText = 'Enabled',
    disableText = 'Disabled',
    enableIcon = 'lucide:check',
    disableIcon = 'lucide:x',
}: {
    status: 'enable' | 'disable';
    enableText?: string;
    disableText?: string;
    enableIcon?: string;
    disableIcon?: string;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 hover:underline hover:underline-offset-5 cursor-pointer',
                status === 'enable' ? 'text-green-400' : 'text-red-400'
            )}
        >
            <span className='capitalize font-bold text-base whitespace-nowrap'>
                {status === 'enable' ? enableText : disableText}
            </span>
            <Icon
                icon={status === 'enable' ? enableIcon : disableIcon}
                fontSize={18}
            />
        </div>
    );
}
