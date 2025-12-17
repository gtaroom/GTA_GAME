import LegalWrapper from '../components/legal-wrapper';
import PDFViewer from '@/components/pdf-viewer';

const PrivacyPolicy = () => {
    return (
        <LegalWrapper
            title='Privacy Policy'
            description='Golden Ticket Online Arcade and Casino ("we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and disclose your information when you use our online arcade and casino platform ("Platform").'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <PDFViewer 
                    src="/legal/privacy-policy.pdf" 
                    title="Privacy Policy"
                    className="min-h-[600px]"
                />
            </div>
        </LegalWrapper>
    );
};

export default PrivacyPolicy;
