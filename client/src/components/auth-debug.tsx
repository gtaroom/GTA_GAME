'use client';
import { useAuth } from '@/contexts/auth-context';
import { useVip } from '@/contexts/vip-context';

export default function AuthDebug() {
    const { isLoggedIn, user, isInitializing } = useAuth();
    const { vipStatus, isLoading: vipLoading } = useVip();

    return (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
            <h3 className="font-bold mb-2">Auth Debug</h3>
            <div>isInitializing: {isInitializing ? 'true' : 'false'}</div>
            <div>isLoggedIn: {isLoggedIn ? 'true' : 'false'}</div>
            <div>user: {user ? 'exists' : 'null'}</div>
            <div>vipLoading: {vipLoading ? 'true' : 'false'}</div>
            <div>vipStatus: {vipStatus ? 'exists' : 'null'}</div>
            <div className="mt-2 text-xs text-gray-400">
                Check browser console for more details
            </div>
        </div>
    );
}
