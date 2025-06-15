import type { 
  LobbyClientMessage, 
  LobbyServerMessage, 
  WaitingRoomMetadata
} from '@shared/types/types';


export type LobbyEventHandler = {
  onRoomCreated?: (room: WaitingRoomMetadata) => void;
  onRoomJoined?: (roomId: string, success: boolean) => void;
  onRoomLeft?: (roomId: string) => void;
  onRoomList?: (rooms: WaitingRoomMetadata[]) => void;
  onLobbyUpdate?: (rooms: WaitingRoomMetadata[], onlinePlayers: number) => void;
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

      const wsUrl = `ws://localhost:7004`;
      this.ws = new WebSocket(wsUrl);

      let isResolved = false;

      this.ws.onopen = () => {
        console.log('Lobby WebSocket connected');
        this.isConnected = true;
        // Connection success will be handled in onmessage
      };

      this.ws.onmessage = (event) => {
        try {
          const message: LobbyServerMessage = JSON.parse(event.data);
          
          // Handle connection success - lobby service doesn't require separate auth
          if (!this.isAuthenticated) {
            console.log('Lobby WebSocket connected successfully');
            this.isAuthenticated = true;
            this.isConnecting = false;
            this.handlers.onConnected?.();
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          }
          
          this.handleMessage(message);
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

  private handleMessage(message: LobbyServerMessage) {
    switch (message.type) {
      case 'ROOM_LIST':
        this.handlers.onRoomList?.(message.data.rooms);
        break;
      case 'ROOM_CREATED':
        this.handlers.onRoomCreated?.(message.data.room);
        break;
      case 'ROOM_JOINED':
        this.handlers.onRoomJoined?.(message.data.roomId, message.data.success);
        break;
      case 'LOBBY_UPDATE':
        this.handlers.onLobbyUpdate?.(message.data.rooms, message.data.onlinePlayers);
        break;
      case 'ERROR':
        this.handlers.onError?.(message.data.message, message.data.code);
        break;
    }
  }

  private send(message: LobbyClientMessage) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected or authenticated');
    }
  }

  // Lobby actions - updated for new lobby service API
  createRoom(name: string, maxPlayers: 2 | 3 | 4) {
    if (!this.isAuthenticated) {
      console.warn('Cannot create room: not authenticated');
      return;
    }
    
    this.send({
      type: "CREATE_ROOM",
      data: { name, maxPlayers }
    });
  }

  joinRoom(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot join room: not authenticated');
      return;
    }
    
    this.send({
      type: "JOIN_ROOM",
      data: { roomId }
    });
  }

  leaveRoom(roomId: string) {
    if (!this.isAuthenticated) {
      console.warn('Cannot leave room: not authenticated');
      return;
    }
    
    this.send({
      type: "LEAVE_ROOM",
      data: { roomId }
    });
  }

  getRoomList() {
    if (!this.isAuthenticated) {
      console.warn('Cannot get room list: not authenticated');
      return;
    }
    
    this.send({
      type: "GET_ROOM_LIST",
      data: {}
    });
  }

  refreshLobby() {
    if (!this.isAuthenticated) {
      console.warn('Cannot refresh lobby: not authenticated');
      return;
    }
    
    this.send({
      type: "REFRESH_LOBBY",
      data: {}
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