import Image from 'next/image';
import InfoLabel from '../info-label';

export default function ReferralEarning() {
    const accountInfo = [
        {
            icon: 'lucide:coins',
            text: 'Referral Earning SC',
            content: (
                <div className='inline-flex items-center gap-2'>
                    <Image
                        src='/coins/sweep-coin.svg'
                        height={20}
                        width={20}
                        alt='Sweep Coin'
                        className='w-[20px] aspect-square'
                    />
                    <span className='truncate text-base font-extrabold text-green-400'>
                        20,000
                    </span>
                </div>
            ),
        },
        {
            icon: 'lucide:user-check',
            text: 'Number Of Referral',
            content: <span className='text-base font-semibold'>50</span>,
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
