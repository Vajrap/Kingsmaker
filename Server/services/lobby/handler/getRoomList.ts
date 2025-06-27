import { LobbyServerMessage, LobbyClientMessage, SessionData } from '../shared/types/types';

export async function handleGetRoomList(
    session?: SessionData,
    msg?: LobbyClientMessage
): Promise<LobbyServerMessage> {
    // TODO: This should get rooms from a room state manager (Redis/Database)
    // For now, return empty room list
    const rooms = [];
    
    return {
        type: "ROOM_LIST",
        data: { rooms }
    };
}
