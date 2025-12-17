import NeonText from '@/components/neon/neon-text';
import type { RichContentSection } from '@/types/content.types';
export const SMSTermsData: RichContentSection[] = [
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Program Overview
            </NeonText>
        ),
        description: (
            <ul>
                <li>
                    <NeonText as='p' className='h6-title'>
                        Program Name: GTOA Account Notifications
                    </NeonText>
                </li>
                <li>
                    <NeonText as='p' className='h6-title'>
                        Purpose: This program provides account-related SMS
                        notifications only. By creating a GTOA account and
                        providing your mobile number, you agree to receive SMS
                        strictly related to your account. These are not
                        marketing or promotional messages.
                    </NeonText>
                </li>
            </ul>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Message Types:
            </NeonText>
        ),
        description: (
            <>
                <ul>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Account creation confirmations
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Phone number verification codes
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Password change confirmations
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Verification/KYC status updates
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Purchase receipts
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Redemption status updates
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='p' className='h6-title'>
                            Security or important account alerts
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Opt-In Method:
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    You consent when you:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Create a GTOA account and provide your mobile number
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Check the box agreeing to SMS Terms during
                            registration or in your profile settings
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Opt-Out & Help:
            </NeonText>
        ),
        description: (
            <>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Opt-Out: Reply STOP to cancel at any time.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Help: Reply HELP or contact support.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Additional Information:
            </NeonText>
        ),
        description: (
            <>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Frequency: Varies based on account activity.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Fees: Message/data rates may apply.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Scope: U.S. only. Must be the account holder or have
                            account holder’s permission.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Privacy Policy:
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='span' className='h6-title'>
                    See Privacy Policy for data handling.
                </NeonText>
            </>
        ),
    },
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Contact Information:
            </NeonText>
        ),
        description: (
            <ul>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Email Support: support@gtoarcade.com
                    </NeonText>
                </li>
                <li>
                    <NeonText as='span' className='h6-title'>
                        Office Address: 2186 Jackson Keller Rd, Suite 2269, San
                        Antonio, TX 78213
                    </NeonText>
                </li>
            </ul>
        ),
    },
];
