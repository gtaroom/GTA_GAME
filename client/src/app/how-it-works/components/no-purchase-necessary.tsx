'use client';

import SweepstakesSpinModal from '@/components/modal/sweepstakes-spin';
import NeonBox from '@/components/neon/neon-box';
import NeonIcon from '@/components/neon/neon-icon';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';

export default function NoPurchaseNecessary() {
    const { md } = useBreakPoint();
    const router = useTransitionRouter();

    interface buttonCommonAttrProps {
        size: 'lg' | 'md';
        className: string;
    }

    const buttonCommonAttr: buttonCommonAttrProps = {
        size: md ? 'lg' : 'md',
        className: 'mt-auto w-full md:w-auto',
    };

    return (
        <section className='mb-14 md:mb-16'>
            <div className='container-xxl'>
                <NeonBox
                    className='p-6 lg:p-12 md:p-10 rounded-2xl backdrop-blur-2xl '
                    glowColor='--color-purple-500'
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.1}
                >
                    <div className='max-w-[800px] flex flex-col items-center text-center mx-auto'>
                        <NeonText as='h2' className='h2-title mb-3'>
                            No Purchase Necessary
                        </NeonText>
                        <NeonText
                            as='p'
                            className='text-base md:text-lg font-bold capitalize leading-6 md:leading-8 mb-5'
                            glowSpread={0.5}
                        >
                            Our Sweeps Coins (SC) system fully complies with
                            U.S. sweepstakes laws. Players can participate
                            without making a purchase through our free entry
                            methods.
                        </NeonText>
                        <ul className='text-start space-y-3 mb-8 md:mb-10'>
                            {[
                                'No purchase required to play',
                                'Redeem SC after meeting eligibility',
                                'Earn SC via entries, gameplay, or promos',
                            ].map(item => (
                                <li
                                    key={item}
                                    className='flex items-center gap-3.5'
                                >
                                    <NeonIcon
                                        icon='lucide:circle-check'
                                        size={md ? 26 : 20}
                                        // glowColor={category.color}
                                    />
                                    <NeonText
                                        as='p'
                                        className='text-base md:text-lg font-bold capitalize leading-6 md:leading-8'
                                        glowSpread={0.5}
                                    >
                                        {item}
                                    </NeonText>
                                </li>
                            ))}
                        </ul>
                        <ButtonGroup className='gap-4 md:gap-6'>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button {...buttonCommonAttr}>
                                        Free Entry Form
                                    </Button>
                                </DialogTrigger>
                                <SweepstakesSpinModal />
                            </Dialog>

                            {[
                                {
                                    text: 'Terms & Conditions',
                                    href: '/terms-conditions',
                                },
                                {
                                    text: 'AMOE FAQs',
                                    href: '/faqs',
                                },
                            ].map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => router.push(item.href)}
                                    {...buttonCommonAttr}
                                >
                                    {item.text}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </div>
                </NeonBox>
            </div>
        </section>
    );
}
