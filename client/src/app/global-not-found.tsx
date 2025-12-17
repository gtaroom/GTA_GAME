import GlobalParticleBg from '@/components/glowing-particles-background';
import NotFoundMsg from '@/components/not-found-msg';
import { PageTransitionWrapper } from '@/components/wrappers/page-transition-wrapper';
import '@/styles/main.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
};

export default function GlobalNotFound() {
    return (
        <html lang='en'>
            <body className='min-h-screen grid place-items-center'>
                <PageTransitionWrapper>
                    <NotFoundMsg />
                    <GlobalParticleBg />
                </PageTransitionWrapper>
            </body>
        </html>
    );
}
