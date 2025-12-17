'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { useBreakPoint } from '@/hooks/useBreakpoint';

export default function UserDetailBox({
    children,
    title,
    icon = 'lucide:circle',
    color,
}: {
    children: React.ReactNode;
    title: string;
    icon: string;
    color: string;
}) {
    const { sm, lg } = useBreakPoint();
    return (
        <NeonBox
            className='lg:p-7 p-5 rounded-lg backdrop-blur-2xl'
            glowSpread={0.5}
            glowColor={color}
            backgroundColor={color}
            backgroundOpacity={0.1}
        >
            <div className='flex items-center gap-4 mb-6'>
                <NeonIcon
                    icon={icon}
                    glowColor={color}
                    size={lg ? 40 : sm ? 30 : 24}
                />
                <NeonText
                    as='h5'
                    className='h5-title'
                    glowColor={color}
                    glowSpread={sm ? 0.4 : 0.2}
                >
                    {title}
                </NeonText>
            </div>
            {/* <ul className='flex flex-wrap items-normal justify-between gap-x-2 gap-y-5 lg:[&>li:not(:last-child)]:border-r lg:[&>li]:border-white/30 [&>li]:pr-5 [&>li]:mr-5 [&>li]:flex [&>li]:flex-col [&>li]:items-start [&>li]:gap-3 [&>li]:flex-1'> */}
            <ul className='flex flex-wrap items-normal justify-between gap-x-2 gap-y-5 xs:[&>li]:pr-5 xs:[&>li]:mr-5 [&>li]:flex [&>li]:flex-col [&>li]:items-start [&>li]:gap-3 [&>li]:flex-1'>
                {children}
            </ul>
        </NeonBox>
    );
}
