'use client';

import InfoLabel from '../info-label';
import Verified from '../verified';
import { useAuth } from '@/contexts/auth-context';

export default function PersonalInfo() {
    const { user } = useAuth();

    const accountInfo = [
        {
            icon: 'lucide:mail',
            text: 'Email',
            content: (
                <span className='truncate text-base font-semibold'>
                    {user?.email || 'Not provided'}
                </span>
            ),
        },
        {
            icon: 'lucide:phone-call',
            text: 'Phone',
            content: (
                <span className='text-base font-semibold'>
                    {user?.phone || 'Not provided'}
                </span>
            ),
        },
        {
            icon: 'lucide:log-in',
            text: 'KYC Status',
            content: <Verified verified={user?.isKYC || false} />,
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
