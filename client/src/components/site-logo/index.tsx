import { Link } from 'next-transition-router';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';

import { cn } from '@/lib/utils';
const SiteLogo = ({
    className,
    clickable = true,
}: {
    className?: string;
    clickable?: boolean;
}) => {
    const { isLoggedIn } = useAuth();
    
    // Smart routing: logged-in users go to lobby, others stay on home
    const logoHref = isLoggedIn ? '/lobby' : '/';
    
    return (
        <>
            <Link
                href={logoHref}
                title='Golden Ticket'
                {...(!clickable && { className: 'pointer-events-none' })}
            >
                <Image
                    src='/logos/golden-ticket.png'
                    width={200}
                    height={200}
                    alt='Golden Ticket Logo'
                    className={cn('h-auto', className)}
                />
            </Link>
        </>
    );
};

export default SiteLogo;
