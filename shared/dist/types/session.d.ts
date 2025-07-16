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
export interface DeleteSessionInput {
    sessionId: string;
}
export interface DeleteSessionOutput {
    success: boolean;
}
export interface GetSessionInput {
    sessionId: string;
}
export interface GetSessionOutput extends SessionData {
}
export interface RefreshSessionInput {
    sessionId: string;
}
export interface RefreshSessionOutput {
    success: boolean;
}
export interface UpdatePresenceInput {
    sessionId: string;
    presenceStatus: ClientPresenceStatus;
}
export interface UpdatePresenceOutput {
    success: boolean;
}
export interface ValidateSessionInput {
    sessionId: string;
}
export interface ValidateSessionOutput extends SessionData {
}
export interface SessionManagerUserLoginResponse {
    sessionId: string;
    userId: number;
    userType: "registered" | "guest" | "admin";
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: ClientPresenceStatus;
}
export type ClientPresenceStatus = "INITIAL" | "IN_LOBBY" | "IN_WAITING_ROOM" | "IN_GAME" | "OFFLINE";
//# sourceMappingURL=session.d.ts.map