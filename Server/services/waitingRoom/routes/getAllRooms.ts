import { roomManager } from "../Classes/RoomManager";

export async function handleGetAllRooms() {
    try {
        const allRooms = roomManager.getAllRooms();
        
        const rooms = allRooms.map(room => ({
            id: room.id,
            name: room.name,
            state: room.state,
            maxPlayers: room.maxPlayers,
            currentPlayers: room.players.length,
            hostId: room.players[0]?.userId || null,
            hostUsername: room.players[0]?.username || 'Unknown',
            createdAt: room.createdAt,
            lastActivity: room.lastActivity,
            turnTimeLimit: room.turnTimeLimit,
            allowSpectators: room.allowSpectators,
            allowAnonymousSpectators: room.allowAnonymousSpectators,
            spectators: room.spectators.length,
            players: room.players.map(player => ({
                userId: player.userId,
                username: player.username,
                connectionStatus: player.connectionStatus,
                lastSeen: player.lastSeen,
                isHost: room.players[0]?.userId === player.userId
            }))
        }));

        return {
            status: "success",
            data: {
                rooms,
                total: rooms.length,
                active: rooms.filter(r => r.state === 'active').length,
                waiting: rooms.filter(r => r.state === 'waiting').length,
                full: rooms.filter(r => r.currentPlayers >= r.maxPlayers).length
            }
        };
    } catch (error) {
        console.error("Error getting all rooms:", error);
        return {
            status: "error",
            data: null,
            message: "Failed to get rooms"
        };
    }
} 