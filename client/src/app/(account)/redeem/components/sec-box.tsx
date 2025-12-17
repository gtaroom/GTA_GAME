import NeonText from '@/components/neon/neon-text';

export const SecBox = ({
    children,
    title,
    color = '--color-purple-500',
}: {
    children: React.ReactNode;
    title: string;
    color?: string;
}) => (
    <div className='xl:mb-8 lg:mb-7 md:mb-6 mb-5  w-full'>
        <NeonText
            as='h4'
            className='h4-title mb-4'
            glowColor={color}
            glowSpread={0.4}
        >
            {title}
        </NeonText>
        {children}
    </div>
);
