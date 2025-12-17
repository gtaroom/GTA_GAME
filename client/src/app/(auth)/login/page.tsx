import AuthFooterText from '@/app/(auth)/components/auth-footer-text';
import AuthTitle from '@/app/(auth)/components/auth-title';

import ManualLoginOption from './components/manual-login-option';
import SocialLoginOption from './components/social-login-option';

const Login = () => {
    return (
        <>
            {/* Page Title and Description */}
            <AuthTitle
                title='Welcome Back!'
                description='Log In to continue enjoying your free rewards, track your activity, and explore more features.'
            />

            {/* Login Using Manual Way */}
            <ManualLoginOption />

            {/* Login Using Social Options */}
            {/* <SocialLoginOption className='mb-10' /> */}

            {/* Already Have Account?  */}
            <AuthFooterText
                text='Don’t Have an Account?'
                link={{ href: '/register', text: 'Register' }}
            />
        </>
    );
};

export default Login;
