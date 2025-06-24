import { LobbyServerMessage } from "shared";
import { SessionData } from "shared";
import { handleGetRoomList } from "./getRoomList";
import { updatePresenceInSessionManager } from "lib/sessionServiceClient";

export async function handleOpen(session: SessionData):Promise<LobbyServerMessage> {
    switch (session.presenceStatus) {
        case('IN_WAITING_ROOM'): {
            // TODO: Check if WaitingRoom is still valid
            // Check the send player back into the waiting room
            // If the waiting room is not found, set the player into the lobby
            return {
                type: "IN_WAITING_ROOM",
                data: {
                    roomId: ""
                }
            }
        }
        case('IN_GAME'): {
            // TODO: Check if Game ended
            // This one will need to send the player back to the game is the game is still running
            // But if the game is ended, not found, just set the player into the lobby
            return {
                type: "IN_GAME",
                data: {
                    gameId: ""
                }
            }
        }
        default: break;
    }
    
    updatePresenceInSessionManager(session.sessionId, 'IN_LOBBY');

    const roomList = await handleGetRoomList();
    return roomList;
}
