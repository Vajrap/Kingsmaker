import { LobbyServerMessage } from "@kingsmaker/shared";
import { SessionData } from "@kingsmaker/shared";
import {
    getGameRoomById,
    getWaitingRoomById,
    handleGetWaitingRoomList,
} from "./getRoomList";
import { updatePresenceInSessionManager } from "lib/sessionServiceClient";

export async function handleOpen(
    session: SessionData,
): Promise<LobbyServerMessage> {
    switch (session.presenceStatus) {
        case "IN_WAITING_ROOM": {
            if (session.waitingRoomId === null) break;

            const room = await getWaitingRoomById(session.waitingRoomId);
            if (room === null) break;

            return {
                type: "IN_WAITING_ROOM",
                data: { roomId: room.id },
            };
        }
        case "IN_GAME": {
            if (session.gameRoomId === null) break;

            const room = await getGameRoomById(session.gameRoomId);
            if (room === null) break;
            // This one will need to send the player back to the game is the game is still running
            // But if the game is ended, not found, just set the player into the lobby
            return {
                type: "IN_GAME",
                data: { gameId: room.id },
            };
        }
        default:
            break;
    }

    updatePresenceInSessionManager(session.userId, "IN_LOBBY");

    const roomList = await handleGetWaitingRoomList();
    return roomList;
}
