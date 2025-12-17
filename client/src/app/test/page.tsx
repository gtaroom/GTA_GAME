'use client';
// import DailyRewards from '@/components/modal/daily-rewards';
// import ClaimFreeCoins from '@/components/modal/claim-free-coins';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

function Test() {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Modal</Button>
                </DialogTrigger>
                {/* <ClaimFreeCoins /> */}
                {/* <DailyRewards /> */}
            </Dialog>
        </>
    );
}

export default Test;
