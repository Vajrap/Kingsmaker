import type { GameRoom } from "./room";

export type LobbyClientMessage =
    | { type: "GET_ROOM_LIST"; data: { sessionId: string } }
    | {
          type: "CREATE_ROOM";
          data: { sessionId: string; data: GameRoom };
      }
    | { type: "JOIN_ROOM"; data: { sessionId: string; roomId: string } };

export type LobbyServerMessage =
    | { type: "ROOM_LIST"; data: { rooms: GameRoom[] } }
    | { type: "ROOM_CREATED"; data: { roomId: string } }
    | { type: "ROOM_JOINED"; data: { roomId: string; success: boolean } }
    | {
          type: "LOBBY_UPDATE";
          data: { rooms: GameRoom[]; onlinePlayers: number };
      }
    | { type: "ERROR"; data: { code: string; message: string } }
    | { type: "IN_WAITING_ROOM"; data: { roomId: string } }
    | { type: "IN_GAME"; data: { gameId: string } };
