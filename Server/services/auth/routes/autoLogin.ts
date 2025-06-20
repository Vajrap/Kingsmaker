import type { User } from "../shared/prisma/generated";
import { type AuthBody, type ApiResponse, type LoginResponse, errorRes, ok } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { resumeConnectionInSessionManager } from "../lib/sessionServiceClient";

export async function handleAutoLogin({ body }: { body: AuthBody }): Promise<ApiResponse<LoginResponse>> {
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

        // Resume connection in SessionManager
        const sessionManagerResponse = await resumeConnectionInSessionManager(user);
        if (!sessionManagerResponse) {
            console.warn("Failed to resume connection in SessionManager, proceeding with auto-login");
        }

        const data: LoginResponse = {
            nameAlias: user.nameAlias,
            username: user.username,
            userType: user.type === "registered" ? "registered" : user.type === "guest" ? "guest" : "admin",
            sessionId: user.sessionId!,
            presenceStatus: sessionManagerResponse?.presenceStatus || "INITIAL"
        };

        return ok<LoginResponse>(data);
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
