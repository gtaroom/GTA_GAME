import { Icon } from '@iconify/react';

interface GameLoadingProps {
    gameName?: string;
}

export default function GameLoading({ gameName }: GameLoadingProps) {
    return (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
            <div className="text-center space-y-6 px-4">
                {/* Animated Loading Spinner */}
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon 
                            icon="lucide:gamepad-2" 
                            className="w-10 h-10 text-purple-500"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                        {gameName ? `Loading ${gameName}...` : 'Loading Game...'}
                    </h2>
                    <p className="text-gray-400">Please wait while we prepare your game</p>
                </div>

                {/* Loading Progress Bar */}
                <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse bg-[length:200%_100%]"></div>
                </div>

                {/* Loading Tips */}
                <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
                    <p className="italic">💡 Tip: Use fullscreen mode for the best experience</p>
                </div>
            </div>
        </div>
    );
}
