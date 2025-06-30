import { v4 as uuidv4 } from "uuid";
import { errorRes, ok } from "../shared/types/types";
import type { ApiResponse, RoomCreatedEvent, GameRoom, Player } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { RoomInstance } from "./RoomInstance";

class RoomManager {
    rooms: Map<string, RoomInstance>;
    constructor() {
        this.rooms = new Map();
    }

    async createNewRoom(data: GameRoom, hostSessionId?: string): Promise<ApiResponse<RoomCreatedEvent>> {
        let newRoomId = uuidv4();
        // Make 5 attempts at most
        let attempts = 0;
        while (this.rooms.has(newRoomId) && attempts < 5) {
            newRoomId = uuidv4();
            attempts++;
        }
        if (attempts === 5 && this.rooms.has(newRoomId)) {
            return errorRes("Failed to get Unique RoomId");
        }

        data.id = newRoomId;
        const newRoom = new RoomInstance(data);
        this.rooms.set(newRoomId, newRoom);

        // If hostSessionId is provided, add the host as the first player
        if (hostSessionId) {
            const hostAdded = await this.addPlayerToRoom(newRoomId, hostSessionId);
            if (!hostAdded) {
                console.warn(`Failed to add host to room ${newRoomId}, but room was created`);
            }
        }

        return ok<RoomCreatedEvent>({ roomId: newRoomId });
    }

    getAllRooms(): GameRoom[] {
        return Array.from(this.rooms.values()).map((room) => ({
            id: room.id,
            name: room.name,
            state: room.state,
            players: room.players,
            maxPlayers: room.maxPlayers,
            turnTimeLimit: room.turnTimeLimit,
            allowSpectators: room.allowSpectators,
            allowAnonymousSpectators: room.allowAnonymousSpectators,
            spectators: room.spectators,
            mapSeed: room.mapSeed,
        }));
    }

    async addPlayerToRoom(
        roomId: string,
        playerSessionId: string,
    ): Promise<boolean> {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error(`Room ${roomId} not found`);
            return false;
        }

        if (room.isFull()) {
            console.error(`Room ${roomId} is full`);
            return false;
        }

        try {
            // Get user data from database using sessionId
            const user = await prisma.user.findFirst({
                where: { sessionId: playerSessionId },
                select: {
                    id: true,
                    username: true,
                    type: true,
                    nameAlias: true,
                }
            });

            if (!user) {
                console.error(`User with sessionId ${playerSessionId} not found`);
                return false;
            }

            // Check if player is already in the room
            const existingPlayer = room.players.find(p => p.userId === user.id.toString());
            if (existingPlayer) {
                console.log(`Player ${user.username} is already in room ${roomId}`);
                return true;
            }

            // Create Player object
            const player: Player = {
                userId: user.id.toString(),
                username: user.username,
                userType: user.type as "registered" | "guest",
                isReady: false,
                profile: {
                    portraitId: undefined,
                    skinId: undefined,
                },
                lastSeen: new Date().toISOString(),
                character: undefined,
            };

            // Add player to room
            room.addPlayer(player);

            // Update user's presence status to IN_WAITING_ROOM
            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    // You might want to add a presenceStatus field to track where the user is
                    // presenceStatus: "IN_WAITING_ROOM" 
                }
            });

            console.log(`Player ${user.username} successfully added to room ${roomId}`);
            return true;

        } catch (error) {
            console.error(`Error adding player to room ${roomId}:`, error);
            return false;
        }
    }

    removeRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    getRoom(roomId: string): RoomInstance | undefined {
        return this.rooms.get(roomId);
    }
}

export const roomManager = new RoomManager();
