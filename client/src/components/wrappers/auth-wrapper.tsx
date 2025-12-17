import GridMotion from '@/components/grid-motion';
import NeonBox from '@/components/neon/neon-box';
import SiteLogo from '@/components/site-logo';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const { xl } = useBreakPoint();
    return (
        <main className='relative z-[1] flex h-auto w-full items-center p-6 max-xl:flex-col xl:h-screen xl:p-8'>
            <NeonBox
                className={cn(
                    'h-[600px] w-full overflow-hidden max-xl:fixed max-xl:top-0 max-xl:left-0 max-xl:z-[2] xl:h-full xl:rounded-2xl',
                    "max-xl:before:absolute max-xl:before:top-[0] max-xl:before:left-0 max-xl:before:z-[3] max-xl:before:h-[700px] max-xl:before:w-full max-xl:before:bg-[linear-gradient(0deg,rgba(49,10,71,1)_30%,rgba(49,10,71,0.80)_100%)] max-xl:before:content-['']"
                )}
                borderWidth={xl ? 3 : 0}
                glowColor={xl ? '--color-purple-500' : 'transparent'}
                backgroundColor='--color-purple-500'
                borderColor='--color-white'
                backgroundOpacity={0.2}
            >
                <GridMotion />
            </NeonBox>

            <div className='relative flex w-full max-w-197 items-start justify-center max-xl:z-[4] max-xl:min-h-[calc(100vh-48px)]  xl:h-full xl:overflow-scroll'>
                <div className='my-auto flex w-full max-w-[500px] flex-col items-center xl:max-w-[450px]'>
                    {/* Site Logo */}
                    <SiteLogo className='mb-10 max-w-[128px]' />
                    {children}
                </div>
            </div>
        </main>
    );
};

export default AuthWrapper;
