import type { SessionData } from '@kingsmaker/shared/types/types';
export declare class SessionManager {
    private static SESSION_TTL;
    /**
     * Store session data in Redis with TTL
     */
    static createSession(sessionId: string, sessionData: SessionData): Promise<void>;
    /**
     * Retrieve session data from Redis
     */
    static getSession(sessionId: string): Promise<SessionData | null>;
    /**
     * Update session activity and extend TTL
     */
    static refreshSession(sessionId: string): Promise<boolean>;
    /**
     * Remove session from Redis
     */
    static deleteSession(sessionId: string): Promise<void>;
    /**
     * Get all active sessions for a user
     */
    static getUserSessions(userId: string): Promise<string[]>;
    /**
     * Validate if session exists and is active
     */
    static validateSession(sessionId: string): Promise<SessionData | null>;
}
//# sourceMappingURL=session.d.ts.map