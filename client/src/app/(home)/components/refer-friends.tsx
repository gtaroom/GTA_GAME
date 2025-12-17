'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';

const ReferFriends = () => {
    const { md } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <section className='pb-25'>
            <div className='container-xl'>
                <NeonBox className="flex-col lg:flex-row flex w-full items-center gap-10 rounded-[20px] bg-[url('/home-page-logged-out/refer-friends-bg.jpg')] bg-cover bg-center bg-no-repeat py-2 px-4 lg:ps-5 lg:pe-20">
                    <Image
                        src='/home-page-logged-out/refer-friends-img.png'
                        alt='Refer Friends Background'
                        height={510}
                        width={510}
                        className='float-y float-y-fast float-y-sm -mt-28 md:-mt-32 lg:-mt-40 aspect-square  max-md:max-w-[260px] md:w-[380px] lg:w-[375px] xl:w-[510px]'
                    />

                    <div className='flex flex-col items-start text-center lg:text-left pb-8 md:pt-0 lg:py-10'>
                        <NeonText
                            as='h2'
                            className='h1-title mb-6 max-w-[590px]'
                        >
                            REFER A FRIEND AND <br className='max-xs:hidden' />
                            EARN BONUS REWARDS
                        </NeonText>
                        <ButtonGroup className='gap-4 md:gap-6 justify-center lg:justify-start max-lg:w-full flex-wrap'>
                            <Button
                                size={md ? 'xl' : 'lg'}
                                className={`${md ? 'w-[240px]' : 'w-[180px]'}`}
                                onClick={() => router.push('/register')}
                            >
                                Register{' '}
                            </Button>
                            <Button
                                variant='secondary'
                                size={md ? 'xl' : 'lg'}
                                className={`${md ? 'w-[240px]' : 'w-[180px]'}`}
                                onClick={() => router.push('/refer-friend')}
                            >
                                Learn More
                            </Button>
                        </ButtonGroup>
                    </div>
                </NeonBox>
            </div>
        </section>
    );
};

export default ReferFriends;
