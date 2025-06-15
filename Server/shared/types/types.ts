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

export type LoginResponse = {
  id: number;
  nameAlias: string;
  username: string;
  email: string;
  type: 'registered' | 'guest' | 'admin';
  sessionToken: string;
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

export type AutoLoginBody = {
    sessionToken: string;
}

// Lobby and Room related types
export interface SessionData {
    userId: string;
    userType: 'registered' | 'guest';
    username: string;
    connectedAt: string;
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
