/**
 * Custom Hook: useTicketBalanceUpdates
 *
 * Listens for WebSocket events from the backend when the 6-hour
 * token balance update completes (at 0, 6, 12, 18 UTC).
 *
 * Automatically refreshes user data when the update is detected.
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { refreshUserInfo } from '@/utils/refreshUserInfo';
import { useAppDispatch, useAppSelector } from '@/store/store';

interface TicketBalanceUpdateEvent {
  timestamp: string;
  message: string;
  affectedUsers: number;
}

interface UseTicketBalanceUpdatesOptions {
  /** Optional callback to execute after successful refresh */
  onUpdate?: () => void;
}

export function useTicketBalanceUpdates(options?: UseTicketBalanceUpdatesOptions) {
  const dispatch = useAppDispatch();
  const { user_id } = useAppSelector((state) => state.user);
  const socketRef = useRef<Socket | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only initialize WebSocket if user is logged in
    if (!user_id) {
      console.log('⚠️ User not logged in, skipping WebSocket connection');
      return;
    }

    const socketApiUrl = process.env.NEXT_PUBLIC_SOCKET_API_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'ws://localhost:8000');
    if (!socketApiUrl) {
      console.warn('WebSocket URL is not configured; ticket balance updates are disabled.');
      return;
    }

    // Initialize Socket.IO connection
    const socket = io(socketApiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected for ticket balance updates');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    // Listen for ticket balance update events
    socket.on('ticket-balance-updated', async (data: TicketBalanceUpdateEvent) => {
      console.log('📡 Ticket balance update received:', data);
      setLastUpdate(new Date(data.timestamp));

      // Refresh user data to get updated:
      // - claimTickets (newly distributed tickets to claim)
      // - sixHourTokenBalance (pending 24h hold token balance)
      // - tallyTokenBalance (24h held tokens / total balance)
      // - fan_points (from referral rewards if any)
      try {
        await refreshUserInfo(user_id, dispatch);
        console.log('✅ User data refreshed - claimTickets, sixHourTokenBalance, tallyTokenBalance updated');

        // Execute optional callback (e.g., fetchTicketAndBalance in Lottery component)
        if (options?.onUpdate) {
          options.onUpdate();
        }
      } catch (error) {
        console.error('❌ Failed to refresh user info:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ticket-balance-updated');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user_id, dispatch, options?.onUpdate]);

  return {
    isConnected,
    lastUpdate,
    socket: socketRef.current,
  };
}
