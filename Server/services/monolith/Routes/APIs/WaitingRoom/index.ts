import type { ElysiaWS } from "elysia/ws";
import { handleWaitingRoomConnect } from "./connect.ts";
import { handlePlayerReady } from "./playerReady.ts";
import { handleRoomSettings } from "./roomSettings.ts";
import { handleLeaveRoom } from "./leaveRoom.ts";

export function handleWaitingRoomWs(ws: ElysiaWS, message: any) {
    try {
        const data = JSON.parse(message as string);
        switch (data.type) {
            case "connect":
                handleWaitingRoomConnect(ws, data);
                break;
            case "playerReady":
                handlePlayerReady(ws, data);
                break;
            case "updateRoomSettings":
                handleRoomSettings(ws, data);
                break;
            case "leaveRoom":
                handleLeaveRoom(ws, data);
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
        console.error("Error parsing waiting room message:", error);
        ws.send(
            JSON.stringify({
                type: "error",
                message: "Invalid message format",
            }),
        );
    }
} 