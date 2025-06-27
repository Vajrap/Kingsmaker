import type {
  LobbyClientMessage,
  LobbyServerMessage,
  SessionData,
} from './shared/types/types';
import 'dotenv/config';
import { Elysia, t } from 'elysia';
import { handleGetRoomList } from './handler/getRoomList';
import { getSession } from './lib/sessionServiceClient';
import { handleJoinRoom } from './handler/joinRoom';
import { handleCreateRoom } from './handler/createRoom';
import { ElysiaWS } from 'elysia/dist/ws';

const PORT = parseInt(process.env.PORT || '3000');

const connections = new Map<string, {
    ws: ElysiaWS,
    session: SessionData
}>();

new Elysia()
    .ws('/lobby', {
        body: t.Object({
            type: t.String(),
            data: t.Optional(t.Any())
        }),
        async open(ws) {
            const sessionId = ws.data.query.sessionId;
            if (!sessionId) { return ws.send(errorMsg('MISSING_SESSION_ID')) }
            const existedSession = await getSession(sessionId);

            // If existed session (from SM service), means, user is already logged in,
            if (existedSession) {
                switch (existedSession.presenceStatus) {
                    case('IN_WAITING_ROOM'): {
                        // TODO: Check if WaitingRoom is still valid
                        // Check the send player back into the waiting room
                        // If the waiting room is not found, set the player into the lobby
                    }
                    case('IN_GAME'): {
                        // TODO: Check if Game ended
                        // This one will need to send the player back to the game is the game is still running
                        // But if the game is ended, not found, just set the player into the lobby
                    }
                }
            } else {
                // Since Auth set user session into SM service, if not existed that's going to be an error
                return ws.send(errorMsg('INVALID_SESSION'));
            };
            
            // Set player into the lobby => add into connections map
            connections.set(sessionId, { ws, session: existedSession });

            // Send room list to the player
            const roomList = await handleGetRoomList();

            ws.send(JSON.stringify(roomList));
        },
        async message(ws, msg: LobbyClientMessage) {
            const sessionId = msg.data?.sessionId;
            if (!sessionId) { return ws.send(errorMsg('MISSING_SESSION_ID')) }

            const session = await getSession(msg.data.sessionId);
            if (!session) { return ws.send(errorMsg('INVALID_SESSION')) }

            let response: LobbyServerMessage;

            switch (msg.type) {
                case("GET_ROOM_LIST"): {
                    response = await handleGetRoomList(session, msg);
                    break;
                }
                case("JOIN_ROOM"): {
                    response = await handleJoinRoom(session, msg)
                    break;
                }
                case("CREATE_ROOM"): {
                    response = await handleCreateRoom(session, msg)
                    break;
                }
                default: { response = errorMsg('UNKNOWN_MESSAGE_TYPE') }
            }

            ws.send(JSON.stringify(response));
        },
    close(ws) {},
    })
    .listen(PORT);

console.log(`🚀 Lobby service running on http://localhost:${PORT}`);

function errorMsg(msg: string): LobbyServerMessage {
    return {
        type: 'ERROR',
        data: {
            message: msg,
        }
    };
}
