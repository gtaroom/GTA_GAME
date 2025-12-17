import SpinWheelModal from '@/components/modal/spin-wheel-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

export default function TestTwo() {
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Speen Wheel Modal</Button>
                </DialogTrigger>
                <SpinWheelModal />
            </Dialog>
        </div>
    );
}
