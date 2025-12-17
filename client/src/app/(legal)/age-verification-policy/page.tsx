import LegalWrapper from '../components/legal-wrapper';
import PDFViewer from '@/components/pdf-viewer';

const AgeVerificationPolicy = () => {
    return (
        <LegalWrapper
            title='Age Verification Policy'
            description='To maintain a safe and legally compliant environment, Golden Ticket Online Arcade and Casino requires all users to verify their age and identity. Learn about our minimum age requirements, restricted jurisdictions, and verification process.'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <PDFViewer 
                    src="/legal/age-verification-policy.pdf" 
                    title="Age Verification Policy"
                    className="min-h-[600px]"
                />
            </div>
        </LegalWrapper>
    );
};

export default AgeVerificationPolicy;
