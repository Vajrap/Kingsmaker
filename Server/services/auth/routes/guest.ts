import { type LoginOutput, type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import { generateUniqueNameAlias } from "../logic/nameAlias";
import { generateUniqueSessionId } from "../logic/assignUniqueSessionId";
import { addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleGuestLogin(): Promise<ApiResponse<LoginOutput>> {
    try {
        const nameAlias = await generateUniqueNameAlias();

        const sessionId = await generateUniqueSessionId();
        
        const user = await createGuestUser(nameAlias, sessionId);
        
        if (!user) {
            return errorRes("Failed to create guest user");
        }

        const sessionManagerResponse = await addConnectionToSessionManager(user);
        
        const data: LoginOutput = {
            nameAlias: user.nameAlias,
            username: user.username,
            userType: "guest",
            sessionId: user.sessionId!,
            presenceStatus: "INITIAL"
        };

        return ok<LoginOutput>(data);
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
