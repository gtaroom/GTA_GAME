import InfoLabel from '../info-label';
import ItemStatus from '../item-status';

export default function SocialConnect() {
    const accountInfo = [
        {
            icon: 'proicons:google',
            text: 'Google',
            content: (
                <ItemStatus
                    status='enable'
                    enableText='Connected'
                    disableText='Not Connected'
                />
            ),
        },
        {
            icon: 'lucide:facebook',
            text: 'Facebook',
            content: (
                <ItemStatus
                    status='enable'
                    enableText='Connected'
                    disableText='Not Connected'
                />
            ),
        },
        {
            icon: 'ri:apple-line',
            text: 'Apple',
            content: (
                <ItemStatus
                    status='disable'
                    enableText='Connected'
                    disableText='Link Account'
                    disableIcon='lucide:external-link'
                />
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
