import AuthFooterText from '@/app/(auth)/components/auth-footer-text';
import AuthTitle from '@/app/(auth)/components/auth-title';

import ForgotPasswordForm from './components/forgot-password-form';

const ForgotPassword = () => {
    return (
        <>
            {/* Page Title and Description */}
            <AuthTitle
                title='Reset Your Password'
                description='Enter the email address linked to your account, and we’ll send you a link to reset your password.'
            />

            {/* Forgot Password Form*/}
            <ForgotPasswordForm />

            {/* Already Have Account?  */}
            <AuthFooterText
                text='Don’t Have an Account?'
                link={{ href: '/register', text: 'Register' }}
            />
        </>
    );
};

export default ForgotPassword;
