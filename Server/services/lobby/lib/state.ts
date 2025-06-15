import { redis, publisher } from './redis';

// Define types based on the architecture document
export interface SessionData {
    userId: string;
    userType: 'registered' | 'guest';
    username: string;
    connectedAt: string;
}

export interface WaitingRoomMetadata {
    id: string;
    name: string;
    hostId: string;
    hostUsername: string;
    state: 'WAITING' | 'STARTING' | 'IN_PROGRESS';
    maxPlayers: 2 | 3 | 4;
    currentPlayers: number;
    createdAt: string;
    playerList: string[];
}

export interface PlayerSlot {
    userId: string;
    username: string;
    userType: 'registered' | 'guest';
    isReady: boolean;
    profile: {
        portraitId?: string;
        skinId?: string;
    };
    lastSeen: string;
}

export interface PlayerLocation {
    location: 'lobby' | 'waiting-room' | 'game';
    roomId?: string;
    gameId?: string;
    lastSeen: string;
}

export class LobbyStateManager {
    // Session Management
    async storeSession(sessionId: string, userData: SessionData): Promise<void> {
        await redis.setex(
            `loggedInUsers:${sessionId}`,
            24 * 60 * 60, // 24 hours TTL
            JSON.stringify(userData)
        );
    }

    async getSession(sessionId: string): Promise<SessionData | null> {
        const data = await redis.get(`loggedInUsers:${sessionId}`);
        return data ? JSON.parse(data) : null;
    }

    async removeSession(sessionId: string): Promise<void> {
        await redis.del(`loggedInUsers:${sessionId}`);
    }

    async getAllSessions(): Promise<SessionData[]> {
        const keys = await redis.keys('loggedInUsers:*');
        if (keys.length === 0) return [];
        
        const sessions = await redis.mget(keys);
        return sessions
            .filter(session => session !== null)
            .map(session => JSON.parse(session!));
    }

    // Room State Management
    async storeRoom(roomId: string, roomData: WaitingRoomMetadata): Promise<void> {
        await redis.setex(
            `waitingRooms:${roomId}`,
            2 * 60 * 60, // 2 hours TTL
            JSON.stringify(roomData)
        );
    }

    async getRoom(roomId: string): Promise<WaitingRoomMetadata | null> {
        const data = await redis.get(`waitingRooms:${roomId}`);
        return data ? JSON.parse(data) : null;
    }

    async removeRoom(roomId: string): Promise<void> {
        await redis.del(`waitingRooms:${roomId}`);
        await redis.del(`waitingRoomPlayers:${roomId}`);
    }

    async getAllRooms(): Promise<WaitingRoomMetadata[]> {
        const keys = await redis.keys('waitingRooms:*');
        if (keys.length === 0) return [];
        
        const rooms = await redis.mget(keys);
        return rooms
            .filter(room => room !== null)
            .map(room => JSON.parse(room!))
            .filter(room => room.state === 'WAITING'); // Only return waiting rooms
    }

    // Room Player Management
    async storeRoomPlayers(roomId: string, players: PlayerSlot[]): Promise<void> {
        await redis.setex(
            `waitingRoomPlayers:${roomId}`,
            2 * 60 * 60, // 2 hours TTL
            JSON.stringify(players)
        );
    }

    async getRoomPlayers(roomId: string): Promise<PlayerSlot[]> {
        const data = await redis.get(`waitingRoomPlayers:${roomId}`);
        return data ? JSON.parse(data) : [];
    }

    async addPlayerToRoom(roomId: string, player: PlayerSlot): Promise<void> {
        const currentPlayers = await this.getRoomPlayers(roomId);
        const existingPlayerIndex = currentPlayers.findIndex(p => p.userId === player.userId);
        
        if (existingPlayerIndex >= 0) {
            currentPlayers[existingPlayerIndex] = player;
        } else {
            currentPlayers.push(player);
        }
        
        await this.storeRoomPlayers(roomId, currentPlayers);
    }

    async removePlayerFromRoom(roomId: string, userId: string): Promise<void> {
        const currentPlayers = await this.getRoomPlayers(roomId);
        const filteredPlayers = currentPlayers.filter(p => p.userId !== userId);
        await this.storeRoomPlayers(roomId, filteredPlayers);
    }

    // Player Location Tracking
    async setPlayerLocation(userId: string, location: PlayerLocation): Promise<void> {
        await redis.setex(
            `playerLocation:${userId}`,
            30 * 60, // 30 minutes TTL
            JSON.stringify(location)
        );
    }

    async getPlayerLocation(userId: string): Promise<PlayerLocation | null> {
        const data = await redis.get(`playerLocation:${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async removePlayerLocation(userId: string): Promise<void> {
        await redis.del(`playerLocation:${userId}`);
    }

    // Online Player Count
    async getOnlinePlayerCount(): Promise<number> {
        const keys = await redis.keys('loggedInUsers:*');
        return keys.length;
    }

    // Pub/Sub Event Publishing
    async publishRoomCreated(roomId: string, roomData: WaitingRoomMetadata): Promise<void> {
        await publisher.publish('room_created', JSON.stringify({
            roomId,
            roomData
        }));
    }

    async publishRoomClosed(roomId: string, reason: string): Promise<void> {
        await publisher.publish('room_closed', JSON.stringify({
            roomId,
            reason
        }));
    }

    async publishRoomUpdated(roomId: string, roomData: WaitingRoomMetadata): Promise<void> {
        await publisher.publish('room_updated', JSON.stringify({
            roomId,
            roomData
        }));
    }

    async publishPlayerJoined(roomId: string, userId: string, playerData: PlayerSlot): Promise<void> {
        await publisher.publish('player_joined', JSON.stringify({
            roomId,
            userId,
            playerData
        }));
    }

    async publishPlayerLeft(roomId: string, userId: string): Promise<void> {
        await publisher.publish('player_left', JSON.stringify({
            roomId,
            userId
        }));
    }

    async publishPlayerReady(roomId: string, userId: string, isReady: boolean): Promise<void> {
        await publisher.publish('player_ready', JSON.stringify({
            roomId,
            userId,
            isReady
        }));
    }

    async publishGameStarting(roomId: string, gameId: string): Promise<void> {
        await publisher.publish('game_starting', JSON.stringify({
            roomId,
            gameId
        }));
    }

    async publishGameEnded(roomId: string, gameId: string): Promise<void> {
        await publisher.publish('game_ended', JSON.stringify({
            roomId,
            gameId
        }));
    }

    // Utility Methods
    async cleanupExpiredData(): Promise<void> {
        // This method can be called periodically to clean up expired data
        // Redis handles TTL automatically, but this can be used for additional cleanup
        console.log('🧹 Running cleanup for expired lobby data...');
        
        // Clean up rooms with no players
        const rooms = await this.getAllRooms();
        for (const room of rooms) {
            const players = await this.getRoomPlayers(room.id);
            if (players.length === 0) {
                console.log(`🗑️ Removing empty room: ${room.id}`);
                await this.removeRoom(room.id);
            }
        }
    }

    // Health Check
    async healthCheck(): Promise<boolean> {
        try {
            const result = await redis.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('❌ Redis health check failed:', error);
            return false;
        }
    }
} 