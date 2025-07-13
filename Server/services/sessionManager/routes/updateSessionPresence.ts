import {
    type ApiResponse,
    ClientPresenceStatus,
    errorRes,
    ok,
} from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleUpdatePresence({
    body,
}: {
    body: { sessionId: string; presence: ClientPresenceStatus };
}): Promise<ApiResponse<{ success: boolean }>> {
    try {
        const success = sessionManager.updateSessionPresence(
            body.sessionId,
            body.presence,
        );
        return ok({ success });
    } catch (error) {
        console.error("Error updating presence:", error);
        return errorRes("Failed to update presence");
    }
}
