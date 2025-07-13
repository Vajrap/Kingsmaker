import { type User } from "@kingsmaker/shared/prisma/generated";
import {
    ClientPresenceStatus,
    type SessionData,
} from "@kingsmaker/shared/types/types";

class SessionManager {
    // Single unified storage for all sessions/connections
    private sessions = new Map<string, SessionData>();
    private sessionsByUserId = new Map<number, string>(); // userId -> sessionId mapping

    // CREATE - Add a new connection/session
    createSession(user: User): SessionData {
        const now = new Date();
        const sessionInfo: SessionData = {
            sessionId: user.sessionId,
            userId: user.id,
            userType: user.type,
            username: user.username,
            presenceStatus: "INITIAL",
            lastSeen: now.toDateString(),
            connectedAt: now.toDateString(),
            waitingRoomId: null,
            gameRoomId: null,
        };

        this.sessions.set(user.sessionId, sessionInfo);
        this.sessionsByUserId.set(user.id, user.sessionId);

        return sessionInfo;
    }

    deleteSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        this.sessions.delete(sessionId);
        this.sessionsByUserId.delete(session.userId);
        return true;
    }

    getAllSessions(): SessionData[] {
        return Array.from(this.sessions.values());
    }

    getSession(sessionId: string): SessionData | null {
        return this.sessions.get(sessionId) || null;
    }

    refreshSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.lastSeen = new Date().toDateString();
        return true;
    }

    updateSessionPresence(
        sessionId: string,
        presence: ClientPresenceStatus,
    ): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.presenceStatus = presence;
        session.lastSeen = new Date().toDateString();
        return true;
    }

    // UTILITY METHODS
    isConnected(sessionId: string): boolean {
        return this.sessions.has(sessionId);
    }

    validateSession(sessionId: string): SessionData | null {
        return this.getSession(sessionId);
    }
}

export const sessionManager = new SessionManager();
