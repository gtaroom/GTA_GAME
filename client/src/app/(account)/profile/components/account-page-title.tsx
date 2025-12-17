import NeonText from '@/components/neon/neon-text';
import { cn } from '@/lib/utils';

export default function AccountPageTitle({
    children,
    className = 'mb-10',
    as = 'h1',
}: {
    as?: 'h1' | 'h2';
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <NeonText
            as={as}
            className={cn('h1-title', className)}
            glowSpread={0.5}
        >
            {children}
        </NeonText>
    );
}
