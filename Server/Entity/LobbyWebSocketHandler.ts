import type { ClientMessage, ServerMessage } from "../Request-Respond/messages";
import { handleAuthMessage } from "../Request-Respond/auth";
import { LobbyManager } from "./LobbyManager";
import { AuthService } from "./AuthService";
import type { ElysiaWS } from "elysia/ws";

// Define our authenticated WebSocket type
interface AuthenticatedWebSocket extends ElysiaWS {
  user?: {
    id: string;
    username: string;
    userType: 'registered' | 'guest';
  };
}

const userConnections = new Map<string, AuthenticatedWebSocket>(); // userId -> WebSocket connection
const lobbyManager = new LobbyManager();

// Helper function to validate session from message
async function validateSessionFromMessage(sessionId: string): Promise<{ id: string; username: string; userType: 'registered' | 'guest' } | null> {
  try {
    const user = await AuthService.validateSession(sessionId);
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      userType: user.type as 'registered' | 'guest'
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export class LobbyWebSocketHandler {
  static async handleConnection(ws: AuthenticatedWebSocket) {
    console.log("ws", ws);
    console.log("Lobby WebSocket connection opened");
  }

  static async handleMessage(ws: AuthenticatedWebSocket, message: string) {
    console.log("Lobby WebSocket message received:", message);
    try {
      const clientMessage = JSON.parse(message) as ClientMessage;
      await this.processMessage(ws, clientMessage);
    } catch (error) {
      console.error("Error parsing lobby message:", error);
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Invalid message format" }
      }));
    }
  }

  static async handleClose(ws: AuthenticatedWebSocket) {
    console.log("Lobby WebSocket connection closed");
    const user = ws.user;
    if (user) {
      userConnections.delete(user.id);
      
      const currentRoomId = lobbyManager.getPlayerRoom(user.id);
      if (currentRoomId) {
        const success = lobbyManager.leaveRoom(currentRoomId, user.id);
        if (success) {
          this.broadcastToRoom(currentRoomId, {
            head: "player-left",
            body: { roomId: currentRoomId, userId: user.id }
          });
        }
      }
    }
  }

  static cleanupOldRooms() {
    lobbyManager.cleanupOldRooms();
  }

  private static async processMessage(ws: AuthenticatedWebSocket, message: ClientMessage) {
    try {
      console.log(`Processing message: ${message.head}`);
      
      switch (message.head) {
        case "auth":
          await this.handleAuth(ws, message);
          break;

        case "create-room":
          console.log("About to handle create-room message");
          await this.handleCreateRoom(ws, message);
          console.log("Finished handling create-room message");
          break;

        case "join-room":
          await this.handleJoinRoom(ws, message);
          break;

        case "leave-room":
          await this.handleLeaveRoom(ws, message);
          break;

        case "update-character":
          await this.handleUpdateCharacter(ws, message);
          break;

        case "toggle-ready":
          await this.handleToggleReady(ws, message);
          break;

        case "start-game":
          await this.handleStartGame(ws, message);
          break;

        case "get-room-list":
          await this.handleGetRoomList(ws, message);
          break;

        case "get-room-info":
          await this.handleGetRoomInfo(ws, message);
          break;

        case "regenerate-map":
          await this.handleRegenerateMap(ws, message);
          break;

        default:
          ws.send(JSON.stringify({
            head: "error",
            body: { message: "Unknown message type" }
          }));
      }
    } catch (error) {
      console.error("Error handling lobby message:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      try {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Server error" }
        }));
      } catch (sendError) {
        console.error("Failed to send error response:", sendError);
      }
    }
  }

  private static async handleAuth(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const authResponse = await handleAuthMessage(message);
    
    if (authResponse.head === "auth-ok") {
      // Store user info in WebSocket for future requests
      const userInfo = {
        id: authResponse.body.userID,
        username: authResponse.body.username,
        userType: authResponse.body.userType as 'registered' | 'guest'
      };
      ws.user = userInfo;
      
      // Track this connection
      userConnections.set(userInfo.id, ws);
      console.log(`User ${userInfo.username} authenticated in lobby`);
    }
    
    ws.send(JSON.stringify(authResponse));
  }

  private static async handleCreateRoom(ws: AuthenticatedWebSocket, message: ClientMessage) {
    console.log("=== ENTER handleCreateRoom ===");
    
    if (message.head !== "create-room") {
      console.log("Wrong message head:", message.head);
      return;
    }

    // Validate session from message instead of relying on ws.user
    console.log("Validating session:", message.body.sessionId);
    const user = await validateSessionFromMessage(message.body.sessionId);
    console.log("Session validation result:", user ? `${user.username} (${user.id})` : "INVALID SESSION");
    
    if (!user) {
      console.log("Sending not authenticated error");
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Not authenticated" }
      }));
      return;
    }

    console.log("About to start try block");
    try {
      console.log("Creating room with data:", {
        name: message.body.name,
        settings: message.body.settings,
        user: user.username
      });

      // Clean up settings to remove undefined values
      const cleanSettings = {
        maxPlayers: message.body.settings.maxPlayers,
        spectatorMode: message.body.settings.spectatorMode,
        ...(message.body.settings.turnTimeLimit && { turnTimeLimit: message.body.settings.turnTimeLimit })
      };

      console.log("Cleaned settings:", cleanSettings);
      console.log("About to call lobbyManager.createRoom");

      const room = lobbyManager.createRoom(
        user.id,
        user.username,
        user.userType,
        message.body.name,
        cleanSettings
      );

      console.log("LobbyManager.createRoom returned:", room ? "SUCCESS" : "NULL");

      console.log(`Room "${room.name}" created successfully with ID: ${room.id}`);

      // Serialize the room properly to avoid Date serialization issues
      const serializedRoom = {
        ...room,
        createdAt: room.createdAt.toISOString(),
        startedAt: room.startedAt?.toISOString()
      };

      console.log("About to send room-created response");
      ws.send(JSON.stringify({
        head: "room-created",
        body: { room: serializedRoom }
      }));

      console.log(`Room creation response sent to ${user.username}`);
    } catch (error) {
      console.error("Error creating room:", error);
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      }
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Failed to create room" }
      }));
    }
  }

  private static async handleJoinRoom(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) {
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Not authenticated" }
      }));
      return;
    }

    if (message.head !== "join-room") return;

    try {
      const room = lobbyManager.joinRoom(
        message.body.roomId,
        user.id,
        user.username,
        user.userType
      );

      if (room) {
        ws.send(JSON.stringify({
          head: "room-joined",
          body: { room }
        }));
        
        // Broadcast to all players in room
        this.broadcastToRoom(room.id, {
          head: "player-joined",
          body: { 
            roomId: room.id, 
            player: room.players.find(p => p.userId === user.id)! 
          }
        });

        console.log(`${user.username} joined room ${room.name}`);
      } else {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Failed to join room" }
        }));
      }
    } catch (error) {
      console.error("Error joining room:", error);
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Failed to join room" }
      }));
    }
  }

  private static async handleLeaveRoom(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) return;

    if (message.head !== "leave-room") return;

    try {
      const success = lobbyManager.leaveRoom(message.body.roomId, user.id);
      
      if (success) {
        ws.send(JSON.stringify({
          head: "room-left",
          body: { roomId: message.body.roomId }
        }));
        
        // Broadcast to remaining players
        this.broadcastToRoom(message.body.roomId, {
          head: "player-left",
          body: { roomId: message.body.roomId, userId: user.id }
        });

        console.log(`${user.username} left room ${message.body.roomId}`);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }

  private static async handleUpdateCharacter(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) return;

    if (message.head !== "update-character") return;

    try {
      const playerRoomId = lobbyManager.getPlayerRoom(user.id);
      if (!playerRoomId) {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Not in a room" }
        }));
        return;
      }

      const success = lobbyManager.updateCharacter(playerRoomId, user.id, message.body.character);
      
      if (success) {
        this.broadcastToRoom(playerRoomId, {
          head: "character-updated",
          body: { 
            roomId: playerRoomId, 
            userId: user.id, 
            character: message.body.character 
          }
        });
      }
    } catch (error) {
      console.error("Error updating character:", error);
    }
  }

  private static async handleToggleReady(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) return;

    if (message.head !== "toggle-ready") return;

    try {
      const success = lobbyManager.toggleReady(message.body.roomId, user.id);
      
      if (success) {
        const room = lobbyManager.getRoom(message.body.roomId);
        if (room) {
          this.broadcastToRoom(message.body.roomId, {
            head: "room-updated",
            body: { room }
          });
        }
      }
    } catch (error) {
      console.error("Error toggling ready:", error);
    }
  }

  private static async handleStartGame(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) return;

    if (message.head !== "start-game") return;

    try {
      const result = lobbyManager.startGame(message.body.roomId, user.id);
      
      if (result) {
        // Broadcast game starting
        this.broadcastToRoom(message.body.roomId, {
          head: "game-starting",
          body: { roomId: message.body.roomId, turnOrder: result.turnOrder }
        });
        
        // TODO: Initialize actual game instance
        // For now, just broadcast game started
        setTimeout(() => {
          this.broadcastToRoom(message.body.roomId, {
            head: "game-started",
            body: { roomId: message.body.roomId, gameId: `game-${message.body.roomId}` }
          });
        }, 2000);

        console.log(`Game started in room ${message.body.roomId}`);
      } else {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Cannot start game" }
        }));
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  }

  private static async handleGetRoomList(ws: AuthenticatedWebSocket, message: ClientMessage) {
    if (message.head !== "get-room-list") return;

    // Validate session from message
    const user = await validateSessionFromMessage(message.body.sessionId);
    if (!user) {
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Not authenticated" }
      }));
      return;
    }

    try {
      const rooms = lobbyManager.getRoomList();
      ws.send(JSON.stringify({
        head: "room-list",
        body: { rooms }
      }));
    } catch (error) {
      console.error("Error getting room list:", error);
    }
  }

  private static async handleGetRoomInfo(ws: AuthenticatedWebSocket, message: ClientMessage) {
    const user = ws.user;
    if (!user) return;

    if (message.head !== "get-room-info") return;

    try {
      const room = lobbyManager.getRoom(message.body.roomId);
      if (room) {
        ws.send(JSON.stringify({
          head: "room-info",
          body: { room }
        }));
      } else {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Room not found" }
        }));
      }
    } catch (error) {
      console.error("Error getting room info:", error);
    }
  }

  private static async handleRegenerateMap(ws: AuthenticatedWebSocket, message: ClientMessage) {
    if (message.head !== "regenerate-map") return;

    // Validate session from message
    const user = await validateSessionFromMessage(message.body.sessionId);
    if (!user) {
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Not authenticated" }
      }));
      return;
    }

    try {
      const room = lobbyManager.regenerateMap(
        message.body.roomId,
        user.id,
        message.body.mapSize as 'small' | 'medium' | 'large'
      );

      if (room) {
        // Broadcast new map settings to all players in room
        this.broadcastToRoom(message.body.roomId, {
          head: "map-regenerated",
          body: { 
            roomId: message.body.roomId, 
            mapSeed: room.mapSeed!,
            mapSize: room.mapSize!
          }
        });

        console.log(`Map regenerated in room ${message.body.roomId} by ${user.username}`);
      } else {
        ws.send(JSON.stringify({
          head: "error",
          body: { message: "Cannot regenerate map" }
        }));
      }
    } catch (error) {
      console.error("Error regenerating map:", error);
      ws.send(JSON.stringify({
        head: "error",
        body: { message: "Failed to regenerate map" }
      }));
    }
  }

  // Helper function to broadcast to all players in a room
  private static broadcastToRoom(roomId: string, message: ServerMessage) {
    const room = lobbyManager.getRoom(roomId);
    if (!room) return;

    // Send message to all connected players in the room
    room.players.forEach(player => {
      if (player.userId) {
        const connection = userConnections.get(player.userId);
        if (connection && connection.readyState === 1) { // WebSocket.OPEN = 1
          try {
            connection.send(JSON.stringify(message));
          } catch (error) {
            console.error(`Failed to send message to user ${player.userId}:`, error);
            // Remove dead connection
            userConnections.delete(player.userId);
          }
        }
      }
    });
  }
} 