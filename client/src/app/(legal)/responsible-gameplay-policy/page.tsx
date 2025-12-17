import LegalWrapper from '../components/legal-wrapper';
import PDFViewer from '@/components/pdf-viewer';

const ResponsibleGameplayPolicy = () => {
    return (
        <LegalWrapper
            title='Responsible Gameplay Policy'
            description='At Golden Ticket Online Arcade and Casino, we are committed to fostering a safe, responsible, and enjoyable gaming environment. Please review our Responsible Gameplay Policy below.'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <PDFViewer 
                    src="/legal/responsible-gameplay-policy.pdf" 
                    title="Responsible Gameplay Policy"
                    className="min-h-[600px]"
                />
            </div>
        </LegalWrapper>
    );
};

export default ResponsibleGameplayPolicy;
