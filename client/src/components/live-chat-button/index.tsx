// 'use client';
// import NeonBox from '@/components/neon/neon-box';
// import { Icon } from '@iconify/react';
// import { useEffect, useState } from 'react';

// const LiveChatButton = () => {
//     const [isReady, setIsReady] = useState(false);

//     useEffect(() => {
//         console.log('🔍 Starting RocketChat check...');

//         const checkRocketChat = setInterval(() => {
//             console.log(
//                 '⏳ Checking for RocketChat...',
//                 !!(window as any).RocketChat
//             );

//             if ((window as any).RocketChat) {
//                 console.log(' RocketChat is ready!');
//                 console.log('RocketChat object:', (window as any).RocketChat);

//                 setIsReady(true);
//                 clearInterval(checkRocketChat);
//             }
//         }, 500);

//         setTimeout(() => {
//             console.log('Timeout reached');
//             clearInterval(checkRocketChat);
//         }, 10000);

//         return () => clearInterval(checkRocketChat);
//     }, []);

//     const handleClick = () => {
//         console.log('=== BUTTON CLICKED ===');
//         console.log('1. RocketChat exists?', !!(window as any).RocketChat);
//         console.log('2. isReady?', isReady);

//         if ((window as any).RocketChat) {
//             console.log('3. Attempting to call RocketChat function...');

//             try {
//                 (window as any).RocketChat(function (this: any) {
//                     console.log('4. Inside RocketChat callback');
//                     console.log('5. this object:', this);
//                     console.log('6. Available methods:', Object.keys(this));
//                     console.log(
//                         '7. Available properties:',
//                         Object.getOwnPropertyNames(this)
//                     );
//                     console.log(
//                         '8. Prototype methods:',
//                         Object.getOwnPropertyNames(Object.getPrototypeOf(this))
//                     );

//                     // Try every possible method
//                     const methods = [
//                         'maximizeWidget',
//                         'showWidget',
//                         'openWidget',
//                         'open',
//                         'show',
//                         'maximize',
//                     ];

//                     for (const method of methods) {
//                         if (typeof this[method] === 'function') {
//                             console.log(
//                                 `9. Found method: ${method}, calling it...`
//                             );
//                             this[method]();
//                             return;
//                         }
//                     }

//                     console.warn('10. No open method found!');
//                 });
//             } catch (error) {
//                 console.error('Error calling RocketChat:', error);
//             }
//         } else {
//             console.error('RocketChat not available');
//         }

//         console.log('=== END ===');
//     };

//     return (
//         <button onClick={handleClick} className='relative z-[20]'>
//             <NeonBox
//                 className='scale-effect scale-pulse scale-pulse-xs select-none scale-pulse-fast fixed xl:right-10 xl:bottom-30 xm:right-6 sm:bottom-6 bottom-28 right-4 grid aspect-square sm:w-[60px] w-[54px] place-items-center rounded-full backdrop-blur-lg cursor-pointer'
//                 backgroundColor='--color-purple-800'
//                 backgroundOpacity={0.6}
//             >
//                 <Icon
//                     icon='lucide:message-circle-more'
//                     className='sm:text-2xl text-xl'
//                 />
//                 {!isReady && (
//                     <span className='absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse' />
//                 )}
//             </NeonBox>
//         </button>
//     );
// };

// export default LiveChatButton;

// components/live-chat-button/index.tsx
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
