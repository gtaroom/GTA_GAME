'use client';

import InfoLabel from '../info-label';
import Verified from '../verified';
import { useAuth } from '@/contexts/auth-context';

export default function AccountDetails() {
    const { user } = useAuth();

    const accountInfo = [
        {
            icon: 'lucide:square-user-round',
            text: 'User ID',
            content: (
                <span className='truncate text-base font-semibold'>
                    {user?._id || 'Not available'}
                </span>
            ),
        },
        { 
            icon: 'lucide:mail', 
            text: 'Email Status', 
            content: <Verified verified={user?.isEmailVerified || false} /> 
        },
        {
            icon: 'lucide:phone-call',
            text: 'Phone Status',
            content: <Verified verified={user?.isPhoneVerified || false} />,
        },
        {
            icon: 'lucide:log-in',
            text: 'Login Type',
            content: (
                <span className='uppercase font-semibold'>
                    {user?.loginType || 'EMAIL_PASSWORD'}
                </span>
            ),
        },
    ];

    return (
        <>
            {accountInfo.map(({ icon, text, content }, index) => (
                <li key={index}>
                    <InfoLabel icon={icon} text={text} />
                    {content}
                </li>
            ))}
        </>
    );
}
