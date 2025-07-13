export interface CreateSessionInput {
    id: number;
    sessionId: string;
}

export interface CreateSessionOutput {
    sessionId: string;
    userId: number;
    userType: "registered" | "guest" | "admin";
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: ClientPresenceStatus;
    waitingRoomId: string | null;
    gameRoomId: string | null;
}

export type SessionData = {
    sessionId: string;
    userId: number;
    userType: "registered" | "guest" | "admin";
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: ClientPresenceStatus;
    waitingRoomId: string | null;
    gameRoomId: string | null;
};

export interface SessionManagerUserLoginResponse {
    sessionId: string;
    userId: number;
    userType: "registered" | "guest" | "admin";
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: ClientPresenceStatus;
}

export type ClientPresenceStatus =
    | "INITIAL"
    | "IN_LOBBY"
    | "IN_WAITING_ROOM"
    | "IN_GAME"
    | "OFFLINE";
