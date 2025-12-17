import { cn } from '@/lib/utils';
import NeonText from '../neon/neon-text';

export default function SecTitle({
    children,
    icon,
    color = 'purple',
}: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    color?: string;
}) {
    return (
        <div className='inline-flex items-center gap-2'>
            {icon && (
                <div className='relative'>
                    {icon}
                    <div
                        className={cn(
                            'absolute left-1/2 top-1/2 h-8 w-8 rounded-full  transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-md'
                        )}
                        style={{ backgroundColor: `var(${color})` }}
                    ></div>
                </div>
            )}
            <NeonText as='h4' className='h4-title' glowColor={color}>
                {children}
            </NeonText>
        </div>
    );
}
