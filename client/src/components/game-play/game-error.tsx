import { Icon } from '@iconify/react';

interface GameErrorProps {
    error: string;
    onRetry: () => void;
    onBack: () => void;
}

export default function GameError({ error, onRetry, onBack }: GameErrorProps) {
    return (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Error Icon */}
                <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                    <Icon 
                        icon="lucide:alert-circle" 
                        className="w-12 h-12 text-red-500"
                    />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
                    <p className="text-gray-400">{error}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
                    >
                        <Icon icon="lucide:refresh-cw" className="w-5 h-5" />
                        Try Again
                    </button>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                    <p className="text-sm text-gray-400">
                        If the problem persists, please contact support or try a different game.
                    </p>
                </div>
            </div>
        </div>
    );
}
