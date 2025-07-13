import type { GameRoom, Player } from '@shared/types/types';
import { sessionManager } from '@/singleton/sessionManager';

// WebSocket message types for waiting room
export type WaitingRoomClientMessage =
    | { type: "GET_ROOM_DATA"; data: { sessionId: string; roomId: string } }
    | { type: "PLAYER_UPDATE"; data: { sessionId: string; roomId: string; updateData: unknown } }
    | { type: "LEAVE_ROOM"; data: { sessionId: string; roomId: string } };

export type WaitingRoomServerMessage =
    | { 
        type: "ROOM_DATA"; 
        data: { 
            room: GameRoom & { players: (Player & { displayStatus: string })[] };
            playerRole: 'host' | 'player';
            connectionInfo: { connectedPlayers: number; disconnectedPlayers: number };
        }
    }
    | { type: "PLAYER_STATUS_UPDATE"; data: { players: (Player & { displayStatus: string })[] } }
    | { type: "ERROR"; data: { code: string; message: string } };

export type WaitingRoomEventHandler = {
    onRoomData?: (roomData: { 
        room: GameRoom & { players: (Player & { displayStatus: string })[] };
        playerRole: 'host' | 'player';
        connectionInfo: { connectedPlayers: number; disconnectedPlayers: number };
    }) => void;
    onPlayerStatusUpdate?: (players: (Player & { displayStatus: string })[]) => void;
    onError?: (message: string, code: string) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
};

class WaitingRoomSocket {
    private ws: WebSocket | null = null;
    private handlers: WaitingRoomEventHandler = {};
    private isConnected = false;
    private connectionPromise: Promise<void> | null = null;
    private isConnecting = false;
    private roomId: string | null = null;

    connect(roomId: string, handlers: WaitingRoomEventHandler): Promise<void> {
        // If already connecting, return the existing promise
        if (this.connectionPromise || this.isConnecting) {
            console.log("WaitingRoom connection already in progress");
            return this.connectionPromise || Promise.reject(new Error("Connection in progress"));
        }

        console.log(`Starting WaitingRoom WebSocket connection to room ${roomId}`);
        this.isConnecting = true;
        this.roomId = roomId;

        // Reset connection state
        this.isConnected = false;

        this.connectionPromise = new Promise((resolve, reject) => {
            this.handlers = handlers;

            const wsUrl = `ws://localhost:7005/room`;
            this.ws = new WebSocket(wsUrl);
            console.log(`WaitingRoom WS URL: ${wsUrl}`);

            let isResolved = false;

            this.ws.onopen = () => {
                console.log("WaitingRoom WebSocket connected");
                this.isConnected = true;

                // Send initial message to get room data
                const session = sessionManager.getSession();
                if (session) {
                    console.log(`Sending GET_ROOM_DATA for room ${roomId}`);
                    this.sendMessage({
                        type: "GET_ROOM_DATA",
                        data: { sessionId: session.sessionId, roomId: roomId }
                    });
                } else {
                    console.error("No session found for WaitingRoom WebSocket connection");
                    reject(new Error("No session available"));
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WaitingRoomServerMessage = JSON.parse(event.data);
                    console.log("WaitingRoom message received:", message);

                    // Handle first successful message as connection confirmation
                    if (!isResolved && message.type !== "ERROR") {
                        console.log("WaitingRoom WebSocket authenticated successfully");
                        this.isConnecting = false;
                        this.handlers.onConnected?.();
                        isResolved = true;
                        resolve();
                    }

                    this.handleMessage(message);
                } catch (error) {
                    console.error("Error parsing WaitingRoom message:", error);
                    if (!isResolved) {
                        isResolved = true;
                        reject(error);
                    }
                }
            };

            this.ws.onclose = (event) => {
                console.log("WaitingRoom WebSocket disconnected, code:", event.code, "reason:", event.reason);
                this.isConnected = false;
                this.connectionPromise = null;
                this.isConnecting = false;

                // Only call onDisconnected if it wasn't a manual disconnect
                if (event.code !== 1000) {
                    this.handlers.onDisconnected?.();
                }

                if (!isResolved) {
                    isResolved = true;
                    reject(new Error(`WaitingRoom WebSocket closed: ${event.code} ${event.reason}`));
                }
            };

            this.ws.onerror = (error) => {
                console.error("WaitingRoom WebSocket error:", error);
                this.isConnecting = false;
                if (!isResolved) {
                    isResolved = true;
                    reject(error);
                }
            };

            // Timeout for connection
            setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    this.isConnecting = false;
                    this.disconnect();
                    reject(new Error("WaitingRoom connection timeout"));
                }
            }, 10000); // 10 second timeout
        });

        return this.connectionPromise;
    }

    private handleMessage(message: WaitingRoomServerMessage) {
        switch (message.type) {
            case "ROOM_DATA":
                this.handlers.onRoomData?.(message.data);
                break;
            case "PLAYER_STATUS_UPDATE":
                this.handlers.onPlayerStatusUpdate?.(message.data.players);
                break;
            case "ERROR":
                this.handlers.onError?.(message.data.message, message.data.code);
                break;
        }
    }

    private sendMessage(message: WaitingRoomClientMessage) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error("Cannot send message - WaitingRoom WebSocket not connected");
        }
    }

    // Public methods
    refreshRoomData() {
        const session = sessionManager.getSession();
        if (session && this.roomId) {
            this.sendMessage({
                type: "GET_ROOM_DATA",
                data: { sessionId: session.sessionId, roomId: this.roomId }
            });
        }
    }

    leaveRoom() {
        const session = sessionManager.getSession();
        if (session && this.roomId) {
            this.sendMessage({
                type: "LEAVE_ROOM",
                data: { sessionId: session.sessionId, roomId: this.roomId }
            });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close(1000, "Manual disconnect");
            this.ws = null;
        }
        this.isConnected = false;
        this.connectionPromise = null;
        this.isConnecting = false;
        this.roomId = null;
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    retryConnection(): Promise<void> {
        if (this.roomId) {
            return this.connect(this.roomId, this.handlers);
        }
        return Promise.reject(new Error("No room ID available for retry"));
    }
}

export const waitingRoomSocket = new WaitingRoomSocket(); 