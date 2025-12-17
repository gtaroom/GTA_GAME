'use client';

import InfoLabel from '../info-label';
import { useAuth } from '@/contexts/auth-context';

export default function LocationDetails() {
    const { user } = useAuth();

    const accountInfo = [
        {
            icon: 'lucide:map',
            text: 'State',
            content: (
                <span className='truncate text-base font-semibold'>
                    {user?.state || 'Not provided'}
                </span>
            ),
        },
        {
            icon: 'lucide:building-2',
            text: 'Account Created',
            content: (
                <span className='text-base font-semibold'>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                </span>
            ),
        },
        {
            icon: 'lucide:map-pinned',
            text: 'Last Updated',
            content: (
                <span className='text-base font-semibold'>
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not available'}
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
