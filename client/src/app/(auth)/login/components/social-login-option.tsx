import { Icon } from '@iconify/react';

import {
    appleButtonSettings,
    googleButtonSettings,
    socialButtonSettings,
} from '@/app/(auth)/auth.style.config';
import SocialButtonsWrapper from '@/app/(auth)/components/social-buttons-wrapper';
import { Button } from '@/components/ui/button';

const SocialLoginOption = ({ className }: { className?: string }) => {
    return (
        <>
            <SocialButtonsWrapper className={className}>
                <Button {...socialButtonSettings} {...googleButtonSettings}>
                    <Icon icon='flat-color-icons:google' />
                    Login with Google
                </Button>
                <Button {...socialButtonSettings} {...appleButtonSettings}>
                    <Icon icon='ri:apple-fill' />
                    Login with Apple
                </Button>
            </SocialButtonsWrapper>
        </>
    );
};

export default SocialLoginOption;
