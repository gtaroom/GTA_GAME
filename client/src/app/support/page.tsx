import MotionInView from '@/components/motion/motion-in-view';
import PageBanner from '@/components/page-banner';
import GetHelp from './components/get-help';
import SpecializedSupport from './components/specialized-support';
import SupportTiels from './components/support-tiels';

function Support() {
    return (
        <>
            <MotionInView>
                <PageBanner
                    title='Support Center'
                    description="We're here to help you 24/7. Get instant assistance, find answers to your questions, or connect with our expert support team."
                    className='mb-14'
                    bgImage='/page-banner/support.avif'
                />
            </MotionInView>
            <MotionInView>
                <SupportTiels />
            </MotionInView>
            <MotionInView>
                <GetHelp />
            </MotionInView>
            <MotionInView>
                <SpecializedSupport />
            </MotionInView>
        </>
    );
}

export default Support;
