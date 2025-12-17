// import clsx from 'clsx';
import LegalWrapper from '../components/legal-wrapper';
// import NeonText from '@/components/neon/neon-text';
import { AccessibilityStatementData } from '@/data/legal/accessibility-statement';
const PrivacyPolicy = () => {
    return (
        <LegalWrapper
            title='Accessibility Statement'
            description='At Golden Ticket Online Arcade and Casino, we are committed to ensuring our platform is accessible to all users, regardless of ability or disability.'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <div className='legal-content-list space-y-8 md:space-y-10'>
                    {AccessibilityStatementData.map((v, i) => (
                        <div key={i} className='space-y-5'>
                            {v.title}
                            {v.description}
                        </div>
                    ))}
                </div>
            </div>
        </LegalWrapper>
    );
};

export default PrivacyPolicy;
