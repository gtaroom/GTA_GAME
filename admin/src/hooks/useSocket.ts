import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types/socket.types';

interface UseSocketOptions {
  userId: string;
  role: string;
  serverUrl?: string;
}

export const useSocket = ({ userId, role, serverUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000' }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Setup the socket connection
  useEffect(() => {
    if (!userId) return;

    // Initialize the socket connection
    const socket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      // Authenticate the user
      socket.emit(SocketEvents.AUTHENTICATE, { userId, role });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, role, serverUrl]);

  // Subscribe to a socket event
  const subscribe = useCallback(
    <T>(event: string, callback: (data: T) => void) => {
      if (!socketRef.current) return () => {};

      socketRef.current.on(event, callback);

      // Return an unsubscribe function
      return () => {
        socketRef.current?.off(event, callback);
      };
    },
    []
  );

  // Emit a socket event
  const emit = useCallback(
    <T>(event: string, data: T) => {
      if (!socketRef.current || !isConnected) return;
      socketRef.current.emit(event, data);
    },
    [isConnected]
  );

  return {
    isConnected,
    socket: socketRef.current,
    subscribe,
    emit,
  };
}; 