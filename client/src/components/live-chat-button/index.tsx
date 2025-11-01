'use client';
import NeonBox from '@/components/neon/neon-box';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

const LiveChatButton = () => {
    const [isReady, setIsReady] = useState(false);

    // Wait for RocketChat to be available
    useEffect(() => {
        const checkRocketChat = setInterval(() => {
            if ((window as any).RocketChat) {
                console.log('✅ RocketChat is ready!');
                setIsReady(true);
                clearInterval(checkRocketChat);
            }
        }, 500);

        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkRocketChat), 10000);

        return () => clearInterval(checkRocketChat);
    }, []);

    const handleClick = () => {
        console.log('Button clicked');
        console.log('RocketChat ready?', isReady);

        if ((window as any).RocketChat) {
            (window as any).RocketChat(function (this: any) {
                console.log('Attempting to open chat widget');
                console.log('Available methods:', this);

                // Try all possible methods
                if (typeof this.maximizeWidget === 'function') {
                    console.log('Using maximizeWidget()');
                    this.maximizeWidget();
                } else if (typeof this.showWidget === 'function') {
                    console.log('Using showWidget()');
                    this.showWidget();
                } else if (typeof this.openWidget === 'function') {
                    console.log('Using openWidget()');
                    this.openWidget();
                } else if (typeof this.open === 'function') {
                    console.log('Using open()');
                    this.open();
                } else {
                    console.warn(
                        'No open method found. Available:',
                        Object.keys(this)
                    );
                }
            });
        } else {
            console.error('RocketChat not loaded yet');
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
                {/* Loading indicator */}
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
