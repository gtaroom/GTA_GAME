'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useVip } from '@/contexts/vip-context';

interface AuthGuardProps {
    children: React.ReactNode;
    requireVip?: boolean;
    minTier?: string;
    redirectTo?: string;
}

// Simple auth guard that doesn't make API calls
export default function AuthGuard({
    children,
    requireVip = false,
    minTier,
    redirectTo = '/login'
}: AuthGuardProps) {
    const router = useRouter();
    const { isLoggedIn, user, isInitializing } = useAuth();
    const { vipStatus, isLoading: vipLoading } = useVip();

    useEffect(() => {
        console.log('AuthGuard useEffect triggered:', {
            isInitializing,
            vipLoading,
            isLoggedIn,
            hasUser: !!user,
            requireVip,
            minTier,
            hasVipStatus: !!vipStatus
        });

        // Don't redirect while contexts are loading
        if (isInitializing || vipLoading) {
            console.log('AuthGuard: Still loading, waiting...');
            return;
        }

        // Only redirect if we're sure the user is not logged in
        if (!isLoggedIn && !user) {
            console.log('AuthGuard: User not logged in, redirecting to login');
            router.push(redirectTo);
            return;
        }

        console.log('AuthGuard: User is logged in, checking VIP requirements...');

        // Check VIP requirements if needed
        if (requireVip && vipStatus) {
            if (minTier) {
                const tierHierarchy = [
                    'none', 'iron', 'bronze', 'silver', 'gold', 
                    'platinum', 'onyx', 'sapphire', 'ruby', 'emerald'
                ];
                
                const currentTierIndex = tierHierarchy.indexOf(vipStatus.tier);
                const minTierIndex = tierHierarchy.indexOf(minTier);
                
                console.log('AuthGuard: VIP check:', {
                    currentTier: vipStatus.tier,
                    minTier,
                    currentTierIndex,
                    minTierIndex
                });
                
                if (currentTierIndex < minTierIndex) {
                    console.log('AuthGuard: VIP tier requirement not met, redirecting to VIP program');
                    router.push('/vip-program');
                    return;
                }
            }
        }

        console.log('AuthGuard: All checks passed, user authorized');
    }, [isLoggedIn, user, vipStatus, requireVip, minTier, router, redirectTo, isInitializing, vipLoading]);

    // Don't render anything while contexts are loading
    if (isInitializing || vipLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
                <div className="text-center" suppressHydrationWarning>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" suppressHydrationWarning></div>
                    <p className="text-gray-400" suppressHydrationWarning>Loading...</p>
                </div>
            </div>
        );
    }

    // Show login message if not logged in
    if (!isLoggedIn && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900" suppressHydrationWarning>
                <div className="text-center max-w-md mx-auto p-8" suppressHydrationWarning>
                    <div className="mb-6" suppressHydrationWarning>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center" suppressHydrationWarning>
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2" suppressHydrationWarning>
                            Authentication Required
                        </h2>
                        <p className="text-gray-300 mb-6" suppressHydrationWarning>
                            Please log in to access your account features.
                        </p>
                    </div>
                    
                    <div className="space-y-3" suppressHydrationWarning>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                            suppressHydrationWarning
                        >
                            Go to Login
                        </button>
                        
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                            suppressHydrationWarning
                        >
                            Back to Home
                        </button>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-6" suppressHydrationWarning>
                        Redirecting automatically in a few seconds...
                    </p>
                </div>
            </div>
        );
    }

    // Don't render if VIP requirements not met
    if (requireVip && vipStatus && minTier) {
        const tierHierarchy = [
            'none', 'iron', 'bronze', 'silver', 'gold', 
            'platinum', 'onyx', 'sapphire', 'ruby', 'emerald'
        ];
        
        const currentTierIndex = tierHierarchy.indexOf(vipStatus.tier);
        const minTierIndex = tierHierarchy.indexOf(minTier);
        
        if (currentTierIndex < minTierIndex) {
            return null;
        }
    }

    return <>{children}</>;
}
