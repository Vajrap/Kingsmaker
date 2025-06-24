type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};
type ErrorResponse = {
    success: false;
    message: string;
};
export declare function errorRes(message: string): ErrorResponse;
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export declare function ok<T>(data: T, message?: string): SuccessResponse<T>;
export type LoginBody = {
    username: string;
    password: string;
};
export type AuthBody = {
    token: string;
};
export type GuestBody = {};
export type SessionData = {
    sessionId: string;
    userId: number;
    userType: 'registered' | 'guest' | 'admin';
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
};
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
};
export type RegisterResponse = {
    id: number;
    nameAlias: string;
    username: string;
    email: string;
    type: 'registered' | 'guest' | 'admin';
};
export type LogoutBody = {
    sessionToken: string;
};
export type LogoutResponse = {
    message: string;
};
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
export type LobbyClientMessage = {
    type: "GET_ROOM_LIST";
    data: {
        sessionId: string;
    };
} | {
    type: "CREATE_ROOM";
    data: {
        sessionId: string;
        name: string;
        maxPlayers: 2 | 3 | 4;
    };
} | {
    type: "JOIN_ROOM";
    data: {
        sessionId: string;
        roomId: string;
    };
};
export type LobbyServerMessage = {
    type: "ROOM_LIST";
    data: {
        rooms: WaitingRoomMetadata[];
    };
} | {
    type: "ROOM_CREATED";
    data: {
        room: WaitingRoomMetadata;
    };
} | {
    type: "ROOM_JOINED";
    data: {
        roomId: string;
        success: boolean;
    };
} | {
    type: "LOBBY_UPDATE";
    data: {
        rooms: WaitingRoomMetadata[];
        onlinePlayers: number;
    };
} | {
    type: "ERROR";
    data: {
        message: string;
    };
} | {
    type: "IN_WAITING_ROOM";
    data: {
        roomId: string;
    };
} | {
    type: "IN_GAME";
    data: {
        gameId: string;
    };
};
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
export interface PlayerCharacterSetup {
    portraitId: string;
    name: string;
    stats: {
        might: number;
        intelligence: number;
        dexterity: number;
    };
}
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
    playerStartPositions: {
        [playerId: string]: {
            x: number;
            y: number;
        };
    };
}
export type MapSize = 'small' | 'medium' | 'large';
export interface MapGenerationConfig {
    size: MapSize;
    playerCount: number;
    seed?: string;
}
export declare const MAP_CONFIGS: {
    small: {
        width: number;
        height: number;
        totalTiles: number;
    };
    medium: {
        width: number;
        height: number;
        totalTiles: number;
    };
    large: {
        width: number;
        height: number;
        totalTiles: number;
    };
};
export declare const TILE_DISTRIBUTION: Record<TileType, number>;
export {};
//# sourceMappingURL=types.d.ts.map