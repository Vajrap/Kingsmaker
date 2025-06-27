import type { User } from '../prisma/generated';
import type { SessionData } from '../types/types';

export class SessionManagerClient {
    private baseUrl: string;

    constructor(baseUrl: string = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000") {
        this.baseUrl = baseUrl;
    }

    private isApiResponse(obj: unknown): obj is { success: boolean; data?: unknown; message?: string } {
        return (
            typeof obj === "object" &&
            obj !== null &&
            "success" in obj &&
            typeof (obj as any).success === "boolean"
        );
    }

    private serializeUserPayload(user: any) {
        return {
            id: user.id,
            username: user.username,
            type: user.type,
            email: user.email,
            nameAlias: user.nameAlias,
            isConfirmed: user.isConfirmed,
            highestScore: user.highestScore,
            totalGames: user.totalGames,
            totalWins: user.totalWins,
            totalLosses: user.totalLosses,
            totalTies: user.totalTies,

            achievements: user.achievements ?? {},
            unlockables: user.unlockables ?? {},
            customization: user.customization ?? {},
            friends: user.friends ?? [],
            blocked: user.blocked ?? [],

            sessionId: user.sessionId ?? null,
            sessionExpireAt: user.sessionExpireAt
                ? new Date(user.sessionExpireAt).toISOString()
                : null,
        };
    }

    private async fetchSessionManager<T>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'DELETE',
            body?: unknown
        } = {}
    ): Promise<T | null> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: options.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: options.body ? JSON.stringify(options.body) : undefined,
            });

            const raw = await response.text();
            let json: any;

            try {
                json = JSON.parse(raw);
            } catch {
                console.error(`SessionManager returned non-JSON response from ${endpoint}:`, raw);
                return null;
            }

            if (!this.isApiResponse(json)) {
                console.error(`SessionManager ${endpoint} returned invalid structure:`, json);
                return null;
            }

            if (!response.ok || !json.success) {
                console.error(`SessionManager ${endpoint} failed: ${json.message || `HTTP ${response.status}`}`);
                return null;
            }

            return json.data as T;
        } catch (error) {
            console.error(`Failed to call SessionManager ${endpoint}:`, error);
            return null;
        }
    }

    // Auth service methods
    async addConnection(user: User): Promise<SessionData | null> {
        return this.fetchSessionManager<SessionData>('/addConnection', {
            body: this.serializeUserPayload(user)
        });
    }

    async resumeConnection(user: User): Promise<SessionData | null> {
        return this.fetchSessionManager<SessionData>('/resumeConnection', {
            body: this.serializeUserPayload(user)
        });
    }

    async removeConnection(userId: number): Promise<boolean> {
        const result = await this.fetchSessionManager<any>('/removeConnection', {
            method: 'DELETE',
            body: { userId }
        });
        return result !== null;
    }

    // Lobby service methods
    async getConnection(userId: number): Promise<SessionData | null> {
        return this.fetchSessionManager<SessionData>('/getConnection', {
            body: { userId }
        });
    }

    async updatePresence(userId: number, presence: string): Promise<boolean> {
        const result = await this.fetchSessionManager<any>('/updatePresence', {
            body: { userId, presence }
        });
        return result !== null;
    }

    // Helper method to get session by sessionId (needs database lookup first)
    async getSessionBySessionId(sessionId: string, getUserIdFromSessionId: (sessionId: string) => Promise<number | null>): Promise<SessionData | null> {
        const userId = await getUserIdFromSessionId(sessionId);
        if (!userId) return null;
        
        return this.getConnection(userId);
    }
}

// Export singleton instance
export const sessionManagerClient = new SessionManagerClient(); 