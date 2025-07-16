import { sendRestRequest } from "../utils/sendRequest";
export class SessionManagerClient {
    baseUrl;
    constructor(baseUrl = process.env.SESSION_MANAGER_URL ||
        "http://sessionmanager:3000") {
        this.baseUrl = baseUrl;
    }
    async fetchSessionManager(endpoint, method = "POST", body) {
        const result = await sendRestRequest(`${this.baseUrl}${endpoint}`, method, body);
        return result.success ? result.data : null;
    }
    async createSession(user) {
        const result = await sendRestRequest(`${this.baseUrl}/createSession`, "POST", { id: user.id, sessionId: user.sessionId || "" });
        if (!result.success) {
            throw new Error(result.message || "Failed to create session");
        }
        return result;
    }
    async deleteSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/deleteSession`, "DELETE", { sessionId });
        if (!result.success) {
            throw new Error(result.message || "Failed to delete session");
        }
        return result;
    }
    async getAllSessions() {
        const result = await sendRestRequest(`${this.baseUrl}/getAllSessions`, "GET");
        if (!result.success) {
            throw new Error(result.message || "Failed to get all sessions");
        }
        return result.data.data;
    }
    async getSession(sessionId, getUserIdFromSessionId) {
        // Try direct session lookup first
        const sessionData = await this.fetchSessionManager("/getSession", "POST", { sessionId });
        if (sessionData) {
            return sessionData;
        }
        return null;
    }
    /**
     * Update session activity
     */
    async refreshSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/refreshSession`, "POST", { sessionId });
        return result.success ? result.data.success : false;
    }
    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId) {
        const result = await sendRestRequest(`${this.baseUrl}/getUserSessions`, "POST", { userId });
        return result.success ? result.data : [];
    }
    async validateSession(sessionId, getUserIdFromSessionId) {
        return this.getSession(sessionId, getUserIdFromSessionId);
    }
}
// Export singleton instance
export const sessionManagerClient = new SessionManagerClient();
/**
 * Standard WebSocket session validation for all services
 * This should be used by all WebSocket handlers to validate sessions consistently
 */
export async function validateWSSession(message, getUserIdFromSessionId) {
    // Check if sessionId exists in message
    const sessionId = message.data?.sessionId;
    if (!sessionId) {
        return {
            isValid: false,
            errorMessage: "MISSING_SESSION_ID",
        };
    }
    try {
        // Get session data from SessionManager
        const sessionData = await sessionManagerClient.getSession(sessionId, getUserIdFromSessionId);
        if (!sessionData) {
            return {
                isValid: false,
                errorMessage: "INVALID_SESSION",
            };
        }
        return {
            isValid: true,
            userId: sessionData.userId,
            sessionData,
        };
    }
    catch (error) {
        console.error("Session validation error:", error);
        return {
            isValid: false,
            errorMessage: "SESSION_VALIDATION_ERROR",
        };
    }
}
/**
 * Standard WebSocket error message format
 */
export function createWSErrorMessage(type, errorCode, message) {
    return {
        type: "ERROR",
        data: {
            code: errorCode,
            message: message || errorCode,
        },
    };
}
