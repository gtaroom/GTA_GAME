'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';

const SpinWheelSection = () => {
    const { md } = useBreakPoint();
    return (
        <section className=' pb-16 sm:pb-20 md:pb-25'>
            <div className='container-xl'>
                <NeonBox className="flex flex-col-reverse lg:flex-row w-full items-center gap-10 rounded-[20px] bg-[url('/home-page-logged-out/spin-wheel-bg.jpg')] bg-cover bg-center bg-no-repeat max-lg:py-2! max-lg:px-4! ps-16 pe-10">
                    <div className='flex flex-col items-start lg:pt-6 pb-8 text-center lg:text-left'>
                        <NeonText as='h2' className='h1-title mb-6'>
                            Spin the Wheel & Win Bonus Coins! Unlock spins as
                            you level up.
                        </NeonText>

                        <ButtonGroup className='gap-4 md:gap-6 justify-center lg:justify-start max-lg:w-full flex-wrap'>
                            <Button
                                variant='secondary'
                                size={md ? 'xl' : 'lg'}
                                className={`${md ? 'w-[200px]' : 'w-[160px]'}`}
                            >
                                Learn More
                            </Button>
                        </ButtonGroup>
                    </div>
                    <Image
                        src='/home-page-logged-out/spin-wheel-img.png'
                        alt='Refer Friends Background'
                        height={510}
                        width={510}
                        className='flex-grow flex-shrink-0 basis-auto float-y float-y-fast float-y-sm -mt-40 aspect-square w-full max-md:max-w-[260px] md:w-[380px] lg:w-[375px] xl:w-[510px]'
                    />
                </NeonBox>
            </div>
        </section>
    );
};

export default SpinWheelSection;
