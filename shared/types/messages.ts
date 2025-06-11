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
  // === LOBBY MESSAGES (Main lobby page) ===
  | { head: "lobby-get-rooms"; body: { sessionId: string } }
  | { head: "lobby-create-room"; body: { sessionId: string; name: string; config: WaitingRoomConfig } }
  | { head: "lobby-join-room"; body: { sessionId: string; roomId: string } }
  | { head: "lobby-refresh"; body: { sessionId: string } }
  | { head: "lobby-update-profile"; body: { sessionId: string; profile: PlayerProfile } }
  // === WAITING ROOM MESSAGES (Room waiting for players) ===
  | { head: "room-update-config"; body: { sessionId: string; roomId: string; config: WaitingRoomConfig } }
  | { head: "room-update-player"; body: { sessionId: string; character: PlayerCharacterSetup; profile: PlayerProfile } }
  | { head: "room-toggle-ready"; body: { sessionId: string; roomId: string } }
  | { head: "room-start-game"; body: { sessionId: string; roomId: string } }
  | { head: "room-leave"; body: { sessionId: string; roomId: string } }
  | { head: "room-presence-response"; body: { roomId: string; timestamp: number } }
  // === GAME INSTANCE MESSAGES (Actual gameplay) ===
  | { head: "game-connect"; body: { gameId: string } }
  | { head: "game-action"; body: { gameId: string; action: GameAction } }
  | { head: "game-end-turn"; body: { gameId: string } }
  | { head: "game-reconnect"; body: { gameId: string } }
  | { head: "game-presence-response"; body: { gameId: string; timestamp: number } }
  | { head: "user-add-friend"; body: { senderID: number; receiverID: number } }
  | { head: "user-accept-friend-request"; body: { senderID: number; receiverID: number } }
  | { head: "user-remove-friend"; body: { senderID: number; receiverID: number } }
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
  // === LOBBY MESSAGES (Main lobby page) ===
  | { head: "lobby-rooms-list"; body: { rooms: WaitingRoom[] } }
  | { head: "lobby-room-created"; body: { room: WaitingRoom } }
  | { head: "lobby-room-joined"; body: { room: WaitingRoom } }
  | { head: "lobby-state-update"; body: { rooms: WaitingRoom[]; playerCount: number } }
  | { head: "lobby-profile-updated"; body: { profile: PlayerProfile } }
  | { head: "lobby-redirect"; body: { location: 'lobby' | 'waiting-room' | 'game-instance'; data?: any } }
  // === WAITING ROOM MESSAGES (Room waiting for players) ===
  | { head: "room-state-update"; body: { room: WaitingRoom } }
  | { head: "room-player-joined"; body: { roomId: string; player: WaitingRoomPlayer } }
  | { head: "room-player-left"; body: { roomId: string; userId: string } }
  | { head: "room-config-updated"; body: { roomId: string; config: WaitingRoomConfig } }
  | { head: "room-ready-updated"; body: { roomId: string; userId: string; isReady: boolean } }
  | { head: "room-game-starting"; body: { roomId: string; gameId: string; turnOrder: string[] } }
  | { head: "room-presence-check"; body: { roomId: string; userId: string; timestamp: number } }
  // === GAME INSTANCE MESSAGES (Actual gameplay) ===
  | { head: "game-state-update"; body: { gameState: GameState } }
  | { head: "game-turn-update"; body: { currentPlayer: string; timeRemaining: number } }
  | { head: "game-action-result"; body: { success: boolean; message?: string; newState?: GameState } }
  | { head: "game-ended"; body: { result: GameResult } }
  | { head: "game-presence-check"; body: { gameId: string; timestamp: number } }
  | { head: "game-player-reconnected"; body: { gameId: string; userId: string } }
  | { head: "game-player-disconnected"; body: { gameId: string; userId: string } }
  | { head: "user-add-friend-response"; body: { success: boolean; message?: string } }
  | { head: "user-accept-friend-request-response"; body: { success: boolean; message?: string } }
  | { head: "user-remove-friend-response"; body: { success: boolean; message?: string } }

export type ServerError = {
  head: "error";
  body: {
    message: string;
  };
};

// === MAIN LOBBY TYPES ===
export interface LobbyState {
  availableRooms: WaitingRoom[];
  totalPlayers: number;
  playersInLobby: number;
  playersInRooms: number;
  playersInGames: number;
}

export interface PlayerProfile {
  skinId?: string;
  portraitId?: string;
  displayName?: string;
}

// === WAITING ROOM TYPES ===
export type WaitingRoomState = "WAITING" | "STARTING";

export interface WaitingRoom {
  id: string;
  name: string;
  hostId: string;
  state: WaitingRoomState;
  config: WaitingRoomConfig;
  players: WaitingRoomPlayer[];
  createdAt: Date;
}

export interface WaitingRoomConfig {
  maxPlayers: 2 | 3 | 4;
  mapSize: 'small' | 'medium' | 'large';
  mapSeed: string;
  turnTimeLimit?: number;
  spectatorMode: boolean;
  aiPlayers?: number; // Future feature
}

export interface WaitingRoomPlayer {
  userId: string;
  username: string;
  userType: 'registered' | 'guest';
  isReady: boolean;
  character: PlayerCharacterSetup;
  profile: PlayerProfile;
  lastSeen: Date;
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

// === GAME INSTANCE TYPES ===
export type GameInstanceState = "STARTING" | "PLAYING" | "PAUSED" | "FINISHED";

export interface GameInstance {
  id: string;
  waitingRoomId: string; // Reference to originating waiting room
  hostId: string;
  state: GameInstanceState;
  config: WaitingRoomConfig; // Inherited from waiting room
  players: GamePlayer[];
  gameState: GameState;
  turnOrder: string[];
  currentPlayer: string;
  currentTurn: number;
  createdAt: Date;
  startedAt: Date;
  pausedAt?: Date;
  endedAt?: Date;
}

export interface GamePlayer {
  userId: string;
  username: string;
  character: PlayerCharacterSetup;
  position: number;
  isConnected: boolean;
  stats: PlayerGameStats;
  profile: PlayerProfile;
}

export interface PlayerGameStats {
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  // Add more game-specific stats
}

export interface GameState {
  turn: number;
  phase: 'movement' | 'action' | 'end';
  map: GameMap;
  // Add more game state properties
}

export interface GameMap {
  seed: string;
  size: 'small' | 'medium' | 'large';
  tiles: MapTile[];
}

export interface MapTile {
  x: number;
  y: number;
  type: string;
  // Add more tile properties
}

export interface GameAction {
  type: 'move' | 'attack' | 'cast' | 'item';
  data: any; // Specific action data
}

export interface GameResult {
  winner?: string;
  reason: 'victory' | 'surrender' | 'disconnect' | 'timeout';
  players: {
    userId: string;
    rank: number;
    score: number;
    stats: any;
  }[];
  duration: number; // in seconds
}

// === LEGACY COMPATIBILITY (TO BE REMOVED) ===
/** @deprecated Use WaitingRoom instead */
export type LobbyRoom = WaitingRoom;
/** @deprecated Use GameInstance instead */
export type GameRoom = GameInstance;
/** @deprecated Use WaitingRoomConfig instead */
export type LobbyRoomSettings = WaitingRoomConfig;
/** @deprecated Use WaitingRoomPlayer instead */
export type PlayerSlot = WaitingRoomPlayer;
/** @deprecated Use WaitingRoomState instead */
export type LobbyRoomState = WaitingRoomState;
/** @deprecated Use GameInstanceState instead */
export type GameRoomState = GameInstanceState;
