export class SessionManagerClient {
    baseUrl;
    constructor(baseUrl = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000") {
        this.baseUrl = baseUrl;
    }
    isApiResponse(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            "success" in obj &&
            typeof obj.success === "boolean");
    }
    serializeUserPayload(user) {
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
    async fetchSessionManager(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: options.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const raw = await response.text();
            let json;
            try {
                json = JSON.parse(raw);
            }
            catch {
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
            return json.data;
        }
        catch (error) {
            console.error(`Failed to call SessionManager ${endpoint}:`, error);
            return null;
        }
    }
    // Auth service methods
    async addConnection(user) {
        return this.fetchSessionManager('/addConnection', {
            body: this.serializeUserPayload(user)
        });
    }
    async resumeConnection(user) {
        return this.fetchSessionManager('/resumeConnection', {
            body: this.serializeUserPayload(user)
        });
    }
    async removeConnection(userId) {
        const result = await this.fetchSessionManager('/removeConnection', {
            method: 'DELETE',
            body: { userId }
        });
        return result !== null;
    }
    // Lobby service methods
    async getConnection(userId) {
        return this.fetchSessionManager('/getConnection', {
            body: { userId }
        });
    }
    async updatePresence(userId, presence) {
        const result = await this.fetchSessionManager('/updatePresence', {
            body: { userId, presence }
        });
        return result !== null;
    }
    // Helper method to get session by sessionId (needs database lookup first)
    async getSessionBySessionId(sessionId, getUserIdFromSessionId) {
        const userId = await getUserIdFromSessionId(sessionId);
        if (!userId)
            return null;
        return this.getConnection(userId);
    }
}
// Export singleton instance
export const sessionManagerClient = new SessionManagerClient();
