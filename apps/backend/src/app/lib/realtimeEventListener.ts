/**
 * Real-Time Event Listener
 *
 * Listens to Transfer events from the token contract via WebSocket
 * and triggers real-time holding date updates for affected users.
 *
 * Key Features:
 * - WebSocket connection to BSC node
 * - Auto-reconnect on disconnect
 * - Processes only registered users
 * - Triggers immediate holding date recalculation
 * - Queues users for tier update check
 */

import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { processUserRealtime } from './realtimeHoldingDateUpdater';
import { alertWebSocketDisconnected, alertWebSocketReconnected } from './discordAlerts';
import { CHAIN_NAME, QUICKNODE_WS_RPC_URL, TOKEN_CONTRACT_ADDRESS } from '../config/env';

const prisma = new PrismaClient();

// Minimal ERC20 ABI for Transfer event
const TOKEN_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)'
];

class RealtimeEventListener {
    private provider: ethers.WebSocketProvider | null = null;
    private contract: ethers.Contract | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000; // 5 seconds
    private lastBlockNumber: number | null = null;
    private disconnectStartTime: number | null = null;

    constructor() {
        if (!QUICKNODE_WS_RPC_URL) {
            console.error('❌ QUICKNODE_WS_RPC_URL not configured! Real-time events will not work.');
            return;
        }

        if (!TOKEN_CONTRACT_ADDRESS) {
            console.error('❌ TOKEN_CONTRACT_ADDRESS not configured!');
            return;
        }

        this.connect();
    }

    /**
     * Connect to WebSocket RPC
     */
    private async connect(): Promise<void> {
        try {
            console.log('🔌 Connecting to QuickNode WebSocket RPC...');

            const wsRpcUrl = QUICKNODE_WS_RPC_URL;
            if (!wsRpcUrl) {
                console.error('QUICKNODE_WS_RPC_URL is not configured');
                return;
            }

            this.provider = new ethers.WebSocketProvider(wsRpcUrl);
            this.contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, this.provider);

            // Set up event listener
            this.contract.on('Transfer', async (from: string, to: string, value: bigint, event: any) => {
                // Track last block number
                if (event?.log?.blockNumber) {
                    this.lastBlockNumber = Number(event.log.blockNumber);
                }
                await this.handleTransferEvent(from, to, value, event);
            });

            // Handle connection events using provider events instead of websocket directly
            this.provider.on('network', async (newNetwork, oldNetwork) => {
                if (oldNetwork === null) {
                    console.log('✅ WebSocket connected successfully');
                    const wasReconnecting = this.reconnectAttempts > 0;
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.disconnectStartTime = null; // Reset on successful connection
                    if (wasReconnecting) {
                        try {
                            await alertWebSocketReconnected();
                            console.log('📡 Discord alert sent: WebSocket reconnected');
                        } catch (e) {
                            console.error('Failed to send WebSocket reconnected alert:', e);
                        }
                    }
                }
            });

            this.provider.on('error', (error: Error) => {
                console.error('❌ WebSocket error:', error.message);
                this.isConnected = false;
                this.disconnectStartTime = Date.now();
                this.handleDisconnect(error);
            });

            console.log(`🎧 Listening for Transfer events on contract: ${TOKEN_CONTRACT_ADDRESS}`);

        } catch (error) {
            console.error('❌ Failed to connect to WebSocket:', error);
            this.disconnectStartTime = Date.now();
            this.handleDisconnect(error as Error);
        }
    }

    /**
     * Handle Transfer event
     */
    private async handleTransferEvent(
        from: string,
        to: string,
        value: bigint,
        event: any
    ): Promise<void> {
        try {
            const fromLower = from.toLowerCase();
            const toLower = to.toLowerCase();

            console.log(`📡 Transfer detected: ${fromLower.slice(0, 8)}... → ${toLower.slice(0, 8)}... (${ethers.formatEther(value)} tokens)`);

            // Extract event data for QuickNode RPC processing
            const eventData = {
                hash: event.log.transactionHash,
                from: fromLower,
                to: toLower,
                value: value,
                blockNumber: event.log.blockNumber
            };

            console.log(`🔍 Transaction hash: ${eventData.hash}, Block: ${eventData.blockNumber}`);

            // Check if from or to are registered users
            const affectedUsers = await prisma.user.findMany({
                where: {
                    wallet_address: {
                        in: [fromLower, toLower]
                    }
                },
                select: {
                    id: true,
                    wallet_address: true
                }
            });

            if (affectedUsers.length === 0) {
                // console.log('ℹ️  No registered users affected by this transfer');
                return;
            }

            console.log(`👥 ${affectedUsers.length} registered user(s) affected`);

            // Process each affected user in real-time with event data
            for (const user of affectedUsers) {
                console.log(`⚡ Processing user ${user.id} (${user.wallet_address.slice(0, 10)}...) in real-time`);

                try {
                    // Pass event data for QuickNode RPC processing (fast path)
                    await processUserRealtime(user.id, user.wallet_address, eventData);
                } catch (error) {
                    console.error(`❌ Failed to process user ${user.id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Error handling Transfer event:', error);
        }
    }

    /**
     * Handle disconnect and attempt reconnect
     */
    private async handleDisconnect(error?: Error): Promise<void> {
        // Calculate downtime
        const downtimeSeconds = this.disconnectStartTime
            ? Math.floor((Date.now() - this.disconnectStartTime) / 1000)
            : undefined;

        // Try to extract close code and reason from error or provider
        let closeCode: number | undefined;
        let closeReason: string | undefined;

        if (error) {
            closeReason = error.message;
            // Try to extract close code from error message
            const codeMatch = error.message.match(/code[:\s]+(\d+)/i);
            if (codeMatch) {
                closeCode = parseInt(codeMatch[1]);
            }
        }

        // Try to get close code from provider's websocket if available
        try {
            const ws = (this.provider as any)?._websocket;
            if (ws && ws.readyState === WebSocket.CLOSED) {
                // WebSocket is closed, but we can't get close code after the fact
                // This is a limitation - we'd need to track it during close event
            }
        } catch (e) {
            // Ignore
        }

        // Determine provider name from URL
        const providerName = QUICKNODE_WS_RPC_URL?.includes('quicknode') ? 'QuickNode' : 'Unknown';
        const chainName = CHAIN_NAME;

        // Send Discord alert about disconnection with diagnostic info
        try {
            await alertWebSocketDisconnected(this.reconnectAttempts + 1, {
                provider: providerName,
                chain: chainName,
                closeCode,
                closeReason,
                lastBlockNumber: this.lastBlockNumber || undefined,
                downtimeSeconds
            });
            console.log(`📡 Discord alert sent for WebSocket disconnect (attempt ${this.reconnectAttempts + 1})`);
        } catch (alertError) {
            console.error('Failed to send WebSocket disconnect alert:', alertError);
        }

        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error(`❌ Max reconnection attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
            return;
        }

        this.reconnectAttempts++;
        const delay = this.RECONNECT_DELAY * this.reconnectAttempts;

        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}) in ${delay / 1000}s...`);

        await this.sleep(delay);

        // Clean up old connection
        if (this.provider) {
            try {
                await this.provider.destroy();
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        // Attempt reconnection
        this.connect();
    }

    /**
     * Graceful shutdown
     */
    async stop(): Promise<void> {
        console.log('🛑 Stopping real-time event listener...');

        if (this.contract) {
            this.contract.removeAllListeners();
        }

        if (this.provider) {
            await this.provider.destroy();
        }

        this.isConnected = false;
        console.log('✅ Real-time event listener stopped');
    }

    /**
     * Get connection status
     */
    getStatus(): { connected: boolean; reconnectAttempts: number } {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
let eventListener: RealtimeEventListener | null = null;

export const startRealtimeEventListener = (): RealtimeEventListener => {
    if (!eventListener) {
        eventListener = new RealtimeEventListener();
    }
    return eventListener;
};

export const stopRealtimeEventListener = async (): Promise<void> => {
    if (eventListener) {
        await eventListener.stop();
        eventListener = null;
    }
};

export const getEventListenerStatus = (): { connected: boolean; reconnectAttempts: number } | null => {
    return eventListener ? eventListener.getStatus() : null;
};

export default { startRealtimeEventListener, stopRealtimeEventListener, getEventListenerStatus };
