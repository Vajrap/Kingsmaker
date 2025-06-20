import type { User } from "@kingsmaker/shared/prisma/generated";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import { type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";
import { type SessionManagerUserLoginResponse } from "@kingsmaker/shared/types/types";

export async function handleAddConnection({ body }: { body: User }): Promise<ApiResponse<SessionManagerUserLoginResponse>> {
    const dbUser = await prisma.user.findUnique({ where: { id: body.id } });
    if (!dbUser) {
        return errorRes("User not found")
    }

    const validateSession = validateUserSessions(body.sessionId, dbUser.sessionId);
    if (!validateSession) {
        return errorRes("Invalid session");
    }

    sessionManager.connectClient(body);

    const data: SessionManagerUserLoginResponse = {
        sessionId: body.sessionId,
        userId: body.id,
        userType: body.type,
        username: body.username,
        connectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        presenceStatus: 'INITIAL'
    };

    return ok(data);
}

function validateUserSessions(incoming: string, existing: string) {
    return existing === incoming;
}
