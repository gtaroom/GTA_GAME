import UserDetailBox from '../user-detail-box';
import AccountDetails from './account-details';
import LocationDetails from './location-details';
import PersonalInfo from './personal-info';
import ReferralEarning from './referral-earning';
import SocialConnect from './social-connect';
import SubscriptionDetails from './subscription-details';

export default function UserDetailInfo() {
    const userDetailInfoData = [
        {
            title: 'Account Details',
            icon: 'lucide:circle-alert',
            color: '--color-red-500',
            content: <AccountDetails />,
        },
        {
            title: 'Personal Information',
            icon: 'lucide:user',
            color: '--color-sky-500',
            content: <PersonalInfo />,
        },
        {
            title: 'Location Details',
            icon: 'lucide:map-pin',
            color: '--color-green-500',
            content: <LocationDetails />,
        },
         {
            title: 'Marketing Consent',
            icon: 'lucide:bell',
            color: '--color-lime-500',
            content: <SubscriptionDetails />,
        },
        // {
        //     title: 'Referral Earning',
        //     icon: 'lucide:hand-coins',
        //     color: '--color-yellow-500',
        //     content: <ReferralEarning />,
        // },
        // {
        //     title: 'Social Connect',
        //     icon: 'lucide:hash',
        //     color: '--color-pink-500',
        //     content: <SocialConnect />,
        // },
    ];

    return (
        <section className='relative z-[2] mb-8'>
            <div className='grid lg:grid-cols-2 grid-cols-1 gap-8 '>
                {userDetailInfoData.map((item, index) => (
                    <UserDetailBox
                        key={index}
                        title={item.title}
                        icon={item.icon}
                        color={item.color}
                    >
                        {item.content}
                    </UserDetailBox>
                ))}
            </div>
        </section>
    );
}
