'use client';
import PageBanner from '@/components/page-banner';
import { Button } from '@/components/ui/button';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransitionRouter } from 'next-transition-router';
import AffiliateHighlights from './components/affiliate-highlights';
import CommissionStructure from './components/commission-structure';
import HowCommissionsWork from './components/how-commissions-work';
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
                description='Join our affiliate network and earn one-time commissions when your referrals qualify. Public applications welcome - no account required. Approved affiliates get access to a powerful dashboard with real-time tracking and analytics.'
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
            <HowCommissionsWork />
            <PartnerWithUs />
            <PartnershipForm />
        </>
    );
}
