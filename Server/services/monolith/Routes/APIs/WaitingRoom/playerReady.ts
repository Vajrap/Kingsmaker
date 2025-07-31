import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";
import { broadcastToRoom } from "./connect";

export function handlePlayerReady(ws: ElysiaWS, data: any) {
    const { sessionId, roomId, isReady } = data;

    if (!sessionId || !roomId || typeof isReady !== "boolean") {
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Session ID, room ID, and ready status required",
            }),
        );
        return;
    }

    try {
        // Verify player exists
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

        // Find and update player in room
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

        // Update ready status
        playerInRoom.isReady = isReady;

        // Send confirmation to player
        ws.send(
            JSON.stringify({
                type: "readyStatusUpdated",
                isReady: isReady,
            }),
        );

        // Check if all players are ready
        const allPlayersReady = room.players.length >= 2 && 
                               room.players.every(p => p.isReady);

        // Broadcast updated player status to all players in room
        broadcastToRoom(roomId, {
            type: "playerReadyUpdate",
            playerId: player.userId,
            username: player.username,
            isReady: isReady,
            allPlayersReady: allPlayersReady,
            readyCount: room.players.filter(p => p.isReady).length,
            totalPlayers: room.players.length,
        });

        // If all players are ready and we have enough players, start the game
        if (allPlayersReady && room.players.length >= 2) {
            room.state = "STARTING";
            
            broadcastToRoom(roomId, {
                type: "gameStarting",
                message: "All players ready! Starting game in 3 seconds...",
            });

            // TODO: Implement actual game start logic
            setTimeout(() => {
                room.state = "IN_PROGRESS";
                broadcastToRoom(roomId, {
                    type: "gameStarted",
                    message: "Game started!",
                });
            }, 3000);
        }

        console.log(`Player ${player.username} set ready status to ${isReady} in room ${roomId}`);

    } catch (error) {
        console.error("Error updating player ready status:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to update ready status",
            }),
        );
    }
} 