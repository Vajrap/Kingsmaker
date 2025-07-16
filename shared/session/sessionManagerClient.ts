import type { User } from "../prisma/generated";
import { CreateSessionInput, type ApiResponse, type CreateSessionOutput, type DeleteSessionOutput, type SessionData } from "../types/types";
import { sendRestRequest } from "../utils/sendRequest";

export class SessionManagerClient {
    private baseUrl: string;

    constructor(
        baseUrl: string = process.env.SESSION_MANAGER_URL ||
            "http://sessionmanager:3000",
    ) {
        this.baseUrl = baseUrl;
    }

    private async fetchSessionManager<REQ, RES>(
        endpoint: string,
        method: "GET" | "POST" | "DELETE" = "POST",
        body?: REQ,
    ): Promise<RES | null> {
        const result = await sendRestRequest<REQ, RES>(
            `${this.baseUrl}${endpoint}`,
            method,
            body,
        );
        return result.success ? result.data : null;
    }

    async createSession(user: User): Promise<ApiResponse<CreateSessionOutput>> {
        
        const result = await sendRestRequest<CreateSessionInput, CreateSessionOutput>(
            `${this.baseUrl}/createSession`,
            "POST",
            { id: user.id, sessionId: user.sessionId || "" },
        )

        if (!result.success) {
            throw new Error(result.message || "Failed to create session");
        }
        return result;
    }

    async deleteSession(sessionId: string): Promise<ApiResponse<DeleteSessionOutput>> {
        const result = await sendRestRequest<
            { sessionId: string },
            DeleteSessionOutput
        >(`${this.baseUrl}/deleteSession`, "DELETE", { sessionId });

        if (!result.success) {
            throw new Error(result.message || "Failed to delete session");
        }
        return result;
    }

    async getAllSessions(): Promise<SessionData[]> {
        const result = await sendRestRequest<{}, { data: SessionData[] }>(
            `${this.baseUrl}/getAllSessions`,
            "GET",
        );

        if (!result.success) {
            throw new Error(result.message || "Failed to get all sessions");
        }
        return result.data.data;
    }

    async getSession(
        sessionId: string,
        getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>,
    ): Promise<SessionData | null> {
        // Try direct session lookup first
        const sessionData = await this.fetchSessionManager<
            { sessionId: string },
            SessionData
        >("/getSession", "POST", { sessionId });

        if (sessionData) {
            return sessionData;
        }

        return null;
    }

    /**
     * Update session activity
     */
    async refreshSession(sessionId: string): Promise<boolean> {
        const result = await sendRestRequest<
            { sessionId: string },
            { success: boolean }
        >(`${this.baseUrl}/refreshSession`, "POST", { sessionId });

        return result.success ? result.data.success : false;
    }

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: string): Promise<string[]> {
        const result = await sendRestRequest<{ userId: string }, string[]>(
            `${this.baseUrl}/getUserSessions`,
            "POST",
            { userId },
        );

        return result.success ? result.data : [];
    }

    async validateSession(
        sessionId: string,
        getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>,
    ): Promise<SessionData | null> {
        return this.getSession(sessionId, getUserIdFromSessionId);
    }
}

// Export singleton instance
export const sessionManagerClient = new SessionManagerClient();

// WebSocket Session Validation utilities
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
export async function validateWSSession(
    message: WSMessage,
    getUserIdFromSessionId?: (sessionId: string) => Promise<number | null>,
): Promise<WSValidationResult> {
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
        const sessionData = await sessionManagerClient.getSession(
            sessionId,
            getUserIdFromSessionId,
        );

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
    } catch (error) {
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
export function createWSErrorMessage(
    type: string,
    errorCode: string,
    message?: string,
) {
    return {
        type: "ERROR",
        data: {
            code: errorCode,
            message: message || errorCode,
        },
    };
}
