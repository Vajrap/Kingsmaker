import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";

export function handleWaitingRoomConnect(ws: ElysiaWS, data: any) {
    const { sessionId, roomId } = data;

    if (!sessionId || !roomId) {
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Session ID and room ID required",
            }),
        );
        return;
    }

    try {
        // Verify player exists and is in the specified room
        const player = clientManager.getPlayerBySessionId(sessionId);
        if (!player) {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Invalid session",
                }),
            );
            return;
        }

        const room = roomManager.getRoom(roomId);
        if (!room) {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Room not found",
                }),
            );
            return;
        }

        // Verify player is actually in this room
        const playerInRoom = room.players.find(p => p.userId === player.userId);
        if (!playerInRoom) {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Player not in this room",
                }),
            );
            return;
        }

        // Add WebSocket connection for this room
        clientManager.addSocket(sessionId, ws);

        // Send room state to connected player
        ws.send(
            JSON.stringify({
                type: "roomState",
                room: {
                    id: room.id,
                    name: room.name,
                    state: room.state,
                    players: room.getPlayersWithStatus(),
                    maxPlayers: room.maxPlayers,
                    turnTimeLimit: room.turnTimeLimit,
                    allowSpectators: room.allowSpectators,
                    allowAnonymousSpectators: room.allowAnonymousSpectators,
                    spectators: room.spectators,
                },
            }),
        );

        // Broadcast to other players in the room that this player connected
        broadcastToRoom(roomId, {
            type: "playerConnected",
            player: {
                userId: player.userId,
                username: player.username,
                displayStatus: "Online",
            },
        }, sessionId); // Exclude the connecting player

        console.log(`Player ${player.username} connected to waiting room ${roomId}`);

    } catch (error) {
        console.error("Error connecting to waiting room:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to connect to waiting room",
            }),
        );
    }
}

// Helper function to broadcast to all players in a specific room
export function broadcastToRoom(roomId: string, message: any, excludeSessionId?: string) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    
    for (const player of room.players) {
        if (excludeSessionId && player.sessionId === excludeSessionId) {
            continue; // Skip excluded player
        }
        
        if (player.sessionId && clientManager.hasActiveSocket(player.sessionId)) {
            const ws = clientManager.sockets.get(player.sessionId);
            if (ws && ws.readyState === 1) {
                try {
                    ws.send(messageStr);
                } catch (error) {
                    console.error(`Error sending to player ${player.username}:`, error);
                }
            }
        }
    }
} 