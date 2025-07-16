import type { User } from "@kingsmaker/shared/prisma/generated";
import { type AuthInput, type ApiResponse, type LoginOutput, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import { resumeConnectionInSessionManager } from "../lib/sessionServiceClient";

export async function handleAutoLogin({ body }: { body: AuthInput }): Promise<ApiResponse<LoginOutput>> {
    try {
        // Find user by session token
        const user = await findUserBySessionToken(body.token);
        if (!user) {
            return errorRes("Invalid or expired session");
        }

        // Check if session is still valid
        if (user.sessionExpireAt && user.sessionExpireAt < new Date()) {
            return errorRes("Session has expired");
        }

        if (!user.sessionId) {
            return errorRes("No session ID found");
        }

        // Resume connection in SessionManager
        const sessionManagerResponse = await resumeConnectionInSessionManager(user.sessionId);
        if (!sessionManagerResponse) {
            console.warn("Failed to resume connection in SessionManager, proceeding with auto-login");
        }

        const data: LoginOutput = {
            nameAlias: user.nameAlias,
            username: user.username,
            userType: user.type === "registered" ? "registered" : user.type === "guest" ? "guest" : "admin",
            sessionId: user.sessionId!,
            presenceStatus: "INITIAL"
        };

        return ok<LoginOutput>(data);
    } catch (error) {
        console.error('Auto-login error:', error);
        return errorRes("Failed to auto-login");
    }
}

async function findUserBySessionToken(token: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: {
            sessionId: token
        }
    });
}
