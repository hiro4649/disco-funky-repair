import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store/store';

/**
 * WebSocket event data structure for holding date updates
 */
interface HoldingDateUpdateEvent {
  userId: number;
  walletAddress: string;
  averageDays: number;
  timestamp: string;
  processingTime: number;
  tierChanged: boolean;
  newTier: number;
}

interface UseWalletDataUpdatesOptions {
  /**
   * Optional callback to execute after update (e.g., refresh wallet data)
   */
  onUpdate?: (event: HoldingDateUpdateEvent) => void;

  /**
   * Optional callback when update starts (e.g., show loading indicator)
   */
  onUpdateStart?: () => void;
}

/**
 * Custom hook to listen for real-time wallet data updates
 *
 * Listens for 'holding-date-updated' events from backend's startRealtimeEventListener system
 * which triggers when Transfer events are detected and holding dates are recalculated.
 *
 * @param options - Optional callbacks
 * @returns {isConnected, lastUpdate, socket} - Connection status, last update timestamp, and socket instance
 *
 * @example
 * ```tsx
 * const { isConnected, lastUpdate } = useWalletDataUpdates({
 *   onUpdate: () => {
 *     // Refresh wallet data
 *     getTokenHoldingPeriod();
 *     getHoldDateHistory();
 *   }
 * });
 * ```
 */
export function useWalletDataUpdates(options?: UseWalletDataUpdatesOptions) {
  const { user_id } = useAppSelector((state) => state.user);
  const socketRef = useRef<Socket | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user_id) {
      console.log('⚠️ User not logged in, skipping WebSocket connection for wallet updates');
      return;
    }

    console.log('🔌 Connecting to WebSocket for wallet data updates...');

    const socketApiUrl = process.env.NEXT_PUBLIC_SOCKET_API_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'ws://localhost:8000');
    if (!socketApiUrl) {
      console.warn('WebSocket URL is not configured; wallet data updates are disabled.');
      return;
    }

    const socket = io(socketApiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected for wallet data updates');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    // Event: Processing started
    socket.on('holding-date-processing', (data: { userId: number; walletAddress: string }) => {
      // Only process events for current user
      if (data.userId !== user_id) {
        return;
      }

      console.log('⏳ Holding date update processing started...');
      setIsUpdating(true);

      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Set timeout to auto-hide loading after 120 seconds (Etherscan fallback worst case)
      // This prevents infinite loading if the completion event is missed due to WebSocket disconnect
      updateTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Holding date update timeout reached (120s) - auto-hiding loading indicator');
        console.warn('   This may indicate the completion event was missed due to WebSocket disconnection');
        setIsUpdating(false);

        // Still try to refresh data even if we missed the completion event
        if (options?.onUpdate) {
          try {
            const fallbackEvent: HoldingDateUpdateEvent = {
              userId: user_id,
              walletAddress: '',
              averageDays: 0,
              timestamp: new Date().toISOString(),
              processingTime: 120,
              tierChanged: false,
              newTier: 0
            };
            options.onUpdate(fallbackEvent);
            console.log('✅ Wallet data refreshed after timeout (fallback)');
          } catch (error) {
            console.error('❌ Failed to execute fallback onUpdate callback:', error);
          }
        }
      }, 120000); // 120 seconds timeout

      // Execute onUpdateStart callback if provided
      if (options?.onUpdateStart) {
        try {
          options.onUpdateStart();
        } catch (error) {
          console.error('❌ Failed to execute onUpdateStart callback:', error);
        }
      }
    });

    // Event: Processing completed
    socket.on('holding-date-updated', async (data: HoldingDateUpdateEvent) => {
      // Only process events for current user
      if (data.userId !== user_id) {
        return;
      }

      console.log('📡 Holding date update received:', {
        averageDays: data.averageDays.toFixed(2),
        processingTime: `${data.processingTime}s`,
        tierChanged: data.tierChanged,
        newTier: data.newTier,
        timestamp: data.timestamp
      });

      // Clear timeout since we received the completion event
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      setLastUpdate(new Date(data.timestamp));
      setIsUpdating(false);

      // Execute callback if provided
      if (options?.onUpdate) {
        try {
          options.onUpdate(data);
          console.log('✅ Wallet data refreshed - average hold duration and transaction history updated');
        } catch (error) {
          console.error('❌ Failed to execute onUpdate callback:', error);
        }
      }
    });

    // Event: Hourly bulk update completed
    socket.on('hourly-holding-duration-updated', async (data: { timestamp: string; message: string; affectedUsers: number; updatedUserIds: number[] }) => {
      // Check if current user was affected by the hourly update
      if (!data.updatedUserIds.includes(user_id)) {
        return;
      }

      console.log('📡 Hourly holding duration update received:', {
        affectedUsers: data.affectedUsers,
        timestamp: data.timestamp
      });

      setLastUpdate(new Date(data.timestamp));

      // Execute callback if provided (refresh wallet data)
      if (options?.onUpdate) {
        try {
          // Create a dummy event with minimal data for hourly update
          const dummyEvent: HoldingDateUpdateEvent = {
            userId: user_id,
            walletAddress: '',
            averageDays: 0,
            timestamp: data.timestamp,
            processingTime: 0,
            tierChanged: false,
            newTier: 0
          };
          options.onUpdate(dummyEvent);
          console.log('✅ Wallet data refreshed from hourly update');
        } catch (error) {
          console.error('❌ Failed to execute onUpdate callback:', error);
        }
      }
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket for wallet data updates...');

      // Clear any pending timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      socket.off('connect');
      socket.off('disconnect');
      socket.off('holding-date-processing');
      socket.off('holding-date-updated');
      socket.off('hourly-holding-duration-updated');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user_id, options?.onUpdate, options?.onUpdateStart]);

  return {
    isConnected,
    isUpdating,
    lastUpdate,
    socket: socketRef.current,
  };
}
