import NeonText from '@/components/neon/neon-text';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function AboutUsSec({
    title,
    description,
    color,
    img,
    imgPosition = 'left-side',
    bottomContent,
    className = 'mb-14 md:mb-16',
}: {
    title: string;
    description: string;
    color: string;
    img: string;
    imgPosition?: 'left-side' | 'right-side';
    bottomContent?: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={className}>
            <div className='container-xxl'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center'>
                    <div
                        className={cn(
                            'max-md:text-center',
                            imgPosition !== 'right-side'
                                ? 'order-2'
                                : 'max-md:order-2'
                        )}
                    >
                        {title && (
                            <NeonText
                                as='h2'
                                glowColor={color}
                                className='h2-title mb-2'
                            >
                                {title}
                            </NeonText>
                        )}
                        {description && (
                            <p className='text-base lg:text-lg font-semibold leading-6 lg:leading-8'>
                                {description}
                            </p>
                        )}
                        {bottomContent && bottomContent}
                    </div>
                    <div className='relative grid place-items-center'>
                        <Image
                            src={img}
                            height={400}
                            width={400}
                            alt={title}
                            className='scale-pulse aspect-square md:w-[400px] w-[300px] scale-pulse-xs scale-pulse-normal'
                        />
                        <div
                            className='absolute left-1/2 top-1/2 aspect-square w-[200px] md:w-[260px] rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-[1] blur-[100px]'
                            style={{ backgroundColor: `var(${color})` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
