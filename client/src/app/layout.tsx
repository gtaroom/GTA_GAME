import { Figtree, Nunito } from 'next/font/google';
import Script from 'next/script';

import GlobalParticleBg from '@/components/glowing-particles-background';
import OpacitySafety from '@/components/opacity-safety';
import LayoutWrapper from '@/components/wrappers/layout-wrapper';

import type { Metadata, Viewport } from 'next';

import '@/styles/main.css';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// import { GameSearchModal } from '@/components/modal/game-search';
import RootModals from '@/components/modal/root-modals';
import { NotificationPopup } from '@/components/notification/notification-popup';
import { PageTransitionWrapper } from '@/components/wrappers/page-transition-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { GameProvider } from '@/contexts/game-context';
import { GameSearchProvider } from '@/contexts/game-search-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { UIProvider } from '@/contexts/ui-context';
import { SpinWheelProvider } from '@/contexts/spin-wheel-context';
import { VipProvider } from '@/contexts/vip-context';
import { WalletBalanceProvider } from '@/contexts/wallet-balance-context';
import { ApiInterceptor } from '@/lib/api-interceptor';
import { StitchesRegistry } from '@/lib/stitches-registry';

// meta data
export const metadata: Metadata = {
    title: 'Golden Ticket',
    description: 'Golden Ticket Online Arcade and Casino',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Your App',
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'theme-color': '#310a47',
    },
};

// nunito fonts
const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--nunito-font-family',
});

// figtree fonts
const figtree = Figtree({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--figtree-font-family',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <head>
                {/* <script
                    crossOrigin='anonymous'
                    src='//unpkg.com/react-scan/dist/auto.global.js'
                /> */}
                <link rel='manifest' href='/manifest.json' />
                <link
                    rel='icon'
                    type='image/png'
                    sizes='196x196'
                    href='/favicon-196.png'
                />
                <link rel='apple-touch-icon' href='/apple-icon-180.png' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta
                    name='apple-mobile-web-app-status-bar-style'
                    content='black-translucent'
                />
            </head>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            .rocketchat-widget {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 400px !important;
                height: 600px !important;
                max-height: calc(100vh - 40px) !important;
                z-index: 99999 !important;
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: all 0.3s ease !important;
            }
            .rocketchat-widget[data-state="opened"] {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            .rocketchat-container {
                width: 100% !important;
                height: 100% !important;
                display: block !important;
                visibility: visible !important;
            }
            #rocketchat-iframe {
                width: 100% !important;
                height: 100% !important;
                display: block !important;
                border: none !important;
            }
        `,
                }}
            />
            <body
                className={`${nunito.variable} ${figtree.variable} min-h-screen antialiased`}
            >
                {/* <NextTopLoader
                    color='#ad46ff'
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={true}
                    easing='ease'
                    speed={200}
                    shadow='0 0 10px #ad46ff,0 0 5px #ad46ff'
                    zIndex={1600}
                    showAtBottom={false}
                /> */}
                {/* GoatPayments Script */}
                <Script
                    src='https://goatpayments.transactiongateway.com/token/Collect.js'
                    strategy='beforeInteractive'
                    data-tokenization-key='8Zbsgc-3r3c4A-92W7B6-hjM797'
                    data-primary-color='#37805B'
                    data-theme='bootstrap'
                    data-secondary-color='#19C687'
                    data-button-text='Pay Now'
                    data-instruction-text='Enter your payment information'
                    data-payment-type='cc'
                    data-field-cvv-display='show'
                    data-price='1.00'
                    data-currency='USD'
                    data-country='US'
                    data-field-apple-pay-selector='.apple-pay-button'
                    data-field-google-pay-selector='.google-pay-button'
                />

                {/* Rocket.Chat Livechat Script */}

                <Script
                    id='rocketchat-livechat'
                    strategy='afterInteractive'
                    dangerouslySetInnerHTML={{
                        __html: `
            (function(w, d, s, u) {
                w.RocketChat = function(c) { w.RocketChat._.push(c) }; 
                w.RocketChat._ = []; 
                w.RocketChat.url = u;
                var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
                j.async = true; 
                j.src = 'https://assistcentral.net/livechat/rocketchat-livechat.min.js?_=201903270000';
                h.parentNode.insertBefore(j, h);
            })(window, document, 'script', 'https://assistcentral.net/livechat');
        `,
                    }}
                />

                <StitchesRegistry>
                    <ApiInterceptor>
                        <AuthProvider>
                            <WalletBalanceProvider>
                                <VipProvider>
                                    <SpinWheelProvider>
                                        <NotificationProvider>
                                            <GameProvider>
                                            <UIProvider defaultOpen={true}>
                                                <GameSearchProvider>
                                                    <PageTransitionWrapper>
                                                        <LayoutWrapper>
                                                            {children}
                                                            {/* <GameSearchModal /> */}
                                                        </LayoutWrapper>
                                                        <OpacitySafety />
                                                    </PageTransitionWrapper>
                                                    <GlobalParticleBg />
                                                    <RootModals />
                                                    <NotificationPopup />
                                                </GameSearchProvider>
                                            </UIProvider>
                                        </GameProvider>
                                        </NotificationProvider>
                                    </SpinWheelProvider>
                                </VipProvider>
                            </WalletBalanceProvider>
                        </AuthProvider>
                    </ApiInterceptor>
                </StitchesRegistry>
            </body>
        </html>
    );
}
