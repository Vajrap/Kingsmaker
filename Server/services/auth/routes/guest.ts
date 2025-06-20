import { type LoginResponse, type ApiResponse, errorRes, ok } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { generateUniqueNameAlias } from "../logic/nameAlias";
import { assignUniqueSessionId, generateUniqueSessionId } from "../logic/assignUniqueSessionId";
import { addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleGuestLogin(): Promise<ApiResponse<LoginResponse>> {
    try {
        const nameAlias = await generateUniqueNameAlias();

        const sessionId = await generateUniqueSessionId();
        
        const user = await createGuestUser(nameAlias, sessionId);
        
        if (!user) {
            return errorRes("Failed to create guest user");
        }

        const sessionManagerResponse = await addConnectionToSessionManager(user);
        
        const data: LoginResponse = {
            nameAlias: user.nameAlias,
            username: user.username,
            userType: "guest",
            sessionId: user.sessionId!,
            presenceStatus: sessionManagerResponse?.presenceStatus || "INITIAL"
        };

        return ok<LoginResponse>(data);
    } catch (error) {
        console.error('Guest login error:', error);
        return errorRes("Failed to process guest login");
    }
}

async function createGuestUser(nameAlias: string, sessionId: string) {
    return prisma.user.create({
        data: {
            username: `guest_${Date.now()}`,
            type: "guest",
            email: `guest_${Date.now()}@temp.com`,
            password: "", // Empty password for guest users
            nameAlias: nameAlias,
            isConfirmed: true, // Guests are automatically confirmed
            sessionId: sessionId,
            sessionExpireAt: new Date()
        }
    });
}
