'use client';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { 
    getVipStatus, 
    getAllVipTiers,
    type VipStatusResponse,
    type VipTiersResponse 
} from '@/lib/api/vip';
import { useAuth } from '@/contexts/auth-context';

interface VipContextType {
    vipStatus: VipStatusResponse['data'] | null;
    vipTiers: VipTiersResponse['data']['tiers'] | null;
    isLoading: boolean;
    error: string | null;
    refetchVipStatus: () => Promise<void>;
    refetchVipTiers: () => Promise<void>;
}

const VipContext = createContext<VipContextType>({
    vipStatus: null,
    vipTiers: null,
    isLoading: false,
    error: null,
    refetchVipStatus: async () => {},
    refetchVipTiers: async () => {},
});

interface VipProviderProps {
    children: ReactNode;
}

export function VipProvider({ children }: VipProviderProps) {
    const [vipStatus, setVipStatus] = useState<VipStatusResponse['data'] | null>(null);
    const [vipTiers, setVipTiers] = useState<VipTiersResponse['data']['tiers'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();

    const refetchVipStatus = async () => {
        if (!isLoggedIn) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const response = await getVipStatus();
            if (response?.success && response?.data) {
                setVipStatus(response.data);
            } else {
                setError('Failed to fetch VIP status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch VIP status');
            console.error('Failed to fetch VIP status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const refetchVipTiers = async () => {
        if (!isLoggedIn) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const response = await getAllVipTiers();
            if (response?.success && response?.data?.tiers) {
                setVipTiers(response.data.tiers);
            } else {
                setError('Failed to fetch VIP tiers');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch VIP tiers');
            console.error('Failed to fetch VIP tiers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            refetchVipStatus();
            refetchVipTiers();
        } else {
            setVipStatus(null);
            setVipTiers(null);
        }
    }, [isLoggedIn]);

    return (
        <VipContext.Provider value={{ 
            vipStatus, 
            vipTiers, 
            isLoading, 
            error, 
            refetchVipStatus, 
            refetchVipTiers 
        }}>
            {children}
        </VipContext.Provider>
    );
}

export function useVip(): VipContextType {
    const context = useContext(VipContext);
    if (!context) {
        throw new Error('useVip must be used within a VipProvider');
    }
    return context;
}
