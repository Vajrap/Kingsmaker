import { LobbyServerMessage } from '../shared/types/types';

export async function handleGetRoomList(): Promise<LobbyServerMessage> {
    // Get all waiting rooms
    // return LobbyServerMessage This must be get from SM service? since it's the central service!

    return {
        type: "ERROR",
        data: {message: ""}
    }
}
