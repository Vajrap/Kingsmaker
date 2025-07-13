import { sendRestRequest } from "../utils/sendRequest";
export class SessionManager {
    static baseUrl = process.env.SESSION_MANAGER_URL || "http://sessionmanager:3000";
    /**
     * Store session data in SessionManager service
     */
    static async createSession(sessionId, sessionData) {
        const result = await sendRestRequest(`${this.baseUrl}/createSession`, "POST", { sessionId, sessionData });
        if (!result.success) {
            throw new Error(result.message || "Failed to create session");
        }
    }
    /**
     * Retrieve session data from SessionManager service
     */
    static async getSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/getSession`, "POST", { sessionId });
        return result.success ? result.data : null;
    }
    /**
     * Update session activity
     */
    static async refreshSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/refreshSession`, "POST", { sessionId });
        return result.success ? result.data.success : false;
    }
    /**
     * Remove session from SessionManager service
     */
    static async deleteSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/deleteSession`, "POST", { sessionId });
        if (!result.success) {
            throw new Error(result.message || "Failed to delete session");
        }
    }
    /**
     * Get all active sessions for a user
     */
    static async getUserSessions(userId) {
        const result = await sendRestRequest(`${this.baseUrl}/getUserSessions`, "POST", { userId });
        return result.success ? result.data : [];
    }
    /**
     * Validate if session exists and is active
     */
    static async validateSession(sessionId) {
        const result = await sendRestRequest(`${this.baseUrl}/validateSession`, "POST", { sessionId });
        return result.success ? result.data : null;
    }
}
