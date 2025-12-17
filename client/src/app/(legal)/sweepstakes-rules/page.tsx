import LegalWrapper from '../components/legal-wrapper';
import PDFViewer from '@/components/pdf-viewer';

const SweepstakeRules = () => {
    return (
        <LegalWrapper
            title='Sweepstakes Rules'
            description='Learn how Golden Ticket Online Arcade and Casino offers free sweepstakes coins, eligibility requirements, and how players can participate in promotional play. All games follow AMOE (Alternate Means of Entry) rules ensuring fairness, transparency, and no real-money gambling.'
            className='mb-12 md:mb-20 xl:mb-25' // common margin for the legal wrapper box
        >
            <div className='legal-content-wp'>
                <PDFViewer 
                    src="/legal/sweepstake-rules.pdf" 
                    title="Sweepstakes Rules"
                    className="min-h-[600px]"
                />
            </div>
        </LegalWrapper>
    );
};

export default SweepstakeRules;
