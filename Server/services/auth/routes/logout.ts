import { ok, type ApiResponse, type LogoutBody, type LogoutResponse } from "@shared/types/types.ts";
import { prisma } from "../lib/prisma";

export async function handleLogout({ body }: { body: LogoutBody }): Promise<ApiResponse<LogoutResponse>> {
    await prisma.session.delete({
        where: {
            id: body.sessionToken
        }
    });

    return ok({message: "Logged out"})
}
