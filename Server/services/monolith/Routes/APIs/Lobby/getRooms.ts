import type { ElysiaWS } from "elysia/ws";
import { roomManager } from "../../../Class/WaitingRoom/WaitingRoomManager";

export function handleGetRooms(ws: ElysiaWS, data: any) {
    try {
        const rooms = roomManager.getAllRooms();
        ws.send(
            JSON.stringify({
                type: "roomList",
                rooms: rooms,
            }),
        );
    } catch (error) {
        console.error("Error getting rooms:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Failed to get room list",
            }),
        );
    }
}
