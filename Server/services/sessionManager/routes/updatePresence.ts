import { type ApiResponse, errorRes, ok } from "@shared/types/types";
import { sessionManager } from "entity/sessionManager";

export async function handleUpdatePresence({ body }: { body: { userId: number; presence: string } }): Promise<ApiResponse<{ success: boolean }>> {
    try {
        // Validate presence status
        const validPresenceStates = ['IN_LOBBY', 'IN_WAITING_ROOM', 'IN_GAME', 'OFFLINE'];
        if (!validPresenceStates.includes(body.presence)) {
            return errorRes("Invalid presence status");
        }

        // Convert string to enum (since we can't easily pass enums over HTTP)
        const presenceStatus = body.presence as 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
        
        sessionManager.updatePresence(body.userId, presenceStatus);
        return ok({ success: true });
    } catch (error) {
        console.error('Error updating presence:', error);
        return errorRes("Failed to update presence");
    }
} 