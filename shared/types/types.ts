type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ErrorResponse = {
  success: false;
  message: string;
};

export function errorRes(message: string): ErrorResponse {
  return {
    success: false,
    message
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function ok<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message
  };
}



export type LoginBody = {
    username: string;
    password: string;
}

export type AuthBody = {
    token: string;
}

export type GuestBody = {

}

export type SessionManagerUserLoginResponse = {
    sessionId: string;
    userId: number;
    userType: 'registered' | 'guest' | 'admin';
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
}

export type LoginResponse = {
  sessionId: string;
  userType: 'registered' | 'guest' | 'admin';
  username: string;
  nameAlias: string;
  presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
};

export type RegisterBody = {
    username: string;
    email: string;
    password: string;
}

export type RegisterResponse = {
  id: number;
  nameAlias: string;
  username: string;
  email: string;
  type: 'registered' | 'guest' | 'admin';
};

export type LogoutBody = {
    sessionToken: string;
}

export type LogoutResponse = {
  message: string;
};

// Lobby and Room related types
export interface SessionData {
    sessionId: string;
    userId: string;
    userType: 'registered' | 'guest';
    username: string;
    connectedAt: string;
    lastSeen: string;
}

export interface WaitingRoomMetadata {
    id: string;
    name: string;
    hostId: string;
    hostUsername: string;
    state: 'WAITING' | 'STARTING' | 'IN_PROGRESS';
    maxPlayers: 2 | 3 | 4;
    currentPlayers: number;
    createdAt: string;
    playerList: string[];
}

export interface PlayerSlot {
    userId: string;
    username: string;
    userType: 'registered' | 'guest';
    isReady: boolean;
    profile: {
        portraitId?: string;
        skinId?: string;
    };
    lastSeen: string;
    character?: PlayerCharacterSetup;
}

export interface PlayerProfile {
    portraitId?: string;
    skinId?: string;
    displayName?: string;
}

export interface PlayerLocation {
    location: 'lobby' | 'waiting-room' | 'game';
    roomId?: string;
    gameId?: string;
    lastSeen: string;
}

// Lobby WebSocket Message types
export type LobbyClientMessage =
    | { type: "GET_ROOM_LIST"; data: {} }
    | { type: "CREATE_ROOM"; data: { name: string; maxPlayers: 2 | 3 | 4 } }
    | { type: "JOIN_ROOM"; data: { roomId: string } }
    | { type: "LEAVE_ROOM"; data: { roomId: string } }
    | { type: "UPDATE_PROFILE"; data: { profile: PlayerProfile } }
    | { type: "REFRESH_LOBBY"; data: {} };

export type LobbyServerMessage =
    | { type: "ROOM_LIST"; data: { rooms: WaitingRoomMetadata[] } }
    | { type: "ROOM_CREATED"; data: { room: WaitingRoomMetadata } }
    | { type: "ROOM_JOINED"; data: { roomId: string; success: boolean } }
    | { type: "LOBBY_UPDATE"; data: { rooms: WaitingRoomMetadata[]; onlinePlayers: number } }
    | { type: "ERROR"; data: { message: string; code: string } };

// Pub/Sub Event types
export interface PubSubEvent<T = any> {
    timestamp: number;
    data: T;
}

export interface RoomCreatedEvent {
    roomId: string;
    roomData: WaitingRoomMetadata;
}

export interface RoomClosedEvent {
    roomId: string;
    reason: string;
}

export interface PlayerJoinedEvent {
    roomId: string;
    userId: string;
    playerData: PlayerSlot;
}

export interface PlayerLeftEvent {
    roomId: string;
    userId: string;
}

export interface GameStartingEvent {
    roomId: string;
    gameId: string;
}

export interface GameEndedEvent {
    roomId: string;
    gameId: string;
}

// Game Room types (for client compatibility)
export interface GameRoom {
    id: string;
    name: string;
    hostId: string;
    hostUsername: string;
    state: 'WAITING' | 'STARTING' | 'IN_PROGRESS';
    players: PlayerSlot[];
    settings: RoomSettings;
    mapSeed?: string;
}

export interface RoomSettings {
    maxPlayers: 2 | 3 | 4;
    spectatorMode: boolean;
    turnTimeLimit?: number;
}

// Character customization types
export interface PlayerCharacterSetup {
    portraitId: string;
    name: string;
    stats: {
        might: number;
        intelligence: number;
        dexterity: number;
    };
}

// Map types
export type TileType = 'castle' | 'fortress' | 'city' | 'village' | 'forest' | 'mine' | 'field' | 'ruins' | 'plain' | 'road';

export interface GameTile {
    id: string;
    x: number;
    y: number;
    type: TileType;
    ownerId?: string;
    resources?: number;
    captains: string[];
    unrest: number;
    buildings?: string[];
}

export interface GameMap {
    id: string;
    width: number;
    height: number;
    seed: string;
    tiles: GameTile[];
    playerStartPositions: { [playerId: string]: { x: number; y: number } };
}

export type MapSize = 'small' | 'medium' | 'large';

export interface MapGenerationConfig {
    size: MapSize;
    playerCount: number;
    seed?: string;
}

// Map configuration constants
export const MAP_CONFIGS = {
    small: { width: 4, height: 6, totalTiles: 24 },
    medium: { width: 6, height: 8, totalTiles: 48 },
    large: { width: 8, height: 10, totalTiles: 80 }
};

export const TILE_DISTRIBUTION: Record<TileType, number> = {
    castle: 4,     // Player starting positions
    fortress: 2,   // Defensive structures
    city: 3,       // Major settlements
    village: 6,    // Minor settlements
    forest: 4,     // Wood resource
    mine: 3,       // Iron resource
    field: 4,      // Food resource
    ruins: 2,      // Exploration sites
    plain: 0,      // Will be filled automatically
    road: 0        // Will be generated based on connections
};
