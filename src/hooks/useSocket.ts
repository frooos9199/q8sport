'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null
  });

  const { autoConnect = true, onConnect, onDisconnect, onError } = options;

  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setState(prev => ({ ...prev, error: 'No authentication token' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false,
        socket,
        error: null
      }));
      onConnect?.();
    });

    socket.on('disconnect', () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false 
      }));
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isConnecting: false 
      }));
      onError?.(error);
    });

    return () => {
      socket.disconnect();
    };
  }, [autoConnect, onConnect, onDisconnect, onError]);

  const connect = () => {
    if (state.socket && !state.isConnected) {
      state.socket.connect();
    }
  };

  const disconnect = () => {
    if (state.socket && state.isConnected) {
      state.socket.disconnect();
    }
  };

  const emit = (event: string, data?: any) => {
    if (state.socket && state.isConnected) {
      state.socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (state.socket) {
      state.socket.on(event, callback);
      return () => state.socket?.off(event, callback);
    }
  };

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on
  };
};

export default useSocket;