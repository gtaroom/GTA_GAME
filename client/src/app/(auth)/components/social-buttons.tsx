import { Icon } from '@iconify/react';

import {
    appleButtonSettings,
    googleButtonSettings,
    socialButtonSettings,
} from '@/app/(auth)/auth.style.config';
import { Button } from '@/components/ui/button';

export const GoogleButton = () => {
    return (
        <Button {...socialButtonSettings} {...googleButtonSettings}>
            <Icon icon='flat-color-icons:google' />
            Register with Google
        </Button>
    );
};

export const AppleButton = () => {
    return (
        <Button {...socialButtonSettings} {...appleButtonSettings}>
            <Icon icon='ri:apple-fill' /> Register with Apple
        </Button>
    );
};
