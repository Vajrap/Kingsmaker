import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";

export async function handleUpdatePresence({ body }: { body: { userId: number; presence: string } }): Promise<ApiResponse<{ success: boolean }>> {
    try {
        const validPresenceStates = ['INITIAL', 'IN_LOBBY', 'IN_WAITING_ROOM', 'IN_GAME', 'OFFLINE'];
        if (!validPresenceStates.includes(body.presence)) {
            return errorRes("Invalid presence status");
        }

        const presenceStatus = body.presence as 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';

        sessionManager.updatePresence(body.userId, presenceStatus);
        return ok({ success: true });
    } catch (error) {
        console.error('Error updating presence:', error);
        return errorRes("Failed to update presence");
    }
}
