import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { type SessionManagerUserLoginResponse } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleGetConnection({ body }: { body: { userId: number } }): Promise<ApiResponse<SessionManagerUserLoginResponse | null>> {
    try {
        const client = sessionManager.getClient(body.userId);
        
        if (!client) {
            return ok(null);
        }

        const data: SessionManagerUserLoginResponse = {
            sessionId: client.sessionId,
            userId: body.userId,
            userType: client.userType,
            username: client.username,
            connectedAt: client.connectedAt.toISOString(),
            lastSeen: client.lastSeen.toISOString(),
            presenceStatus: client.presenceStatus
        };

        return ok(data);
    } catch (error) {
        console.error('Error getting connection:', error);
        return errorRes("Failed to get connection");
    }
} 