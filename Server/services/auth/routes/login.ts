import type { User } from "../shared/prisma/generated";
import { type LoginBody, type ApiResponse, type LoginResponse, errorRes, ok } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { assignUniqueSessionId } from "../logic/assignUniqueSessionId";
import { addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleLogin({ body }: {body: LoginBody}): Promise<ApiResponse<LoginResponse>> {
    const user = await findUser(body.username);
    if (!user) {
        console.warn(`Login failed: User '${body.username}' not found`);
        return errorRes("User not found");
    };

    const validate = await validatePassword(user, body.password);
    if (!validate) {
        console.warn(`Login failed: Invalid password for user '${body.username}'`);
        return errorRes("Invalid password");
    };

    if (!user.sessionExpireAt || user.sessionExpireAt < new Date() || !user.sessionId) {
        const result = await assignUniqueSessionId(user.id);
        if (!result) {
            return errorRes("Failed to update user session");
        }
        user.sessionId = result.sessionId;
        user.sessionExpireAt = result.expiresAt;
    }

    const sessionManagerResponse = await addConnectionToSessionManager(user);
    if (!sessionManagerResponse) {
        console.warn("Failed to add connection to SessionManager, proceeding with login");
    } else {
        user.sessionId = sessionManagerResponse.sessionId;
    }

    const data: LoginResponse = {
        sessionId: user.sessionId || "",
        userType: user.type,
        username: user.username,
        nameAlias: user.nameAlias,
        presenceStatus: sessionManagerResponse?.presenceStatus || "INITIAL"
    };

    return ok<LoginResponse>(data)
}

async function findUser(username: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: {
            username: username
        }
    });
}

async function validatePassword(user: any, password: string): Promise<boolean> {
    let result = await Bun.password.verify(password, user.password);
    return result;
}
