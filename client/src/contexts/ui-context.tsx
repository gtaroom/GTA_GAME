'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type UIContextValue = {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    // New mobile menu functionality
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({
    children,
    defaultOpen = true,
    defaultMobileMenuOpen = false,
    persist = true,
}: {
    children: React.ReactNode;
    defaultOpen?: boolean;
    defaultMobileMenuOpen?: boolean;
    persist?: boolean;
}) {
    // Always start with default values to prevent hydration mismatch
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(defaultOpen);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(defaultMobileMenuOpen);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydration effect - load from localStorage after client-side hydration
    useEffect(() => {
        setIsHydrated(true);
        
        if (typeof window !== 'undefined' && persist) {
            try {
                const savedSidebar = localStorage.getItem('ui.sidebarOpen');
                if (savedSidebar !== null) {
                    setSidebarOpen(savedSidebar === '1');
                }
                
                const savedMobileMenu = localStorage.getItem('ui.mobileMenuOpen');
                if (savedMobileMenu !== null) {
                    setMobileMenuOpen(savedMobileMenu === '1');
                }
            } catch (error) {
                console.warn('Failed to load UI state from localStorage:', error);
            }
        }
    }, [persist]);

    // Save to localStorage when state changes (only after hydration)
    useEffect(() => {
        if (!isHydrated || !persist) return;
        try {
            localStorage.setItem('ui.sidebarOpen', sidebarOpen ? '1' : '0');
        } catch {}
    }, [sidebarOpen, persist, isHydrated]);

    useEffect(() => {
        if (!isHydrated || !persist) return;
        try {
            localStorage.setItem(
                'ui.mobileMenuOpen',
                mobileMenuOpen ? '1' : '0'
            );
        } catch {}
    }, [mobileMenuOpen, persist, isHydrated]);

    // Sidebar functions
    const toggleSidebar = useCallback(() => setSidebarOpen(s => !s), []);
    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    // Mobile menu functions
    const toggleMobileMenu = useCallback(() => setMobileMenuOpen(m => !m), []);
    const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
    const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

    const value = useMemo(
        () => ({
            sidebarOpen,
            toggleSidebar,
            openSidebar,
            closeSidebar,
            mobileMenuOpen,
            toggleMobileMenu,
            openMobileMenu,
            closeMobileMenu,
        }),
        [
            sidebarOpen,
            toggleSidebar,
            openSidebar,
            closeSidebar,
            mobileMenuOpen,
            toggleMobileMenu,
            openMobileMenu,
            closeMobileMenu,
        ]
    );

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within <UIProvider>');
    return ctx;
}
