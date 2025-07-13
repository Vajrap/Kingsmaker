import type { SessionData } from "../types/types";
export declare class SessionManager {
    private static baseUrl;
    /**
     * Store session data in SessionManager service
     */
    static createSession(sessionId: string, sessionData: SessionData): Promise<void>;
    /**
     * Retrieve session data from SessionManager service
     */
    static getSession(sessionId: string): Promise<SessionData | null>;
    /**
     * Update session activity
     */
    static refreshSession(sessionId: string): Promise<boolean>;
    /**
     * Remove session from SessionManager service
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