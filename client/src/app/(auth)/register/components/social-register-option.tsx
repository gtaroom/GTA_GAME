import {
    AppleButton,
    GoogleButton,
} from '@/app/(auth)/components/social-buttons';
import SocialButtonsWrapper from '@/app/(auth)/components/social-buttons-wrapper';

const SocialRegisterOption = ({ className }: { className?: string }) => {
    return (
        <>
            <SocialButtonsWrapper className={className}>
                <GoogleButton />
                <AppleButton />
            </SocialButtonsWrapper>
        </>
    );
};

export default SocialRegisterOption;
