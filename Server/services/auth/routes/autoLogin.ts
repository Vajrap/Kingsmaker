import { errorRes, ok, type ApiResponse, type AutoLoginBody, type LoginResponse } from "@shared/types/types";
import { prisma } from "../lib/prisma";

export async function handleAutoLogin({ body }: { body: AutoLoginBody }): Promise<ApiResponse<LoginResponse>> {
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
        email: user.email,
        type: user.type,
        sessionToken: session.id
    }

    return ok(data)
}
