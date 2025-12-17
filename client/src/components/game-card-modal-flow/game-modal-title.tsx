import { DialogTitle } from '@/components/ui/dialog';
import NeonText from '../neon/neon-text';

export default function GameModalTitle({
    title,
    description,
    className = 'text-center max-w-[380px] mx-auto mb-4',
}: {
    title: string;
    description?: string;
    className?: string;
}) {
    return (
        <div className={className}>
            {title && (
                <DialogTitle asChild>
                    <NeonText as='h4' className='h4-title mb-2'>
                        {title}
                    </NeonText>
                </DialogTitle>
            )}
            {description && (
                <p className='mb-6 font-extrabold text-base text-center'>
                    {description}
                </p>
            )}
        </div>
    );
}
