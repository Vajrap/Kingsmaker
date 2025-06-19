import { type User } from "@shared/prisma/generated";
import { type LoginBody, type ApiResponse, type LoginResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@shared/prisma/prisma";
import { assignUniqueSessionId } from "logic/assignUniqueSessionId";
import { addConnectionToSessionManager, checkConnectionInSessionManager } from "../lib/sessionServiceClient";

export async function handleLogin({ body }: {body: LoginBody}): Promise<ApiResponse<LoginResponse>> {
    const user = await findUser(body.username);
    if (!user) {
        return errorRes("User not found");
    };

    const validate = await validatePassword(user, body.password);
    if (!validate) {
        return errorRes("Invalid password");
    };

    if (user.sessionExpireAt < new Date() || !user.sessionId) {
        const result = await assignUniqueSessionId(user.id);
        if (!result) {
            return errorRes("Failed to update user session");
        }
        user.sessionId = result.sessionId;
        user.sessionExpireAt = result.expiresAt;
    }

    // Check if user is already connected (one user per machine enforcement)
    const existingConnection = await checkConnectionInSessionManager(user.id);
    if (existingConnection) {
        // User already logged in, return existing session info
        const data: LoginResponse = {
            nameAlias: user.nameAlias,
            username: user.username,
            userType: "registered",
            sessionId: user.sessionId
        };
        return ok<LoginResponse>(data);
    }

    // Add connection to sessionManager
    const sessionManagerResponse = await addConnectionToSessionManager(user);
    if (!sessionManagerResponse) {
        // SessionManager connection failed, but don't fail login entirely
        console.warn("Failed to add connection to SessionManager, proceeding with login");
    }

    const data: LoginResponse = {
        nameAlias: user.nameAlias,
        username: user.username,
        userType: "registered",
        sessionId: user.sessionId
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
