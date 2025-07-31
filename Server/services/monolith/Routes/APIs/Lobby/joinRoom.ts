import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";

export async function handleJoinRoom(ws: ElysiaWS, data: any) {
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
        const success = await roomManager.addPlayerToRoom(roomId, sessionId);

        if (success) {
            ws.send(
                JSON.stringify({
                    type: "joinedRoom",
                    roomId: roomId,
                }),
            );

            // Broadcast updated room list to all lobby players
            const rooms = roomManager.getAllRooms();
            clientManager.broadcastToAllLobbyPlayers({
                type: "roomsUpdated",
                rooms: rooms,
            });
        } else {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Failed to join room",
                }),
            );
        }
    } catch (error) {
        console.error("Error joining room:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to join room",
            }),
        );
    }
}
