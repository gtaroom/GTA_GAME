import ExclusiveProgram from './components/exclusive-program';
import IncludeInVIP from './components/include-in-vip';
import VIPLevel from './components/vip-level';
import VIPProgramFAQ from './components/vip-program-faq';
import VipPerks from './components/vip-perks';

export default function VIPprogram() {
    return (
        <>
            <VIPLevel />
            <VipPerks className='container-xxl mb-20' />
            <IncludeInVIP />
            <ExclusiveProgram />
            <VIPProgramFAQ />
        </>
    );
}
