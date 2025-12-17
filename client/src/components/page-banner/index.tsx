import { cn } from '@/lib/utils';
import NeonBox from '../neon/neon-box';
import NeonText from '../neon/neon-text';

export default function PageBanner({
    title,
    description,
    bgImage,
    bottomContent,
    className,
}: {
    title: string;
    description?: string;
    bgImage: string;
    bottomContent?: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn(className)}>
            <div className='container-xxl'>
                <NeonBox
                    className='px-[24px] py-[24px] xl:py-[70px] md:py-[50px] rounded-2xl flex flex-col items-center text-center bg-cover bg-center bg-norepeat'
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
                    }}
                >
                    <div className='max-w-[1000px]'>
                        {title && (
                            <NeonText as='h1' className='h1-title mb-2'>
                                {title}
                            </NeonText>
                        )}
                        {description && (
                            <p
                                className={cn(
                                    'text-lg font-bold',
                                    bottomContent && 'mb-6'
                                )}
                            >
                                {description}
                            </p>
                        )}
                        {bottomContent && bottomContent}
                    </div>
                </NeonBox>
            </div>
        </section>
    );
}
