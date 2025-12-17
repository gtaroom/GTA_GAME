import EligibleSC from './components/eligible-sc';
import RedeemCouponCode from './components/redeem-coupon-code';
import RedeemMethod from './components/redeem-method';

export default function Redeem() {
    return (
        <>
            <EligibleSC />
            <RedeemMethod />
            <RedeemCouponCode />
        </>
    );
}
