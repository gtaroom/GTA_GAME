import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // For now, just pass through all requests
    // Client-side components will handle authentication-based redirects
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Disable middleware matching for now to avoid conflicts
        // '/',
        // '/home'
    ],
};
