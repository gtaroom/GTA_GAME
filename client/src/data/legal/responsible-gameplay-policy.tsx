import NeonText from '@/components/neon/neon-text';
import { Link } from 'next-transition-router';
export const ResponsibleGameplayPolicyData = [
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Our Commitment to Responsible Gaming
            </NeonText>
        ),
        description: (
            <NeonText as='p' className='h6-title'>
                We recognize the importance of responsible gaming and provide
                tools, resources, and support to help players manage their
                gaming experience effectively.
            </NeonText>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Responsible Gameplay Guidelines
            </NeonText>
        ),
        description: (
            <>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Play for Entertainment – Gaming should be a form of
                            entertainment, not a way to generate income.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Set Limits – Establish clear time and spending
                            limits before playing, and adhere to them. Avoid
                            attempting to recover losses.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Maintain a Healthy Balance – Ensure that gaming does
                            not interfere with your responsibilities,
                            relationships, or well-being.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Recognize the Signs of Problem Gaming – If gaming
                            causes financial difficulties, stress, or affects
                            personal relationships, consider taking a break.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Age Restrictions – Our platform is strictly for
                            individuals who meet the legal age requirements in
                            their jurisdiction.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Responsible Gaming Tools
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    To support responsible gameplay, we offer the following
                    features:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Self-Assessment – Evaluate your gaming habits
                            through our self-assessment tool.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Cool-Off Periods – Temporarily restrict access to
                            your account if you need a break from gaming.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Deposit and Spending Limits – Set limits on your
                            account to help manage your spending and gameplay
                            duration.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Self-Exclusion – Opt for a longer exclusion period
                            if you need extended time away from the platform.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Support and Assistance
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    If you or someone you know is struggling with gaming-related
                    concerns, professional support is available. We encourage
                    players to seek help from reputable organizations,
                    including:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            National Council on Problem Gambling (NCPG) –
                            <Link
                                href='www.ncpgambling.org'
                                target='_blank'
                                className='underline'
                            >
                                www.ncpgambling.org
                            </Link>
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Gamblers Anonymous –
                            <Link
                                href='www.gamblersanonymous.org'
                                target='_blank'
                                className='underline'
                            >
                                www.gamblersanonymous.org
                            </Link>
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Responsible Gambling Council –
                            <Link
                                href='www.responsiblegambling.org'
                                target='_blank'
                                className='underline'
                            >
                                www.responsiblegambling.org
                            </Link>
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },
];
