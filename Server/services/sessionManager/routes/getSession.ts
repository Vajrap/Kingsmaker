import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { type SessionData } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleGetSession({
    body,
}: {
    body: { sessionId: string };
}): Promise<ApiResponse<SessionData | null>> {
    try {
        const session = sessionManager.getSession(body.sessionId);

        if (!session) {
            return ok(null);
        }

        const data: SessionData = {
            sessionId: session.sessionId,
            userId: session.userId,
            userType: session.userType,
            username: session.username,
            connectedAt: session.connectedAt,
            lastSeen: session.lastSeen,
            presenceStatus: session.presenceStatus,
            waitingRoomId: session.waitingRoomId,
            gameRoomId: session.gameRoomId,
        };

        return ok(data);
    } catch (error) {
        console.error("Error getting session:", error);
        return errorRes("Failed to get session");
    }
}
