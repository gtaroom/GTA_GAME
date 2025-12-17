'use client';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { me, checkAuth, logout as logoutApi } from '@/lib/api/auth';
import type { User } from '@/types/user.types';
import { initializeModalCooldowns } from '@/lib/modal-cooldown';
import { apiErrorHandler, tokenRefreshManager } from '@/lib/api-error-handler';

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    setLoggedIn: (value: boolean) => void;
    setUser: (user: User | null) => void;
    updateUserBalance: (newBalance: number) => void;
    updateUserSCBalance: (newBalance: number) => void;
    updateUserFlags: (updates: Partial<Pick<User, 'isNewUser' | 'claimedDailyBonus' | 'loginStreak' | 'isPhoneVerified'>>) => void;
    refetchUser: () => Promise<void>;
    logout: () => Promise<void>;
    isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    setLoggedIn: () => {},
    setUser: () => {},
    updateUserBalance: () => {},
    updateUserSCBalance: () => {},
    updateUserFlags: () => {},
    refetchUser: async () => {},
    logout: async () => {},
    isInitializing: false,
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    useEffect(() => {
        // Initialize modal cooldown system
        initializeModalCooldowns();
        
        // Listen for logout events from API interceptor
        const handleAuthLogout = () => {
            setIsLoggedIn(false);
            setUser(null);
        };

        // Listen for toast events from API interceptor
        const handleShowToast = (event: CustomEvent) => {
            const { message, type, duration } = event.detail;
            console.log(`Toast [${type}]: ${message}`);
            // You can integrate with your toast system here
        };

        window.addEventListener('auth-logout', handleAuthLogout as EventListener);
        window.addEventListener('show-toast', handleShowToast as EventListener);
        
        // On mount, try to verify session and get user data
        const controller = new AbortController();
        
        initializeAuth()
            .catch((error) => {
                console.error('Auth initialization failed:', error);
                setIsLoggedIn(false);
                setUser(null);
            })
            .finally(() => {
                setIsInitializing(false);
            });

        return () => {
            controller.abort();
            window.removeEventListener('auth-logout', handleAuthLogout as EventListener);
            window.removeEventListener('show-toast', handleShowToast as EventListener);
        };
    }, []);

    const initializeAuth = async () => {
        try {
            console.log('🔄 Initializing auth...');
            const response = await checkAuth();
            if (response.success) {
                console.log('✅ Auth successful, user logged in');
                setIsLoggedIn(true);
                setUser(response.data);
            } else {
                console.log('❌ Auth failed, user not logged in');
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            // Don't call error handler during initialization to avoid redirect loops
            console.log('❌ Auth initialization failed (this is normal for non-logged-in users):', error);
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const setLoggedIn = (value: boolean) => {
        setIsLoggedIn(value);
        if (!value) {
            setUser(null);
        }
    };

    const updateUserBalance = (newBalance: number) => {
        setUser(prev => prev ? { ...prev, balance: prev.balance + newBalance } : null);
    };
    const updateUserSCBalance = (newBalance: number) => {
        setUser(prev => prev ? { ...prev, sweepCoins: prev.sweepCoins + newBalance } : null);
    };

    const updateUserFlags = (updates: Partial<Pick<User, 'isNewUser' | 'claimedDailyBonus' | 'loginStreak' | 'isPhoneVerified'>>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    const refetchUser = async () => {
        try {
            const response = await me();
            if (response.success) {
                setIsLoggedIn(true);
                setUser(response.data);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refetch user:', error);
            // Don't call error handler to avoid redirect loops
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            user, 
            setLoggedIn, 
            setUser, 
            updateUserBalance, 
            updateUserSCBalance,
            updateUserFlags,
            refetchUser,
            logout,
            isInitializing
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Keep backward compatibility
export function useIsLoggedIn(): Pick<AuthContextType, 'isLoggedIn' | 'setLoggedIn'> {
    const { isLoggedIn, setLoggedIn } = useAuth();
    return { isLoggedIn, setLoggedIn };
}
