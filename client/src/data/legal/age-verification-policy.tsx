import NeonText from '@/components/neon/neon-text';
export const AgeVerificationPolicyData = [
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Minimum Age Requirement
            </NeonText>
        ),
        description: (
            <NeonText as='p' className='h6-title'>
                Participants must be at least 21 years old (or the legal age in
                their jurisdiction) to register and participate in games and
                sweepstakes on our platform. In certain jurisdictions, the
                minimum age may be 21 years or older due to local gaming
                regulations.
            </NeonText>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Restricted Jurisdictions
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    Participation is prohibited in any jurisdiction where
                    sweepstakes or social casino gaming is restricted or not
                    permitted by law. This includes, but is not limited to, the
                    following locations:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            United States: Washington, Connecticut, Idaho,
                            Michigan, Montana, Nevada, California, Louisiana, New Jersey.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Canada: Quebec
                        </NeonText>
                    </li>
                </ul>
                <NeonText as='p' className='h6-title'>
                    Players are responsible for understanding and complying with
                    all applicable laws in their jurisdiction before
                    participating. The company reserves the right to verify
                    eligibility, restrict access, or void participation at its
                    sole discretion to comply with legal and regulatory
                    requirements. Any attempt to bypass geographic restrictions
                    through VPNs, proxies, or other methods may result in
                    disqualification and forfeiture of winnings.
                </NeonText>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Identity and Age Verification
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    To ensure compliance, we conduct mandatory age verification
                    for all users. Players must provide one or more of the
                    following:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            A valid government-issued photo ID (e.g., driver’s
                            license, passport, or state/province-issued
                            identification card)
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            A recent utility bill or bank statement (if further
                            proof of residency is required)
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Underage Accounts and Violations
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    If an account is found to be registered by someone under the
                    legal age:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            The account will be immediately closed.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Any winnings or rewards will be forfeited.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Attempting to bypass age verification may result in
                            permanent account suspension and legal action.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Contact Information
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    For questions regarding age verification, please contact our
                    support team at{' '}
                    <a
                        href='mailto:support@gtoarcade.com'
                        className='underline'
                    >
                        support@gtoarcade.com
                    </a>
                    .
                </NeonText>
            </>
        ),
    },
];
