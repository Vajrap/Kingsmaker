import { v4 as uuidv4 } from "uuid";
import { errorRes, ok, prisma, Player } from "@kingsmaker/shared";
import type { 
    GameRoom ,
    CreateRoomOutput,
    ApiResponse
} from "@kingsmaker/shared";
import { PRESENCE_CONFIG } from "./presence";
import { WaitingRoom } from "./WaitingRoom";
import { clientManager } from "../ClientManager/ClientManager";

class RoomManager {
    rooms: Map<string, WaitingRoom>;
    constructor() {
        this.rooms = new Map();
        this.checkAllPresences();
    }

    checkAllPresences() {
        setInterval(async () => {
            console.log(`Checking presence for ${this.rooms.size} rooms...`);
            for (const [roomId, room] of this.rooms.entries()) {
                await room.checkPresence(clientManager);
                if (room.isEmpty()) {
                    console.log(`Room ${roomId} is empty, removing it`);
                    this.rooms.delete(roomId);
                }
            }
        }, PRESENCE_CONFIG.CHECK_INTERVAL_MS);
    }

    async createNewRoom(
        data: GameRoom,
        hostSessionId?: string,
    ): Promise<ApiResponse<CreateRoomOutput>> {
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
        const newRoom = new WaitingRoom(data);
        this.rooms.set(newRoomId, newRoom);

        // If hostSessionId is provided, add the host as the first player
        if (hostSessionId) {
            const hostAdded = await this.addPlayerToRoom(
                newRoomId,
                hostSessionId,
            );
            if (!hostAdded) {
                console.warn(
                    `Failed to add host to room ${newRoomId}, but room was created`,
                );
            }
        }

        return ok<CreateRoomOutput>({ roomId: newRoomId });
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
            // First check if player is already in ClientManager
            let player = clientManager.getPlayerBySessionId(playerSessionId);
            
            if (!player) {
                // Player not in ClientManager, get from database
                const user = await prisma.user.findFirst({
                    where: { sessionId: playerSessionId }
                });

                if (!user) {
                    console.error(
                        `User with sessionId ${playerSessionId} not found`,
                    );
                    return false;
                }

                const newPlayer = new Player(user);

                clientManager.addPlayer(newPlayer);

                player = newPlayer;
            }

            // Check if player is already in the room
            const existingPlayer = room.players.find(
                (p) => p.userId === player!.userId,
            );

            if (existingPlayer) {
                console.log(
                    `Player ${existingPlayer.username} is already in room ${roomId}`,
                );
                return true;
            }

            // Update player location to waiting room
            player.location.location = "waiting-room";
            player.location.roomId = roomId;
            
            clientManager.updatePlayer(player);

            // Add player to room
            room.addPlayer({ ...player }); // Copy to avoid reference issues

            console.log(
                `Player ${player.username} successfully added to room ${roomId}`,
            );
            return true;
        } catch (error) {
            console.error(`Error adding player to room ${roomId}:`, error);
            return false;
        }
    }

    removeRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    getRoom(roomId: string): WaitingRoom | undefined {
        return this.rooms.get(roomId);
    }
}

export const roomManager = new RoomManager();
