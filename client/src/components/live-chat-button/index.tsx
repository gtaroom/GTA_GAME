'use client';
import NeonBox from '@/components/neon/neon-box';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

const LiveChatButton = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkRocketChat = setInterval(() => {
            if ((window as any).RocketChat) {
                console.log('✅ RocketChat is ready!');

                // Hide default widget via API
                try {
                    (window as any).RocketChat(function (this: any) {
                        if (this.hideWidget) {
                            this.hideWidget();
                        }
                    });
                } catch (e) {
                    console.log('Could not hide via API');
                }

                // Also hide via DOM - runs multiple times to catch late-loading elements
                const hideDefaultWidget = () => {
                    const selectors = [
                        '.rocketchat-widget',
                        'button[class*="rocketchat"]',
                        'button[class*="launcher"]',
                        '.rocketchat-container > button',
                        'div[class*="rocketchat"] > button',
                    ];

                    selectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                            (el as HTMLElement).style.display = 'none';
                        });
                    });
                };

                // Hide immediately
                hideDefaultWidget();

                // Hide again after delays (in case it loads late)
                setTimeout(hideDefaultWidget, 1000);
                setTimeout(hideDefaultWidget, 2000);
                setTimeout(hideDefaultWidget, 3000);

                setIsReady(true);
                clearInterval(checkRocketChat);
            }
        }, 500);

        setTimeout(() => clearInterval(checkRocketChat), 10000);
        return () => clearInterval(checkRocketChat);
    }, []);

    const handleClick = () => {
        if ((window as any).RocketChat) {
            (window as any).RocketChat(function (this: any) {
                if (this.maximizeWidget) {
                    this.maximizeWidget();
                } else if (this.showWidget) {
                    this.showWidget();
                } else if (this.openWidget) {
                    this.openWidget();
                }
            });
        }
    };

    return (
        <button onClick={handleClick} className='relative z-[20]'>
            <NeonBox
                className='scale-effect scale-pulse scale-pulse-xs select-none scale-pulse-fast fixed xl:right-10 xl:bottom-30 xm:right-6 sm:bottom-6 bottom-28 right-4 grid aspect-square sm:w-[60px] w-[54px] place-items-center rounded-full backdrop-blur-lg cursor-pointer'
                backgroundColor='--color-purple-800'
                backgroundOpacity={0.6}
            >
                <Icon
                    icon='lucide:message-circle-more'
                    className='sm:text-2xl text-xl'
                />
                {!isReady && (
                    <span
                        className='absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse'
                        title='Chat loading...'
                    />
                )}
            </NeonBox>
        </button>
    );
};

export default LiveChatButton;
