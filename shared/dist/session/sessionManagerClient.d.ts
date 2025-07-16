import type { User } from "../prisma/generated";
import { type ApiResponse, type CreateSessionOutput, type DeleteSessionOutput, type SessionData } from "../types/types";
export declare class SessionManagerClient {
    private baseUrl;
    constructor(baseUrl?: string);
    private fetchSessionManager;
    createSession(user: User): Promise<ApiResponse<CreateSessionOutput>>;
    deleteSession(sessionId: string): Promise<ApiResponse<DeleteSessionOutput>>;
    getAllSessions(): Promise<SessionData[]>;
    getSession(sessionId: string, getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>): Promise<SessionData | null>;
    /**
     * Update session activity
     */
    refreshSession(sessionId: string): Promise<boolean>;
    /**
     * Get all active sessions for a user
     */
    getUserSessions(userId: string): Promise<string[]>;
    validateSession(sessionId: string, getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>): Promise<SessionData | null>;
}
export declare const sessionManagerClient: SessionManagerClient;
export interface WSMessage {
    type: string;
    data?: {
        sessionId?: string;
        [key: string]: any;
    };
}
export interface WSValidationResult {
    isValid: boolean;
    userId?: number;
    sessionData?: SessionData;
    errorMessage?: string;
}
/**
 * Standard WebSocket session validation for all services
 * This should be used by all WebSocket handlers to validate sessions consistently
 */
export declare function validateWSSession(message: WSMessage, getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>): Promise<WSValidationResult>;
/**
 * Standard WebSocket error message format
 */
export declare function createWSErrorMessage(type: string, errorCode: string, message?: string): {
    type: string;
    data: {
        code: string;
        message: string;
    };
};
//# sourceMappingURL=sessionManagerClient.d.ts.map