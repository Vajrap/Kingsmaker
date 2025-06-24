import { LobbyServerMessage, LobbyClientMessage, SessionData } from '../shared/types/types';

export async function handleCreateRoom(
    session: SessionData,
    msg: LobbyClientMessage
): Promise<LobbyServerMessage> {

    return {
        type: "ERROR",
        data: {message: ""}
    }
}
