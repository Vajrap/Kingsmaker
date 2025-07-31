import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";
import { broadcastToRoom } from "./connect";

export function handleRoomSettings(ws: ElysiaWS, data: any) {
    const { sessionId, roomId, settings } = data;

    if (!sessionId || !roomId || !settings) {
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Session ID, room ID, and settings required",
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

        // For now, only allow the first player (room creator) to modify settings
        // TODO: Add proper room ownership/admin system
        const isRoomCreator = room.players[0]?.userId === player.userId;
        if (!isRoomCreator) {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Only room creator can modify settings",
                }),
            );
            return;
        }

        // Update allowed settings
        if (settings.name && typeof settings.name === "string") {
            room.name = settings.name;
        }
        if (settings.turnTimeLimit && typeof settings.turnTimeLimit === "number") {
            room.turnTimeLimit = settings.turnTimeLimit;
        }
        if (typeof settings.allowSpectators === "boolean") {
            room.allowSpectators = settings.allowSpectators;
        }
        if (typeof settings.allowAnonymousSpectators === "boolean") {
            room.allowAnonymousSpectators = settings.allowAnonymousSpectators;
        }

        // Send confirmation to player
        ws.send(
            JSON.stringify({
                type: "roomSettingsUpdated",
                settings: {
                    name: room.name,
                    turnTimeLimit: room.turnTimeLimit,
                    allowSpectators: room.allowSpectators,
                    allowAnonymousSpectators: room.allowAnonymousSpectators,
                },
            }),
        );

        // Broadcast updated settings to all players in room
        broadcastToRoom(roomId, {
            type: "roomSettingsChanged",
            updatedBy: player.username,
            settings: {
                name: room.name,
                turnTimeLimit: room.turnTimeLimit,
                allowSpectators: room.allowSpectators,
                allowAnonymousSpectators: room.allowAnonymousSpectators,
            },
        }, sessionId); // Exclude the player who made the changes

        // Broadcast updated room list to lobby players
        const rooms = roomManager.getAllRooms();
        clientManager.broadcastToAllLobbyPlayers({
            type: "roomsUpdated",
            rooms: rooms,
        });

        console.log(`Player ${player.username} updated settings for room ${roomId}`);

    } catch (error) {
        console.error("Error updating room settings:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to update room settings",
            }),
        );
    }
} 