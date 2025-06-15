import { errorRes, ok, type ApiResponse, type AutoLoginBody, type LoginResponse } from "@shared/types/types";
import { prisma } from "../lib/prisma";
import { SessionManager } from "../lib/session";

export async function handleAutoLogin({ body }: { body: AutoLoginBody }): Promise<ApiResponse<LoginResponse>> {
    // First try to get session from Redis (faster)
    const sessionData = await SessionManager.getSession(body.sessionToken);
    
    if (sessionData) {
        // Refresh session activity
        await SessionManager.refreshSession(body.sessionToken);
        
        
        const data = {
            id: parseInt(sessionData.userId),
            nameAlias: sessionData.username, // Using username as nameAlias for now
            username: sessionData.username,
            userType: sessionData.userType,
            sessionToken: body.sessionToken
        };

        return ok(data);
    }

    // Fallback to database if not in Redis
    const session = await prisma.session.findUnique({
        where: { id: body.sessionToken },
    });

    if (!session || new Date() > session.expiresAt) {
        return errorRes("Session is expired.")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userID }
    });

    if (!user) {
        return errorRes("User not found");
    }

    const data = {
        id: user.id,
        username: user.username,
        nameAlias: user.nameAlias,
        email: user.email,
        userType: user.type,
        sessionToken: session.id
    }

    return ok(data)
}
