import { Icon } from '@iconify/react';

interface VerifiedProps {
    verified?: boolean;
}

export default function Verified({ verified = false }: VerifiedProps) {
    if (!verified) {
        return (
            <div className='inline-flex items-center gap-2 text-red-400'>
                <span className='capitalize font-bold'>Not Verified</span>
                <Icon icon='material-symbols:cancel-rounded' fontSize={18} />
            </div>
        );
    }

    return (
        <div className='inline-flex items-center gap-2 text-green-400'>
            <span className='capitalize font-bold'>Verified</span>
            <Icon icon='material-symbols:check-circle-rounded' fontSize={18} />
        </div>
    );
}
