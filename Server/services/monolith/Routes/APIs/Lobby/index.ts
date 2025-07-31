import type { ElysiaWS } from "elysia/ws";
import { handleLobbyConnect } from "./lobbyConnect";
import { handleCreateRoom } from "./createRoom";
import { handleJoinRoom } from "./joinRoom";
import type { LobbyClientMessage } from "@kingsmaker/shared";

export function handleLobbyWs(ws: ElysiaWS, message: LobbyClientMessage) {
    try {
        switch (message.type) {
            case "JOIN":
                handleLobbyConnect(ws, message);
                break;
            case "CREATE_ROOM":
                handleCreateRoom(ws, message);
                break;
            case "JOIN_ROOM":
                handleJoinRoom(ws, message);
                break;
            case "GET_ROOM_LIST":
                handleGetRooms(ws, message);
                break;
            default:
                ws.send(
                    JSON.stringify({
                        type: "error",
                        message: "Unknown message type",
                    }),
                );
        }
    } catch (error) {
        console.error("Error parsing lobby message:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Invalid message format",
            }),
        );
    }
}
function handleGetRooms(ws: ElysiaWS<unknown, {}>, data: any) {
    throw new Error("Function not implemented.");
}
