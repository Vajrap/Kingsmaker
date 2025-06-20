import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleRemoveConnection({ body }: { body: { userId: number } }): Promise<ApiResponse<{ success: boolean }>> {
    try {
        sessionManager.disconnectClient(body.userId);
        return ok({ success: true });
    } catch (error) {
        console.error('Error removing connection:', error);
        return errorRes("Failed to remove connection");
    }
} 