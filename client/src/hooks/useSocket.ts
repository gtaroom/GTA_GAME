/**
 * Socket Hook
 * Manages WebSocket connections using socket.io-client
 */

import { SocketEvents } from '@/types/notification.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    userId: string;
    role: string;
}

interface UseSocketReturn {
    subscribe: <T>(
        event: SocketEvents,
        callback: (data: T) => void
    ) => () => void;
    socket: Socket | null;
}

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
    'http://localhost:3000';

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let globalUserId: string | null = null;

// Function to clean up global socket
export function disconnectSocket() {
    if (globalSocket) {
        console.log('[Socket] 🧹 Disconnecting global socket');
        globalSocket.disconnect();
        globalSocket = null;
        globalUserId = null;
    }
}

export function useSocket({ userId, role }: UseSocketOptions): UseSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(
        new Map()
    );

    // Initialize socket connection
    useEffect(() => {
        console.log('[Socket] ⚙️ Initializing socket for user:', userId);
        if (!userId || userId.trim() === '') {
            console.log('[Socket] ⏭️ No userId provided, skipping connection');
            setIsConnected(false);
            return;
        }

        // If we already have a socket for this user, reuse it
        if (globalSocket && globalUserId === userId && globalSocket.connected) {
            console.log(
                '[Socket] ♻️ Reusing existing connection for user:',
                userId
            );
            setIsConnected(true);
            return;
        }

        // If we have a socket for a different user, disconnect it
        if (globalSocket && globalUserId !== userId) {
            console.log('[Socket] 🔄 User changed, disconnecting old socket');
            globalSocket.disconnect();
            globalSocket = null;
            globalUserId = null;
        }

        // Create new socket connection
        console.log(
            '[Socket] 🚀 Creating new connection to:',
            SOCKET_URL,
            'for user:',
            userId
        );

        const socket = io(SOCKET_URL, {
            auth: {
                userId,
                role,
            },
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        globalSocket = socket;
        globalUserId = userId;

        // Connection event handlers
        socket.on('connect', () => {
            console.log(
                '[Socket] ✅ Connected! Socket ID:',
                socket.id,
                'for user:',
                userId
            );
            setIsConnected(true);

            // Authenticate the user with the server
            console.log(
                '[Socket] 🔐 Authenticating user:',
                userId,
                'with role:',
                role
            );
            socket.emit(SocketEvents.AUTHENTICATE, { userId, role });
        });

        socket.on('disconnect', reason => {
            console.log('[Socket] ❌ Disconnected. Reason:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', error => {
            console.error('[Socket] ⚠️ Connection error:', error.message);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            console.log(
                '[Socket] 🧹 Component unmounting, but keeping socket alive'
            );
            // Don't disconnect here - let it stay alive for other components
        };
    }, [userId, role]);

    // Subscribe to socket events
    const subscribe = useCallback(
        <T>(event: SocketEvents, callback: (data: T) => void): (() => void) => {
            const socket = globalSocket;
            if (!socket) {
                console.warn(
                    '[Socket] ⚠️ Cannot subscribe to',
                    event,
                    '- socket not initialized'
                );
                return () => {};
            }

            console.log('[Socket] 📡 Subscribing to event:', event);

            // Get or create subscription set for this event
            if (!subscriptionsRef.current.has(event)) {
                subscriptionsRef.current.set(event, new Set());
            }
            const subscriptions = subscriptionsRef.current.get(event)!;

            // Add callback to subscriptions
            subscriptions.add(callback);

            // Create wrapper that calls all callbacks for this event
            const eventHandler = (data: T) => {
                const currentSubscriptions =
                    subscriptionsRef.current.get(event);
                if (currentSubscriptions) {
                    currentSubscriptions.forEach(cb => cb(data));
                }
            };

            // If this is the first subscription to this event, set up the listener
            if (subscriptions.size === 1) {
                socket.on(event, eventHandler);
            }

            // Return unsubscribe function
            return () => {
                console.log('[Socket] 📡 Unsubscribing from event:', event);
                subscriptions.delete(callback);

                // If no more subscriptions for this event, remove the listener
                if (subscriptions.size === 0) {
                    socket.off(event);
                    subscriptionsRef.current.delete(event);
                }
            };
        },
        []
    );

    return {
        subscribe,
        socket: globalSocket,
    };
}
