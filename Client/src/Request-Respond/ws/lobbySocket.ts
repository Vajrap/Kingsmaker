import type {
    LobbyClientMessage,
    LobbyServerMessage,
    GameRoom,
} from "@shared/types/types";
import { sessionManager } from "@/singleton/sessionManager";

export type LobbyEventHandler = {
    onRoomCreated?: (roomId: string) => void;
    onRoomJoined?: (roomId: string, success: boolean) => void;
    onRoomLeft?: (roomId: string) => void;
    onRoomList?: (rooms: GameRoom[]) => void;
    onLobbyUpdate?: (
        rooms: GameRoom[],
        onlinePlayers: number,
    ) => void;
    onError?: (message: string, code: string) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
};

class LobbySocket {
    private ws: WebSocket | null = null;
    private handlers: LobbyEventHandler = {};
    private isConnected = false;
    private isAuthenticated = false;
    private connectionPromise: Promise<void> | null = null;
    private isConnecting = false; // Flag to prevent multiple simultaneous connection attempts

    connect(handlers: LobbyEventHandler): Promise<void> {
        // If already connecting, return the existing promise
        if (this.connectionPromise || this.isConnecting) {
            console.log(
                "Connection already in progress, returning existing promise",
            );
            return (
                this.connectionPromise ||
                Promise.reject(new Error("Connection in progress"))
            );
        }

        console.log("Starting new WebSocket connection");
        this.isConnecting = true;

        // Reset connection state
        this.isConnected = false;
        this.isAuthenticated = false;

        this.connectionPromise = new Promise((resolve, reject) => {
            this.handlers = handlers;

            const wsUrl = `ws://localhost:7004/lobby`;
            this.ws = new WebSocket(wsUrl);
            console.log(`WS URL: ${wsUrl}`);

            let isResolved = false;

            this.ws.onopen = () => {
                console.log("Lobby WebSocket connected");
                this.isConnected = true;

                // Send initial message immediately to break the deadlock
                const session = sessionManager.getSession();
                if (session) {
                    console.log("Sending initial GET_ROOM_LIST message");
                    this.sendMessage({
                        type: "GET_ROOM_LIST",
                        data: { sessionId: session.sessionId },
                    });
                } else {
                    console.error("No session found for WebSocket connection");
                    reject(new Error("No session available"));
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: LobbyServerMessage = JSON.parse(event.data);

                    // Handle authentication based on first message response
                    if (!this.isAuthenticated) {
                        if (message.type === "ERROR") {
                            console.error(
                                "Authentication failed:",
                                message.data,
                            );
                            this.isConnecting = false;
                            if (!isResolved) {
                                isResolved = true;
                                reject(
                                    new Error(
                                        `Authentication failed: ${message.data.message}`,
                                    ),
                                );
                            }
                            return;
                        } else {
                            // Any non-error message means authentication succeeded
                            console.log(
                                "Lobby WebSocket authenticated successfully",
                            );
                            this.isAuthenticated = true;
                            this.isConnecting = false;
                            this.handlers.onConnected?.();
                            if (!isResolved) {
                                isResolved = true;
                                resolve();
                            }
                        }
                    }

                    this.handleMessage(message);
                } catch (error) {
                    console.error("Error parsing lobby message:", error);
                }
            };

            this.ws.onclose = (event) => {
                console.log(
                    "Lobby WebSocket disconnected, code:",
                    event.code,
                    "reason:",
                    event.reason,
                );
                this.isConnected = false;
                this.isAuthenticated = false;
                this.connectionPromise = null;
                this.isConnecting = false; // Reset connecting flag

                // Only call onDisconnected if it wasn't a manual disconnect
                if (event.code !== 1000) {
                    this.handlers.onDisconnected?.();
                }

                // Automatic reconnection is disabled - let the UI handle retry via modal
                console.log(
                    "Automatic reconnection disabled - waiting for manual retry",
                );

                if (!isResolved) {
                    isResolved = true;
                    reject(
                        new Error(
                            `WebSocket closed: ${event.code} ${event.reason}`,
                        ),
                    );
                }
            };

            this.ws.onerror = (error) => {
                console.error("Lobby WebSocket error:", error);
                this.isConnecting = false; // Reset connecting flag on error
                if (!isResolved) {
                    isResolved = true;
                    reject(error);
                }
            };

            // Timeout for connection
            setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    this.isConnecting = false; // Reset connecting flag on timeout
                    this.disconnect();
                    reject(new Error("Connection timeout"));
                }
            }, 10000); // 10 second timeout
        });

        return this.connectionPromise;
    }

    private handleMessage(message: LobbyServerMessage) {
        switch (message.type) {
            case "ROOM_LIST":
                this.handlers.onRoomList?.(message.data.rooms);
                break;
            case "ROOM_CREATED":
                this.handlers.onRoomCreated?.(message.data.roomId);
                break;
            case "ROOM_JOINED":
                this.handlers.onRoomJoined?.(
                    message.data.roomId,
                    message.data.success,
                );
                break;
            case "LOBBY_UPDATE":
                this.handlers.onLobbyUpdate?.(
                    message.data.rooms,
                    message.data.onlinePlayers,
                );
                break;
            case "ERROR":
                this.handlers.onError?.(
                    message.data.message,
                    message.data.code,
                );
                break;
        }
    }

    // Internal method for sending messages without authentication check
    private sendMessage(message: LobbyClientMessage) {
        if (
            this.ws &&
            this.isConnected &&
            this.ws.readyState === WebSocket.OPEN
        ) {
            console.log("Sending message:", message);
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn("Cannot send message: WebSocket not connected");
        }
    }

    // Public method for sending messages (requires authentication)
    private send(message: LobbyClientMessage) {
        if (!this.isAuthenticated) {
            console.warn("Cannot send message: not authenticated");
            return;
        }
        this.sendMessage(message);
    }

    // Lobby actions - updated for new lobby service API
    createRoom(
        sessionId: string,
        settings: {
            roomName: string;
            maxPlayers: 2 | 3 | 4;
            turnTimeLimit: number;
            allowSpectators: boolean;
            allowAnonymousSpectators: boolean;
            mapSeed: string;
        },
    ) {
        const gameRoom: GameRoom = {
            id: "", // Will be set by room service
            name: settings.roomName,
            state: "WAITING",
            players: [], // Host will be added by room service
            maxPlayers: settings.maxPlayers,
            turnTimeLimit: settings.turnTimeLimit,
            allowSpectators: settings.allowSpectators,
            allowAnonymousSpectators: settings.allowAnonymousSpectators,
            spectators: [],
            mapSeed: settings.mapSeed,
        };

        this.send({
            type: "CREATE_ROOM",
            data: {
                sessionId: sessionId,
                data: gameRoom,
            },
        });
    }

    joinRoom(sessionId: string, roomId: string) {
        this.send({
            type: "JOIN_ROOM",
            data: { sessionId, roomId },
        });
    }

    getRoomList(sessionId: string) {
        this.send({
            type: "GET_ROOM_LIST",
            data: { sessionId },
        });
    }

    disconnect() {
        console.log("Disconnecting WebSocket");

        if (this.ws) {
            // Remove event listeners to prevent unwanted callbacks
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.onmessage = null;
            this.ws.onopen = null;

            // Close the connection
            if (
                this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING
            ) {
                this.ws.close(1000, "Manual disconnect"); // Normal closure
            }

            this.ws = null;
        }

        this.isConnected = false;
        this.isAuthenticated = false;
        this.connectionPromise = null;
        this.isConnecting = false;
    }

    // Method to manually retry connection, used by retry modal
    retryConnection(): Promise<void> {
        console.log("Manual retry connection requested");

        // Ensure we disconnect any existing connection first
        this.disconnect();

        // Reset state for fresh connection
        this.connectionPromise = null;
        this.isConnected = false;
        this.isAuthenticated = false;

        return this.connect(this.handlers);
    }

    getConnectionStatus(): boolean {
        return this.isConnected && this.isAuthenticated;
    }
}

export const lobbySocket = new LobbySocket();
