import AuthFooterText from '@/app/(auth)/components/auth-footer-text';
import AuthTitle from '@/app/(auth)/components/auth-title';

import ResetPasswordForm from './components/reset-password-form';

const ResetPassword = () => {
    return (
        <>
            {/* Page Title and Description */}
            <AuthTitle
                title='Reset Your Password'
                description='Enter your new password below to complete the password reset process.'
            />

            {/* Reset Password Form*/}
            <ResetPasswordForm />

            {/* Back to Login */}
            <AuthFooterText
                text='Remember your password?'
                link={{ href: '/login', text: 'Back to Login' }}
            />
        </>
    );
};

export default ResetPassword;
