// import clsx from 'clsx';
import { SMSTermsData } from '@/data/legal/sms-terms';
import LegalWrapper from '../components/legal-wrapper';
// import NeonText from '@/components/neon/neon-text';
const AgeVerificationPolicy = () => {
    return (
        <LegalWrapper
            title='SMS Terms Policy'
            className='mb-12 md:mb-20 xl:mb-25'
        >
            <div className='legal-content-wp'>
                <div className='legal-content-list space-y-10'>
                    {SMSTermsData.map((v: any, i: number) => (
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

export default AgeVerificationPolicy;
