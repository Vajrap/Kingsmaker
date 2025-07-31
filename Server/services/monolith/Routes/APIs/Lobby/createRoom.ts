import type { ElysiaWS } from "elysia/ws";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";
import { clientManager } from "../../../Class/ClientManager/ClientManager";

export async function handleCreateRoom(ws: ElysiaWS, data: any) {
    const { sessionId, roomData } = data;

    if (!sessionId || !roomData) {
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Session ID and room data required",
            }),
        );
        return;
    }

    try {
        const result = await roomManager.createNewRoom(roomData, sessionId);

        if ("data" in result) {
            clientManager.broadcastToAllLobbyPlayers({
                type: "roomCreated",
                room: result.data,
            });

            // Send success response to room creator
            ws.send(
                JSON.stringify({
                    type: "roomCreated",
                    data: result.data,
                }),
            );
        } else {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: result.message,
                }),
            );
        }
    } catch (error) {
        console.error("Error creating room:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to create room",
            }),
        );
    }
}
