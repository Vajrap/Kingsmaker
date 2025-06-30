import type { User } from '../prisma/generated';
import type { SessionData } from '../types/types';
export declare class SessionManagerClient {
    private baseUrl;
    constructor(baseUrl?: string);
    private isApiResponse;
    private serializeUserPayload;
    private fetchSessionManager;
    addConnection(user: User): Promise<SessionData | null>;
    resumeConnection(user: User): Promise<SessionData | null>;
    removeConnection(userId: number): Promise<boolean>;
    getConnection(userId: number): Promise<SessionData | null>;
    updatePresence(userId: number, presence: string): Promise<boolean>;
    getSessionBySessionId(sessionId: string, getUserIdFromSessionId: (sessionId: string) => Promise<number | null>): Promise<SessionData | null>;
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
export declare function validateWSSession(message: WSMessage, getUserIdFromSessionId: (sessionId: string) => Promise<number | null>): Promise<WSValidationResult>;
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