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
import { handleOpen } from 'handler/open';

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

            if (!existedSession) { return ws.send(errorMsg('INVALID_SESSION')) };

            const response = await handleOpen(existedSession);

            connections.set(sessionId, { ws, session: existedSession });

            ws.send(JSON.stringify(response));
        },

        async message(ws, msg: LobbyClientMessage) {
            const sessionId = msg.data?.sessionId;
            if (!sessionId) { return ws.send(errorMsg('MISSING_SESSION_ID')) }

            const session = await getSession(msg.data.sessionId);
            if (!session) { return ws.send(errorMsg('INVALID_SESSION')) }

            let response: LobbyServerMessage;

            switch (msg.type) {
                case("GET_ROOM_LIST"): {
                    response = await handleGetRoomList();
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


