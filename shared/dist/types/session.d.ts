export type SessionData = {
    sessionId: string;
    userId: number;
    userType: "registered" | "guest" | "admin";
    username: string;
    connectedAt: string;
    lastSeen: string;
    presenceStatus: "INITIAL" | "IN_LOBBY" | "IN_WAITING_ROOM" | "IN_GAME" | "OFFLINE";
};
//# sourceMappingURL=session.d.ts.map