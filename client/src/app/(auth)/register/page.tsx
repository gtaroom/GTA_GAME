'use client';

import AuthFooterText from '@/app/(auth)/components/auth-footer-text';
import AuthTitle from '@/app/(auth)/components/auth-title';

import ManualregisterOption from './components/manual-register-option';
import SocialRegisterOption from './components/social-register-option';

const Register = () => {
    return (
        <div className=''>
            {/* Page Title and Description */}
            <AuthTitle
                title='Register and play free'
                description='Register now to access exclusive features, rewards, and entertainment 100% free to join!'
            />

            {/* Register Using Manual Way */}
            <ManualregisterOption />

            {/* Register Using Social Options */}
            {/* <SocialRegisterOption className='mb-10' /> */}

            {/* Already Have Account?  */}
            <AuthFooterText
                text='Already have an Account?'
                link={{ href: '/login', text: 'Log in' }}
            />
        </div>
    );
};

export default Register;
