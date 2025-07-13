import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";
import { SessionData } from "@kingsmaker/shared";

export async function handleGetAllSessions(): Promise<
    ApiResponse<SessionData[]>
> {
    try {
        const sessions = sessionManager.getAllSessions();
        return ok(sessions);
    } catch (error) {
        console.error("Error getting user sessions:", error);
        return errorRes("Failed to get user sessions");
    }
}
