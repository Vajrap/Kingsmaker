import type { User } from "@shared/prisma/generated";
import { prisma } from "@shared/prisma/prisma";
import { type ApiResponse, errorRes, ok } from "@shared/types/types";
import { sessionManager } from "entity/sessionManager";
import { type SessionManagerResponse } from "@shared/types/types";

export async function handleAddConnection({ body }: { body: User }): Promise<ApiResponse<SessionManagerResponse>> {
    const dbUser = await prisma.user.findUnique({ where: { id: body.id } });
    if (!dbUser) {
        return errorRes("User not found")
    }

    const validateSession = validateUserSessions(body.sessionId, dbUser.sessionId);
    if (!validateSession) {
        return errorRes("Invalid session");
    }

    sessionManager.connectClient(body);

    const data: SessionManagerResponse = {
        sessionId: body.sessionId,
        userId: body.id,
        userType: body.type,
        username: body.username,
        connectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
    };

    return ok(data);
}

function validateUserSessions(incoming: string, existing: string) {
    return existing === incoming;
}
