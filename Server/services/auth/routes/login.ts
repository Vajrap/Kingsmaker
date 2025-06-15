import { type ApiResponse, type LoginResponse, type LoginBody, type SessionData, errorRes, ok } from "@shared/types/types";
import { prisma } from "../lib/prisma";
import { SessionManager } from "../lib/session";

export async function handleLogin({ body }: {body: LoginBody}): Promise<ApiResponse<LoginResponse>> {
    const user = await findUser(body.username);
    if (!user) {
        return errorRes("User not found");
    };

    const validate = await validatePassword(user, body.password);
    if (!validate) {
        return errorRes("Invalid password");
    };

    const now = new Date();
    const sessionToken = crypto.randomUUID();

    // Store session in database (existing behavior)
    await prisma.session.create({
        data: {
            id: sessionToken,
            userID: user.id,
            expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
            createdAt: now
        }
    });

    // Store session in Redis for fast access by other services
    const sessionData: SessionData = {
        sessionToken: sessionToken,
        userId: user.id.toString(),
        username: user.username,
        userType: "registered",
        connectedAt: now.toISOString(),
        lastSeen: now.toISOString()
    };

    await SessionManager.createSession(sessionToken, sessionData);

    const data: LoginResponse = {
        nameAlias: user.nameAlias,
        username: user.username,
        userType: "registered",
        sessionToken
    };

    return ok<LoginResponse>(data)
}

async function findUser(username: string): Promise<any | null> {
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
