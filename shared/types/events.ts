import type { Player } from "./player";

export interface PubSubEvent<T = any> {
    timestamp: number;
    data: T;
}

export interface RoomCreatedEvent {
    roomId: string;
}

export interface RoomClosedEvent {
    roomId: string;
    reason: string;
}

export interface PlayerJoinedEvent {
    roomId: string;
    userId: string;
    playerData: Player;
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
