import PageBanner from '@/components/page-banner';
import HowWeOperate from './components/how-we-operate';
import NeedHelp from './components/need-help';
import NoPurchase from './components/no-purchase';
import OurCommitment from './components/our-commitment';

export default function AboutUs() {
    return (
        <>
            <PageBanner
                bgImage='/page-banner/about-us.jpg'
                title='About Golden Ticket Online Arcade'
                description='Golden Ticket Online Arcade is a sweepstakes-based social gaming platform designed for pure entertainment. We’re here to deliver a fun, interactive arcade experience with exciting games for everyone to enjoy.'
                className='mb-16'
            />
            <NoPurchase />
            <HowWeOperate />
            <OurCommitment />
            <NeedHelp />
        </>
    );
}
