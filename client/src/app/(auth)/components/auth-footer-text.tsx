import { Link } from 'next-transition-router';
import * as React from 'react';

interface AuthFooterTextProps {
    text: string;
    link: { href: string; text: string };
}

const AuthFooterText: React.FC<AuthFooterTextProps> = ({ text, link }) => {
    return (
        text && (
            <div className='text-center'>
                <p className='text-sm lg:text-base font-extrabold'>
                    {text}{' '}
                    <Link title={link.text} href={link.href} className='underline'>
                        {link.text}
                    </Link>
                </p>
            </div>
        )
    );
};

export default AuthFooterText;
