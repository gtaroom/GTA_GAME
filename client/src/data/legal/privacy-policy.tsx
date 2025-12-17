import NeonText from '@/components/neon/neon-text';
import { Link } from 'next-transition-router';
export const PrivacyPolicyData = [
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                1. Information We Collect
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='h3' className='h5-title mb-2'>
                    1.1 Information You Provide to Us
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Account Information: Name, email, username, date of
                            birth, phone number, mailing address, and password
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Identity Verification: Government-issued ID and
                            proof of address during redemption
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Payment & Redemption: Billing details and
                            third-party payment provider information
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Support & Communication: Messages, emails, and
                            customer support inquirie
                        </NeonText>
                    </li>
                </ul>
                <NeonText as='h3' className='h5-title'>
                    1.2 Information We Collect Automatically
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Device & Usage Data: IP address, device ID, browser
                            type, operating system, login timestamps
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Gameplay Activity: Games played, session duration,
                            transaction history
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Cookies & Tracking: Cookies, pixel tags, and
                            analytics tools
                        </NeonText>
                    </li>
                </ul>
                <NeonText as='h3' className='h5-title'>
                    1.3 Information from Third Parties
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Third-Party Games & Services: Data shared by game
                            providers and payment processors
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Social Media & Referrals: Data from social media
                            interactions and referral programs
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                2. How We Use Your Information
            </NeonText>
        ),
        description: (
            <>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Service Delivery & Improvements: Manage accounts,
                            process transactions, provide support
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Legal Compliance: Verify age and enforce responsible
                            gaming policies
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Security: Monitor activity and prevent unauthorized
                            access or fraud
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Marketing: Send updates and promotional content (you
                            may opt-out at any time)
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Analytics: Analyze trends and personalize your
                            experience
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                3. How We Share Your Information
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h5-title mb-2'>
                    We do not sell or rent your personal information.
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Service Providers: For payments, ID verification,
                            and customer support
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Legal Authorities: When required by law or to
                            enforce terms and policies
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Marketing Partners: Anonymized data, only with your
                            consent
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                4. DATA STORAGE & SECURITY
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h5-title mb-2'>
                    We implement industry-standard security measures to protect
                    your data
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            All payment transactions are encrypted
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Secure third-party payment processors
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Two-factor authentication (2FA) recommended
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                5. YOUR CHOICES & RIGHTS
            </NeonText>
        ),
        description: (
            <ul className='mt-2 mb-6 list-disc pl-6'>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Access & Update: Review or update your account details
                        in profile settings
                    </NeonText>
                </li>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Opt-Out of Marketing: Unsubscribe via email links
                    </NeonText>
                </li>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Account Deletion: Contact support for account removal
                    </NeonText>
                </li>
            </ul>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                6. THIRD-PARTY SERVICES
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h5-title mb-2'>
                    Important Notice About Third-Party Services
                </NeonText>
                <ul className='mt-2 mb-6 list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            We are not responsible for third-party services
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Review third-party preivacy policies before use
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            External payment processors handle all transactions
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                7. CHILDREN'S PRIVACY
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h5-title mb-2'>
                    Our Platform is not intended for individuals under 21. We do
                    not knowingly collect data from minors.
                </NeonText>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                8. CHANGES TO PRIVACY POLICY
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h5-title mb-2'>
                    We may update this policy periodically. Significant changes
                    will be notified via email or platform announcements.
                </NeonText>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                9. CONTACT INFORMATION
            </NeonText>
        ),
        description: (
            <ul className='list-none'>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Email :-{' '}
                        <Link
                            href='mailto:support@gtoarcade.com'
                            title='support@gtoarcade.com'
                        >
                            support@gtoarcade.com
                        </Link>
                    </NeonText>
                </li>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Address :-{' '}
                        <Link
                            href='https://maps.app.goo.gl/jzfjyUcDUupTm1jXA'
                            title='2186 Jackson Keller Rd Suite 2269 San Antonio, TX 78213'
                            target='_blank'
                        >
                            2186 Jackson Keller Rd Suite 2269 San Antonio, TX
                            78213
                        </Link>
                    </NeonText>
                </li>
            </ul>
        ),
    },
];
