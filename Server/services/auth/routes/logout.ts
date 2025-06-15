import { ok, type ApiResponse, type LogoutBody, type LogoutResponse } from "@shared/types/types.ts";
import { prisma } from "../lib/prisma";
import { SessionManager } from "../lib/session";

export async function handleLogout({ body }: { body: LogoutBody }): Promise<ApiResponse<LogoutResponse>> {
    // Remove session from database (existing behavior)
    await prisma.session.delete({
        where: {
            id: body.sessionToken
        }
    });

    // Remove session from Redis
    await SessionManager.deleteSession(body.sessionToken);

    return ok({message: "Logged out"})
}
