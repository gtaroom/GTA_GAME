'use client';
import AccountPageTitle from '@/app/(account)/profile/components/account-page-title';
import NeonText from '@/components/neon/neon-text';
import { Button } from '@/components/ui/button';
import ButtonGroup from '@/components/ui/button-group';
import { useBreakPoint } from '@/hooks/useBreakpoint';

export default function ShareLink({ isLoggedIn }: { isLoggedIn?: boolean }) {
    const { md } = useBreakPoint();
    return (
        <section className='mb-14 md:mb-16'>
            <div className={isLoggedIn ? 'w-full' : 'container-xxl'}>
                <div className='max-w-[830px] mx-auto flex flex-col items-center text-center'>
                    <AccountPageTitle className='mb-3'>
                        Copy or Share Link
                    </AccountPageTitle>
                    <NeonText
                        className='h4-title capitalize mb-8'
                        glowSpread={0.5}
                    >
                        Your friend must register using your referral link and
                        complete at least $20 in total Gold Coin purchases to
                        qualify. Rules apply (small print)
                    </NeonText>
                    <ButtonGroup className='gap-5'>
                        <Button size={md ? 'lg' : 'md'}>Open Or Code</Button>
                        <Button size={md ? 'lg' : 'md'} variant='secondary'>
                            Copy Invite Link
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </section>
    );
}
