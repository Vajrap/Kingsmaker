import { Player } from "./player";
import { type GameRoom } from "./room";

export type LobbyClientMessage =
    | {
          type: "JOIN";
          data: {
              userId: number;
              sessionId: string;
              type: "GUEST" | "REGISTERED";
          };
      }
    | { type: "GET_ROOM_LIST"; data: { sessionId: string } }
    | {
          type: "CREATE_ROOM";
          data: {
              sessionId: string;
              roomData: GameRoom;
              player: Player;
          };
      }
    | { type: "JOIN_ROOM"; data: { player: Player; roomId: string } };

export type LobbyServerMessage =
    | { type: "CONNECTED"; data: { message: string } }
    | {
          type: "ERROR";
          error: "ALREADY_LOGGED_IN" | "SEASON_INVALID" | "INVALID_TYPE";
      }
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
