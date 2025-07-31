import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";
import { broadcastToRoom } from "./connect";

export function handleLeaveRoom(ws: ElysiaWS, data: any) {
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

        // Find player in room
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

        // Remove player from room
        room.removePlayer(playerInRoom);

        // Update player location back to lobby
        player.location.location = "lobby";
        player.location.roomId = null;
        clientManager.updatePlayer(player);

        // Remove WebSocket connection for this room
        clientManager.removeSocket(sessionId);

        // Send confirmation to leaving player
        ws.send(
            JSON.stringify({
                type: "leftRoom",
                message: "Successfully left the room",
            }),
        );

        // Broadcast to remaining players in room
        if (room.players.length > 0) {
            broadcastToRoom(roomId, {
                type: "playerLeft",
                playerId: player.userId,
                username: player.username,
                remainingPlayers: room.players.length,
            });

            // If room becomes empty, it will be cleaned up by the presence checker
        }

        // Broadcast updated room list to lobby players
        const rooms = roomManager.getAllRooms();
        clientManager.broadcastToAllLobbyPlayers({
            type: "roomsUpdated",
            rooms: rooms,
        });

        console.log(`Player ${player.username} left waiting room ${roomId}`);

    } catch (error) {
        console.error("Error leaving room:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to leave room",
            }),
        );
    }
} 