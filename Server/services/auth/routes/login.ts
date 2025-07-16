import type { User } from "@kingsmaker/shared/prisma/generated";
import { type LoginInput, type ApiResponse, type LoginOutput, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import { assignUniqueSessionId } from "../logic/assignUniqueSessionId";
import { addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleLogin({ body }: {body: LoginInput}): Promise<ApiResponse<LoginOutput>> {
    console.log("handleLogin", body);
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

    await addConnectionToSessionManager(user);

    const data: LoginOutput = {
        sessionId: user.sessionId || "",
        userType: user.type,
        username: user.username,
        nameAlias: user.nameAlias,
        presenceStatus: "INITIAL"
    };

    return ok<LoginOutput>(data)
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
