export type ClientMessage =
  | {
      head: "init";
      version: string;
    }
  | { head: "ping" }
  | { head: "chat"; body: string }
  | { head: "auth"; body: { token: string } }
    | { head: "login"; body: { username: string; password: string; sessionID: string; } }
    | { head: "guest"; body: { name: string; sessionID: string } }
  | { head: "logout"; body: { sessionID: string } }
  | {
      head: "register";
      body: { email: string; username: string; password: string };
    }
  | {
      head: "forgot";
      body: { email: string };
    }
  // Lobby messages
  | { head: "create-room"; body: { sessionId: string; name: string; settings: RoomSettings } }
  | { head: "join-room"; body: { sessionId: string; roomId: string } }
  | { head: "leave-room"; body: { sessionId: string; roomId: string } }
  | { head: "update-character"; body: { sessionId: string; character: PlayerCharacterSetup } }
  | { head: "toggle-ready"; body: { sessionId: string; roomId: string } }
  | { head: "start-game"; body: { sessionId: string; roomId: string } }
  | { head: "get-room-list"; body: { sessionId: string } }
  | { head: "get-room-info"; body: { sessionId: string; roomId: string } }
  | { head: "regenerate-map"; body: { sessionId: string; roomId: string; mapSize: string } };

export type ServerMessage =
  | { head: "init"; body: { success: boolean } }
  | { head: "pong" }
  | { head: "echo"; body: string }
  | { head: "auth-ok"; body: { userID: string; userType: string; username: string } }
  | {
      head: "register";
      body: { status: boolean };
    }
  | {
      head: "login";
      body: { sessionID: string; userType: string; username: string };
    }
  | {
      head: "guest";
      body: { sessionID: string; username: string };
    }
  | { head: "logout"; body: { success: boolean } }
  | {
      head: "forgot";
      body: { status: boolean };
    }
  // Lobby messages
  | { head: "room-created"; body: { room: GameRoom } }
  | { head: "room-joined"; body: { room: GameRoom } }
  | { head: "room-left"; body: { roomId: string } }
  | { head: "room-updated"; body: { room: GameRoom } }
  | { head: "player-joined"; body: { roomId: string; player: PlayerSlot } }
  | { head: "player-left"; body: { roomId: string; userId: string } }
  | { head: "character-updated"; body: { roomId: string; userId: string; character: PlayerCharacterSetup } }
  | { head: "game-starting"; body: { roomId: string; turnOrder: string[] } }
  | { head: "game-started"; body: { roomId: string; gameId: string } }
  | { head: "room-list"; body: { rooms: GameRoom[] } }
  | { head: "map-regenerated"; body: { roomId: string; mapSeed: string; mapSize: string } };

export type ServerError = {
  head: "error";
  body: {
    message: string;
  };
};

// Lobby-specific types
export type RoomState = "WAITING" | "STARTING" | "IN_PROGRESS" | "FINISHED";

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  state: RoomState;
  settings: RoomSettings;
  players: PlayerSlot[];
  turnOrder?: string[];
  mapSeed?: string; // Server-generated seed for consistent map generation
  mapSize?: 'small' | 'medium' | 'large'; // Current map size
  createdAt: Date;
  startedAt?: Date;
}

export interface PlayerSlot {
  userId?: string;
  username?: string;
  userType: 'registered' | 'guest';
  isReady: boolean;
  character: PlayerCharacterSetup;
  position?: number;
}

export interface PlayerCharacterSetup {
  portraitId?: string;
  name?: string;
  stats: {
    might: number;
    intelligence: number;
    dexterity: number;
  };
}

export interface RoomSettings {
  maxPlayers: 2 | 3 | 4;
  mapId?: string;
  turnTimeLimit?: number;
  spectatorMode: boolean;
}
