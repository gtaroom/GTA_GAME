import NeonText from '@/components/neon/neon-text';
export const AccessibilityStatementData = [
    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Our Commitment to Accessibility
            </NeonText>
        ),
        description: (
            <NeonText as='p' className='h6-title'>
                We strive to provide an inclusive and user-friendly experience
                that allows everyone to enjoy our games and services.
            </NeonText>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Accessibility Features
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    To enhance accessibility, we have implemented the following
                    features:
                </NeonText>
                <ul className='list-disc pl-6'>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Keyboard Navigation – Our website is designed to be
                            navigable using a keyboard.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Screen Reader Compatibility – We ensure
                            compatibility with screen readers and assistive
                            technologies.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Simplified Layout and Clear Labels – We maintain a
                            clear and intuitive design with descriptive labels.
                        </NeonText>
                    </li>
                    <li>
                        <NeonText as='span' className='h6-title'>
                            Alternative Text for Images – We provide alternative
                            text descriptions for key images.
                        </NeonText>
                    </li>
                </ul>
            </>
        ),
    },

    {
        title: (
            <NeonText as='h2' className='h3-title'>
                Feedback and Support
            </NeonText>
        ),
        description: (
            <>
                <NeonText as='p' className='h6-title'>
                    <span>We welcome feedback on our accessibility efforts. If you
                    experience difficulties accessing any part of our platform,
                    please contact us at </span>
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
