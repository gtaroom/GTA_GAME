'use client';

import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { featureTielsData } from '@/data/home-logged-out';
import { useBreakPoint } from '@/hooks/useBreakpoint';

const FeatureTiles = () => {
    const { xl } = useBreakPoint();

    return (
        <section className='pb-[calc(100px+40*(100vw-320px)/320)] md:pb-[170px]'>
            <div className='container-xl'>
                <div className={`row ${xl ? 'row-gap-32' : 'row-gap-16'}`}>
                    {featureTielsData.map(tile => {
                        const IconComponent = tile.icon.component;
                        return (
                            <div className='sm:col-6 lg:col-3' key={tile.title}>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            neon
                                            variant='neon'
                                            className='grid h-auto! w-full place-items-center xs:p-4 p-5 backdrop-blur-sm'
                                            neonBoxClass='rounded-[8px]'
                                            backgroundColor='--color-purple-500'
                                            backgroundOpacity={0.2}
                                        >
                                            <div className='inline-flex items-center justify-center gap-2 xs:flex-row flex-col'>
                                                <NeonIcon
                                                    glowColor={`var(--color-${tile.icon.color}-500)`}
                                                    glowLayers={1}
                                                    glowSpread={7}
                                                    className='motion-safe:motion-scale-loop-[1.06] motion-safe:motion-duration-2000 motion-safe:motion-ease-in-out-cubic'
                                                >
                                                    <IconComponent
                                                        className='xl:size-17.5! lg:size-10! md:size-12! max-sm:size-10!'
                                                        color={`var(--color-${tile.icon.color}-500)`}
                                                    />
                                                </NeonIcon>
                                                <h5 className='text-lg -mb-[2px] tracking-normal! capitalize! text-wrap xs:text-start text-center leading-6!'>
                                                    {tile.title}
                                                </h5>
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                        className='md:max-w-[680px]!'
                                        neonBoxClass='max-sm:pt-3 max-sm:px-0'
                                    >
                                        <ScrollArea type='always'>
                                            <div className='max-sm:px-4 px-2 py-2'>
                                                <DialogTitle
                                                    className='text-center max-sm:max-w-[235px] max-md:max-w-[245px] max-md:mx-auto'
                                                    asChild
                                                >
                                                    <NeonText
                                                        as='h4'
                                                        className='h3-title md:h4-title mb-3'
                                                    >
                                                        {tile.modal.title}
                                                    </NeonText>
                                                </DialogTitle>
                                                {tile.modal.content}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeatureTiles;