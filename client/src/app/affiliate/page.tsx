'use client';
import PageBanner from '@/components/page-banner';
import { Button } from '@/components/ui/button';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import AffiliateHighlights from './components/affiliate-highlights';
import CommissionStructure from './components/commission-structure';
import PartnerWithUs from './components/partner-with-us';
import PartnershipForm from './components/partnership-form';

export default function AffiliatePage() {
    const { xl, lg } = useBreakPoint();
    const router = useTransitionRouter();

    return (
        <>
            <PageBanner
                className='mb-14 md:mb-16'
                bgImage='/page-banner/affiliate.jpg'
                title='Affiliate Partnership Program'
                description='Join our curated network of performance-driven partners and earn commissions by referring new players to Golden Ticket Online Arcade.'
                bottomContent={
                    <Button
                        size={xl ? 'xl' : `${lg ? 'lg' : 'md'}`}
                        onClick={() => router.push('/game-listing')}
                    >
                        Play Now
                    </Button>
                }
            />
            <AffiliateHighlights />
            <CommissionStructure />
            <PartnerWithUs />
            <PartnershipForm />
        </>
    );
}
