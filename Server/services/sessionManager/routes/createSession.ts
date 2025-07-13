import { prisma } from "@kingsmaker/shared/prisma/prisma";
import {
    type ApiResponse,
    CreateSessionInput,
    errorRes,
    ok,
} from "@kingsmaker/shared/types/types";
import { sessionManager } from "../entity/sessionManager";
import { type SessionManagerUserLoginResponse } from "@kingsmaker/shared/types/types";

export async function handleAddConnection({
    body,
}: {
    body: CreateSessionInput;
}): Promise<ApiResponse<SessionManagerUserLoginResponse>> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: body.id } });
        if (!dbUser) {
            return errorRes("User not found");
        }

        const validateSession = validateUserSessions(
            body.sessionId,
            dbUser.sessionId,
        );
        if (!validateSession) {
            return errorRes("Invalid session");
        }

        const sessionInfo = sessionManager.createSession(dbUser);

        const data: SessionManagerUserLoginResponse = {
            sessionId: sessionInfo.sessionId,
            userId: sessionInfo.userId,
            userType: sessionInfo.userType,
            username: sessionInfo.username,
            connectedAt: sessionInfo.connectedAt,
            lastSeen: sessionInfo.lastSeen,
            presenceStatus: sessionInfo.presenceStatus,
        };

        return ok(data);
    } catch (error) {
        console.error("Error adding connection:", error);
        return errorRes("Failed to add connection");
    }
}

function validateUserSessions(incoming: string, existing: string) {
    return existing === incoming;
}
