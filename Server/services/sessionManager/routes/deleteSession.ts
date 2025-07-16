import {
    type ApiResponse,
    DeleteSessionOutput,
    errorRes,
    ok,
} from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleDeleteSession({
    body,
}: {
    body: { sessionId: string };
}): Promise<ApiResponse<DeleteSessionOutput>> {
    try {
        const success = sessionManager.deleteSession(body.sessionId);
        return ok({ success });
    } catch (error) {
        console.error("Error deleting session:", error);
        return errorRes("Failed to delete session");
    }
}
