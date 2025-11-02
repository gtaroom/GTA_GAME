'use client';
import { Button } from '@/components/ui/button';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { Link, useTransitionRouter } from 'next-transition-router';
import Image from 'next/image';
import AboutUsSec from './about-us-sec';
export default function NeedHelp() {
    const { md } = useBreakPoint();

    const router = useTransitionRouter();

    const contactInfo = [
        {
            image: '/social-icons/mail.svg',
            label: 'support@gtoarcade.com',
            link: 'mailto:support@gtoarcade.com',
        },
        {
            image: '/social-icons/website.svg',
            label: 'gtoarcade.com',
            link: 'https://gtoarcade.com',
        },
    ];

    return (
        <>
            <AboutUsSec
                title='Need Help?'
                description='If you have questions or need assistance, our support team is here for you:'
                img='/about-us/need-help.png'
                color='--color-green-500'
                imgPosition='right-side'
                bottomContent={
                    <div className='flex flex-col md:items-start items-center gap-5 mt-4 mb-5'>
                        <ul className='space-y-3'>
                            {contactInfo.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        href={item.link}
                                        title={item.label}
                                        className='h5-title hover:underline underline-offset-6 inline-flex gap-4 items-center max-md:flex-col'
                                    >
                                        <Image
                                            src={item.image}
                                            height={30}
                                            width={30}
                                            alt={item.label}
                                            className='w-[42px] aspect-square'
                                        />

                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Button
                            size={md ? 'lg' : 'md'}
                            onClick={() => window.open('https://assistcentral.net/livechat', '_blank', 'noopener,noreferrer')}
                        >
                            Live Support
                        </Button>
                    </div>
                }
            />
        </>
    );
}
