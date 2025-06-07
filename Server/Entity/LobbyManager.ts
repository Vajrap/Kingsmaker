import type { GameRoom, PlayerSlot, RoomSettings, PlayerCharacterSetup } from '@shared/types';

// Simple seed generator for server-side (same logic as client-side)
function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class LobbyManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map(); // userId → roomId

  createRoom(hostId: string, hostUsername: string, hostUserType: 'registered' | 'guest', name: string, settings: RoomSettings): GameRoom {
    const roomId = this.generateRoomId();
    
    const hostSlot: PlayerSlot = {
      userId: hostId,
      username: hostUsername,
      userType: hostUserType,
      isReady: false,
      character: {
        name: hostUsername,
        stats: { might: 0, intelligence: 0, dexterity: 0 }
      }
    };

    const room: GameRoom = {
      id: roomId,
      name,
      hostId,
      state: "WAITING",
      settings,
      players: [hostSlot],
      mapSeed: generateRandomSeed(), // Generate consistent seed for all clients
      mapSize: 'medium', // Default map size
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostId, roomId);
    
    return room;
  }

  joinRoom(roomId: string, userId: string, username: string, userType: 'registered' | 'guest'): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if room is full or not in waiting state
    if (room.state !== "WAITING" || room.players.length >= room.settings.maxPlayers) {
      return null;
    }

    // Check if player is already in another room
    if (this.playerRooms.has(userId)) {
      return null;
    }

    const playerSlot: PlayerSlot = {
      userId,
      username,
      userType,
      isReady: false,
      character: {
        name: username,
        stats: { might: 0, intelligence: 0, dexterity: 0 }
      }
    };

    room.players.push(playerSlot);
    this.playerRooms.set(userId, roomId);

    return room;
  }

  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const playerIndex = room.players.findIndex(p => p.userId === userId);
    if (playerIndex === -1) return false;

    // Remove player
    room.players.splice(playerIndex, 1);
    this.playerRooms.delete(userId);

    // If host left and there are other players, transfer host
    if (room.hostId === userId && room.players.length > 0) {
        if (room.players[0]?.userId) {
            room.hostId = room.players[0]?.userId;
        } else {
            this.rooms.delete(roomId);
        }
    }

    // If no players left, delete room
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  updateCharacter(roomId: string, userId: string, character: PlayerCharacterSetup): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== "WAITING") return false;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return false;

    player.character = { ...player.character, ...character };
    return true;
  }

  toggleReady(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== "WAITING") return false;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return false;

    player.isReady = !player.isReady;
    return true;
  }

  startGame(roomId: string, hostId: string): { room: GameRoom; turnOrder: string[] } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.state !== "WAITING") return null;

    // Check minimum players (2) and all ready
    if (room.players.length < 2) return null;
    if (!room.players.every(p => p.isReady)) return null;

    // Roll D20 for turn order (highest goes first)
    const turnOrder = this.rollInitiative(room.players);
    
    // Assign starting positions (castle positions 1-4)
    this.assignStartingPositions(room.players);

    room.state = "STARTING";
    room.turnOrder = turnOrder;
    room.startedAt = new Date();

    return { room, turnOrder };
  }

  private rollInitiative(players: PlayerSlot[]): string[] {
    const rolls = players.map(player => ({
      userId: player.userId!,
      roll: Math.floor(Math.random() * 20) + 1 // D20 roll (1-20)
    }));

    // Sort by roll (highest first), then by random for ties
    rolls.sort((a, b) => {
      if (b.roll !== a.roll) return b.roll - a.roll;
      return Math.random() - 0.5; // Random tie-breaker
    });

    return rolls.map(r => r.userId);
  }

  private assignStartingPositions(players: PlayerSlot[]): void {
    // Assign positions 1-4 based on player order
    players.forEach((player, index) => {
      player.position = index + 1;
    });
  }

  getRoom(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }

  getRoomList(): GameRoom[] {
    return Array.from(this.rooms.values()).filter(room => room.state === "WAITING");
  }

  getPlayerRoom(userId: string): string | null {
    return this.playerRooms.get(userId) || null;
  }

  regenerateMap(roomId: string, hostId: string, mapSize: 'small' | 'medium' | 'large'): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.state !== "WAITING") return null;

    // Generate new seed and update map settings
    room.mapSeed = generateRandomSeed();
    room.mapSize = mapSize;

    return room;
  }

  private generateRoomId(): string {
    // Generate a shorter, more user-friendly room ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }
    
    return result;
  }

  // Cleanup method for removing old rooms
  cleanupOldRooms(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [roomId, room] of this.rooms.entries()) {
      const age = now.getTime() - room.createdAt.getTime();
      if (age > maxAge && room.state === "WAITING") {
        // Remove all players from tracking
        room.players.forEach(player => {
          if (player.userId) {
            this.playerRooms.delete(player.userId);
          }
        });
        this.rooms.delete(roomId);
      }
    }
  }
} 