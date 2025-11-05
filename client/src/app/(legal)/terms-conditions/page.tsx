import PDFViewer from '@/components/pdf-viewer';
import LegalWrapper from '../components/legal-wrapper';

const TermsConditions = () => {
    return (
        <LegalWrapper
            title='Terms & Conditions'
            description='Review the official Terms and Promotional Rules for Golden Ticket Online Arcade and Casino. Learn about eligibility, gameplay regulations, reward redemptions, and your rights as a participant. No purchase necessary to play or win.'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <PDFViewer
                    src='/legal/terms-conditions.pdf'
                    title='Terms & Conditions'
                    className='min-h-[600px]'
                />
            </div>
        </LegalWrapper>
    );
};

export default TermsConditions;
