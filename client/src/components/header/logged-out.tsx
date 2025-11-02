'use client';
import SiteLogo from '@/components/site-logo';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useUI } from '@/contexts/ui-context';
import { headerLinks } from '@/data/links';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { toggleBodyScroll } from '@/lib/toggle-body-scroll';
import { cn } from '@/lib/utils';
import Hamburger from 'hamburger-react';
import { Link, useTransitionRouter } from 'next-transition-router';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import VIPprogramBtn from '../vip-program-btn';

type MenuLinkProps = {
    title: string;
    href: string;
    isActive: boolean;
    size: 'base' | 'xl';
    onClick?: () => void;
};

const MenuLink = ({ title, href, isActive, size, onClick }: MenuLinkProps) => {
    const baseClass = size === 'xl' ? 'text-xl' : 'text-base';
    return (
        <Link
            href={href}
            title={title}
            onClick={onClick}
            className={cn(
                'tracking-common relative font-bold capitalize',
                baseClass,
                'before:absolute before:-bottom-[8px] before:left-1/2 before:h-0 before:w-0',
                'before:-translate-x-1/2 before:rounded-[10px] before:border before:border-transparent',
                "before:bg-transparent before:transition-all before:duration-400 before:content-['']",
                'hover:before:w-full hover:before:border-white',
                'hover:before:shadow-[0_0_6px_var(--color-purple-500),0_0_12px_var(--color-purple-500),0_0_18px_var(--color-purple-500),inset_0_0_6px_var(--color-purple-500)]',
                isActive &&
                    'before:w-full before:border-white before:shadow-[0_0_6px_var(--color-purple-500),0_0_12px_var(--color-purple-500),0_0_18px_var(--color-purple-500),inset_0_0_6px_var(--color-purple-500)]'
            )}
        >
            {title}
        </Link>
    );
};

const HeaderLoggedOut = ({
    headerRef,
}: {
    headerRef: React.Ref<HTMLDivElement>;
}) => {
    // Replace local useState with context
    const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUI();
    const router = useTransitionRouter();
    const pathname = usePathname();
    const { xl, lg, md, sm } = useBreakPoint();
    const btnSize = xl ? 'lg' : sm ? 'md' : 'sm';

    // Update useEffect to use context state
    useEffect(() => {
        if (!xl) {
            toggleBodyScroll(mobileMenuOpen);
        } else {
            toggleBodyScroll(false);
        }
    }, [mobileMenuOpen, xl]);

    return (
        <header
            ref={headerRef}
            className='absolute top-0 right-0 z-40 w-full pt-[clamp(1.5rem,_1.325rem_+_0.875vw,_2.375rem))]'
        >
            <div className='container-header-logged-out'>
                <div className='flex items-center justify-start w-full'>
                    {md && !lg && (
                        <div className='-ml-1.5 mr-6'>
                            <Hamburger
                                toggled={mobileMenuOpen}
                                toggle={toggleMobileMenu}
                                size={30}
                            />
                        </div>
                    )}
                    <SiteLogo className='lg:max-w-[118px] max-w-[80px] sm:-ml-2 ml-0 -mt-1' />

                    {/* Desktop nav */}
                    {lg && (
                        <nav className='ms-auto flex justify-end w-full'>
                            <ul className='inline-flex items-center justify-center 2xl:gap-[54px] xxl:gap-10 gap-8 max-xl:[&>li]:last:hidden'>
                                {headerLinks.map(link => (
                                    <li key={link.href}>
                                        <MenuLink
                                            title={link.title}
                                            href={link.href || '#'}
                                            isActive={pathname === link.href}
                                            size='base'
                                        />
                                    </li>
                                ))}
                            </ul>
                            <VIPprogramBtn className='2xl:ml-[50px] xxl:ml-[40px] xl:ml-[32px] ml-[24px] max-lg:ml-0 w-full 2xl:max-w-[260px] xxl:max-w-[240px] xl:max-w-[220px] max-w-[200px] ' />
                        </nav>
                    )}

                    {/* Mobile menu overlay */}
                    {!lg && (
                        <nav
                            className={cn(
                                'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#310A47]/70 backdrop-blur-xl transition-transform duration-300',
                                mobileMenuOpen
                                    ? 'translate-x-0'
                                    : '-translate-x-full'
                            )}
                        >
                            <div className='absolute top-6 right-6'>
                                <Hamburger
                                    toggled={mobileMenuOpen}
                                    toggle={toggleMobileMenu}
                                    size={24}
                                    color='#FFFFFF'
                                />
                            </div>
                            <ul className='space-y-8 text-center'>
                                {headerLinks.map(link => (
                                    <li key={link.href}>
                                        <MenuLink
                                            title={link.title}
                                            href={link.href || '#'}
                                            isActive={pathname === link.href}
                                            size='xl'
                                            onClick={closeMobileMenu}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className='mt-8' onClick={closeMobileMenu}>
                                <VIPprogramBtn className='max-lg:w-[240px]!' />
                            </div>
                        </nav>
                    )}

                    <div className='2xl:pl-[50px] xxl:pl-[40px] xl:pl-[32px] pl-[24px] max-lg:ml-auto'>
                        <ButtonGroup className='xl:gap-6 sm:gap-4 gap-3 flex-nowrap'>
                            <Button
                                size={btnSize}
                                className='xxl:w-[130px]'
                                onClick={() => router.push('/register')}
                            >
                                Register
                            </Button>
                            <Button
                                variant='secondary'
                                size={btnSize}
                                className='xxl:w-[130px]'
                                onClick={() => router.push('/login')}
                            >
                                Login
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderLoggedOut;
