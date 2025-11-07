'use client';
import { useState, useEffect } from 'react';
import NeonBox from '@/components/neon/neon-box';
import { Icon } from '@iconify/react';

// Declare global types for RocketChat
declare global {
    interface Window {
        RocketChat: any;
    }
}

const LiveChatButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Check if RocketChat is ready on mount and periodically
    useEffect(() => {
        const checkRocketChatReady = () => {
            if (
                window.RocketChat &&
                window.RocketChat.livechat &&
                typeof window.RocketChat.livechat.showWidget === 'function'
            ) {
                setIsReady(true);
                return true;
            }
            return false;
        };

        // Check immediately
        if (checkRocketChatReady()) {
            return;
        }

        // Poll for RocketChat availability
        const pollInterval = setInterval(() => {
            if (checkRocketChatReady()) {
                clearInterval(pollInterval);
            }
        }, 500); // Check every 500ms

        // Cleanup after 30 seconds (timeout)
        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
        }, 30000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, []);

    const handleClick = async () => {
        // If already loading, don't do anything
        if (isLoading) return;

        // If RocketChat is ready, open it immediately
        if (isReady && window.RocketChat?.livechat) {
            try {
                window.RocketChat.livechat.showWidget();
                window.RocketChat.livechat.maximizeWidget();
            } catch (error) {
                console.error('Error opening RocketChat:', error);
            }
            return;
        }

        // Otherwise, wait for RocketChat to be ready
        setIsLoading(true);

        const maxAttempts = 60; // 30 seconds max (60 * 500ms)
        let attempts = 0;

        const waitForRocketChat = (): Promise<void> => {
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    attempts++;

                    if (
                        window.RocketChat &&
                        window.RocketChat.livechat &&
                        typeof window.RocketChat.livechat.showWidget === 'function'
                    ) {
                        clearInterval(checkInterval);
                        setIsReady(true);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        reject(new Error('RocketChat failed to load within timeout'));
                    }
                }, 500); // Check every 500ms
            });
        };

        try {
            await waitForRocketChat();
            // RocketChat is now ready, open it
            if (window.RocketChat?.livechat) {
                window.RocketChat.livechat.showWidget();
                window.RocketChat.livechat.maximizeWidget();
            }
        } catch (error) {
            console.error('RocketChat not loaded yet:', error);
            // You could show a toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className='relative z-[20] disabled:opacity-70 disabled:cursor-wait'
        >
            <NeonBox
                className='scale-effect scale-pulse scale-pulse-xs select-none scale-pulse-fast fixed lg:bottom-10 xm:right-6 bottom-28 right-4 grid aspect-square sm:w-[60px] w-[54px] place-items-center rounded-full backdrop-blur-lg cursor-pointer'
                backgroundColor='--color-purple-800'
                backgroundOpacity={0.6}
            >
                {isLoading ? (
                    <Icon
                        icon='lucide:loader-2'
                        className='sm:text-2xl text-xl animate-spin'
                    />
                ) : (
                    <Icon
                        icon='lucide:message-circle-more'
                        className='sm:text-2xl text-xl'
                    />
                )}
            </NeonBox>
        </button>
    );
};

export default LiveChatButton;
