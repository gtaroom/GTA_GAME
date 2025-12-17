'use client';

import AuthGuard from '@/components/auth-guard';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard redirectTo="/login">
            {children}
        </AuthGuard>
    );
}
