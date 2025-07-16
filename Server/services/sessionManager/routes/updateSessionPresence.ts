import {
    type ApiResponse,
    ClientPresenceStatus,
    errorRes,
    ok,
    UpdatePresenceInput,
    UpdatePresenceOutput,
} from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleUpdatePresence({
    body,
}: {
    body: UpdatePresenceInput;
}): Promise<ApiResponse<UpdatePresenceOutput>> {
    try {
        const success = sessionManager.updateSessionPresence(
            body.sessionId,
            body.presenceStatus,
        );
        return ok({ success });
    } catch (error) {
        console.error("Error updating presence:", error);
        return errorRes("Failed to update presence");
    }
}
