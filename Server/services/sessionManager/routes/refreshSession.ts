import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleRefreshSession({
    body,
}: {
    body: { sessionId: string };
}): Promise<ApiResponse<{ success: boolean }>> {
    try {
        const success = sessionManager.refreshSession(body.sessionId);
        return ok({ success });
    } catch (error) {
        console.error("Error refreshing session:", error);
        return errorRes("Failed to refresh session");
    }
} 