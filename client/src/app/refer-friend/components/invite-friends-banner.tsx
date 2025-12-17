'use client';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import Image from 'next/image';

export default function InviteFriendsBanner({
    isLoggedIn,
}: {
    isLoggedIn?: boolean;
}) {
    const { lg, md } = useBreakPoint();

    const CoinBox = ({ type, amount }: { type?: string; amount: string }) => (
        <div className='inline-flex gap-2'>
            {' '}
            <Image
                src={`/coins/${type == 'sweep-coin' ? 'sweep' : 'gold'}-coin.svg`}
                height={md ? '32' : '26'}
                // height={32}
                width={md ? '32' : '26'}
                alt=''
            />{' '}
            <span
                className={`${type == 'sweep-coin' ? 'text-green-400' : 'text-yellow-300'}`}
            >
                {amount}
            </span>
        </div>
    );

    return (
        <section className='mb-30 max-lg:mb-20'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <div className='grid grid-cols-1 md:grid-cols-2 max-md:gap-5 items-center'>
                    <div className="w-full aspect-[1.4/1] relative before:absolute before:content-[''] before:inset-0 before:shadow-[inset_0px_0px_50px_35px_rgba(49,10,71,1)] md:before:shadow-[inset_0px_0px_80px_70px_rgba(49,10,71,1)] lg:before:shadow-[inset_0px_0px_140px_110px_rgba(49,10,71,1)]">
                        <Image
                            src='/refer-friend/banner-img.jpg'
                            height={800}
                            width={800}
                            className='w-full h-full object-cover'
                            alt='Refer A friend'
                        />
                    </div>
                    <div className=" bg-cover bg-center bg-no-repeat h-full place-items-center grid shadow-[inset_0px_0px_100px_60px_rgba(49,10,71,1)] bg-[url('/refer-friend/banner-bg.jpg')]">
                        <div className='text-center flex flex-col items-center max-w-[600px] max-lg:py-10 max-md:py-0'>
                            <NeonText as='h1' className='h1-title mb-4'>
                                Invite friends
                            </NeonText>
                            <NeonText
                                as='p'
                                className='h4-title capitalize mb-6 md:mb-8'
                                glowSpread={0.5}
                            >
                                Earn rewards for every friend you bring onboard
                            </NeonText>
                            <div className='inline-flex max-md:flex-col items-center gap-2 md:gap-5 [&_span]:text-h2-title [&_span]:font-extrabold [&_span]:leading-none mb-7 md:mb-9'>
                                <CoinBox amount='20,000' />
                                <span>&</span>
                                <CoinBox type='sweep-coin' amount='462.62' />
                            </div>
                            <ButtonGroup className='gap-5'>
                                <Button size={lg ? 'lg' : 'md'}>
                                    Open QR Code
                                </Button>
                                <Button
                                    size={lg ? 'lg' : 'md'}
                                    variant='secondary'
                                >
                                    Copy Invite Link
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
