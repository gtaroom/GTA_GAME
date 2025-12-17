'use client';
import { Link } from 'next-transition-router';
import { useAuth } from '@/contexts/auth-context';
import { ReactNode } from 'react';

interface SmartLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    [key: string]: any; // For other Link props
}

export default function SmartLink({ href, children, ...props }: SmartLinkProps) {
    const { isLoggedIn } = useAuth();
    
    // Smart routing: if href is '/' and user is logged in, go to '/lobby'
    const smartHref = (href === '/' && isLoggedIn) ? '/lobby' : href;
    
    return (
        <Link href={smartHref} {...props}>
            {children}
        </Link>
    );
}
