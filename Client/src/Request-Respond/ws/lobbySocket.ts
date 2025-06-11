import type { ClientMessage, ServerMessage, GameRoom, RoomSettings, PlayerCharacterSetup, PlayerSlot, ServerError } from '@shared/types';
import { sessionManager } from '@/singleton/sessionManager';


export type LobbyEventHandler = {
  onRoomCreated?: (room: GameRoom) => void;
  onRoomJoined?: (room: GameRoom) => void;
  onRoomLeft?: (roomId: string) => void;
  onRoomUpdated?: (room: GameRoom) => void;
  onPlayerJoined?: (roomId: string, player: PlayerSlot) => void;
  onPlayerLeft?: (roomId: string, userId: string) => void;
  onCharacterUpdated?: (roomId: string, userId: string, character: PlayerCharacterSetup) => void;
  onGameStarting?: (roomId: string, turnOrder: string[]) => void;
  onGameStarted?: (roomId: string, gameId: string) => void;
  onRoomList?: (rooms: GameRoom[]) => void;
  onRoomInfoAndJoin?: (room: GameRoom) => void;
  onRoomPresence?: (roomId: string, userId: string) => boolean;
  onError?: (message: string) => void;
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
      console.log('Connection already in progress, returning existing promise');
      return this.connectionPromise || Promise.reject(new Error('Connection in progress'));
    }

    console.log('Starting new WebSocket connection');
    this.isConnecting = true;

    // Reset connection state
    this.isConnected = false;
    this.isAuthenticated = false;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.handlers = handlers;

      const wsUrl = `ws://localhost:3000/lobby`;
      this.ws = new WebSocket(wsUrl);

      let isResolved = false;

      this.ws.onopen = () => {
        console.log('Lobby WebSocket connected, authenticating...');
        this.isConnected = true;
        
        // Authenticate immediately after connection
        this.authenticate();
        // Don't call onConnected here - wait for auth success
      };

      this.ws.onmessage = (event) => {
        try {
          const message: ServerMessage | ServerError = JSON.parse(event.data);
          
          // Handle auth response specially
          if (message.head === 'auth-ok') {
            console.log('Lobby authentication successful');
            this.isAuthenticated = true;
            this.isConnecting = false; // Reset connecting flag on successful connection
            this.handlers.onConnected?.();
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          } else if (message.head === 'error') {
            // Check if this is an auth error during the connection phase
            if (!this.isAuthenticated) {
              console.error('Lobby authentication failed:', message.body.message);
              this.isConnecting = false; // Reset connecting flag on auth failure
              this.disconnect();
              if (!isResolved) {
                isResolved = true;
                reject(new Error(`Authentication failed: ${message.body.message}`));
              }
            } else {
              // Regular error during normal operation
              this.handleMessage(message);
            }
          } else {
            this.handleMessage(message);
          }
        } catch (error) {
          console.error('Error parsing lobby message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Lobby WebSocket disconnected, code:', event.code, 'reason:', event.reason);
        this.isConnected = false;
        this.isAuthenticated = false;
        this.connectionPromise = null;
        this.isConnecting = false; // Reset connecting flag
        
        // Only call onDisconnected if it wasn't a manual disconnect
        if (event.code !== 1000) {
          this.handlers.onDisconnected?.();
        }
        
        // Automatic reconnection is disabled - let the UI handle retry via modal
        console.log('Automatic reconnection disabled - waiting for manual retry');

        if (!isResolved) {
          isResolved = true;
          reject(new Error(`WebSocket closed: ${event.code} ${event.reason}`));
        }
      };

      this.ws.onerror = (error) => {
        console.error('Lobby WebSocket error:', error);
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
          reject(new Error('Connection timeout'));
        }
      }, 10000); // 10 second timeout
    });

    return this.connectionPromise;
  }

  private async authenticate() {
    const session = sessionManager.getSession();
    if (session) {
      console.log('Authenticating with session:', session.sessionID);
      this.send({
        head: "auth",
        body: { token: session.sessionID }
      });
    } else {
      console.error('No session available for authentication');
      this.disconnect();
    }
  }

  private handleMessage(message: ServerMessage | ServerError) {
    switch (message.head) {
      case 'room-created':
        this.handlers.onRoomCreated?.(message.body.room);
        break;
      case 'room-joined':
        this.handlers.onRoomJoined?.(message.body.room);
        break;
      case 'room-left':
        this.handlers.onRoomLeft?.(message.body.roomId);
        break;
      case 'room-updated':
        this.handlers.onRoomUpdated?.(message.body.room);
        break;
      case 'player-joined':
        this.handlers.onPlayerJoined?.(message.body.roomId, message.body.player);
        break;
      case 'player-left':
        this.handlers.onPlayerLeft?.(message.body.roomId, message.body.userId);
        break;
      case 'character-updated':
        this.handlers.onCharacterUpdated?.(message.body.roomId, message.body.userId, message.body.character);
        break;
      case 'game-starting':
        this.handlers.onGameStarting?.(message.body.roomId, message.body.turnOrder);
        break;
      case 'game-started':
        this.handlers.onGameStarted?.(message.body.roomId, message.body.gameId);
        break;
      case 'room-list':
        this.handlers.onRoomList?.(message.body.rooms);
        break;
      case 'room-info':
        this.handlers.onRoomInfoAndJoin?.(message.body.room);
        break;
      case 'room-presence':
        this.handlers.onRoomPresence?.(message.body.roomId, message.body.userId);
        break;
      case 'room-presence-check':
        // Respond to presence check from server
        this.handlePresenceCheck(message.body.roomId, message.body.userId, message.body.timestamp);
        break;
      case 'error':
        this.handlers.onError?.(message.body.message);
        break;
    }
  }

  private send(message: ClientMessage) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected or authenticated');
    }
  }

  private handlePresenceCheck(roomId: string, userId: string, timestamp: number) {
    console.log(`=== CLIENT RECEIVED PRESENCE CHECK ===`);
    console.log(`RoomId: ${roomId}, UserId: ${userId}, Timestamp: ${timestamp}`);
    
    // Only respond if we're actually in this room and this is for us
    const session = sessionManager.getSession();
    if (!session || !this.handlers.onRoomPresence) {
      console.log(`No session (${!!session}) or no onRoomPresence handler (${!!this.handlers.onRoomPresence})`);
      return;
    }
    
    // Check if we're actually in this room
    const isInRoom = this.handlers.onRoomPresence(roomId, userId);
    console.log(`Am I in room? ${isInRoom}`);
    
    if (isInRoom) {
      // Send presence response with session ID
      const responseMessage = {
        head: "room-presence-response" as const,
        body: { 
          roomId, 
          timestamp,
          sessionId: session.sessionID 
        }
      };
      console.log(`📤 Sending presence response:`, responseMessage);
      this.send(responseMessage);
      console.log(`✅ Sent presence response for room ${roomId}`);
    } else {
      console.log(`❌ Ignoring presence check for room ${roomId} - not in room`);
    }
  }

  // Lobby actions
  createRoom(name: string, settings: RoomSettings) {
    if (!this.isAuthenticated) {
      console.warn('Cannot create room: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot create room: no session available');
      return;
    }
    
    this.send({
      head: "create-room",
      body: { 
        sessionId: session.sessionID,
        name, 
        settings 
      }
    });
  }

  joinRoom(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot join room: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot join room: no session available');
      return;
    }
    
    this.send({
      head: "join-room",
      body: { sessionId: session.sessionID, roomId }
    });
  }

  leaveRoom(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot leave room: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot leave room: no session available');
      return;
    }
    
    this.send({
      head: "leave-room",
      body: { sessionId: session.sessionID, roomId }
    });
  }

  updateCharacter(character: PlayerCharacterSetup) {
    if (!this.isAuthenticated) {
      console.warn('Cannot update character: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot update character: no session available');
      return;
    }
    
    this.send({
      head: "update-character",
      body: { sessionId: session.sessionID, character }
    });
  }

  toggleReady(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot toggle ready: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot toggle ready: no session available');
      return;
    }
    
    this.send({
      head: "toggle-ready",
      body: { sessionId: session.sessionID, roomId }
    });
  }

  startGame(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot start game: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot start game: no session available');
      return;
    }
    
    this.send({
      head: "start-game",
      body: { sessionId: session.sessionID, roomId }
    });
  }

  getRoomList() {
    if (!this.isAuthenticated) {
      console.warn('Cannot get room list: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot get room list: no session available');
      return;
    }
    
    this.send({
      head: "get-room-list",
      body: { sessionId: session.sessionID }
    });
  }

  getRoomInfo(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot get room info: not authenticated');
      return;
    }
    
    const session = sessionManager.getSession();
    if (!session) {
      console.warn('Cannot get room info: no session available');
      return;
    }
    
    this.send({
      head: "get-room-info",
      body: { sessionId: session.sessionID, roomId }
    });
  }

  disconnect() {
    console.log('Disconnecting WebSocket');
    
    if (this.ws) {
      // Remove event listeners to prevent unwanted callbacks
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      
      // Close the connection
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Manual disconnect'); // Normal closure
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
    console.log('Manual retry connection requested');
    
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