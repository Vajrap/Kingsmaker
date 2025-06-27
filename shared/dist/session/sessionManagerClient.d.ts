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
//# sourceMappingURL=sessionManagerClient.d.ts.map