import {
    prisma,
    errorRes,
    ok,
    type ApiResponse,
    type User,
} from "@kingsmaker/shared";
import type { LoginInput, LoginOutput } from "@kingsmaker/shared/types/auth";
import { Player } from "@kingsmaker/shared/types/player";
import { clientManager } from "../../../Class/ClientManager/ClientManager";

const loginLocks = new Map<number, boolean>();

function acquireLoginLock(userId: number): boolean {
    if (loginLocks.get(userId)) return false;
    loginLocks.set(userId, true);
    return true;
}

function releaseLoginLock(userId: number) {
    loginLocks.delete(userId);
}

export async function handleLogin({
    body,
}: {
    body: LoginInput;
}): Promise<ApiResponse<LoginOutput>> {
    const user = await findUser(body.username);
    if (!user) return errorRes("NOT_FOUND", "User not found");

    if (!acquireLoginLock(user.id)) {
        return errorRes(
            "LOGIN_CONFLICT",
            "Atoher login attemp of this id is in process",
        );
    }
    try {
        const validate = await validatePassword(user, body.password);
        if (!validate)
            return errorRes("INVALID_CREDENTIAL", "Invalid password");

        if (
            !user.sessionExpireAt ||
            user.sessionExpireAt < new Date() ||
            !user.sessionId
        ) {
            const newSession = await assignUniqueSessionId(user.id);
            if (!newSession)
                return errorRes("ERROR", "Failed to update user session");
            user.sessionId = newSession.sessionId;
            user.sessionExpireAt = newSession.expiresAt;
        }

        const existing = clientManager.connection.get(user.id);
        if (existing) {
            existing.ws.close();
            clientManager.connection.delete(user.id);
        }

        const player = new Player(user);
        return ok<LoginOutput>({ player });
    } finally {
        releaseLoginLock(user.id);
    }
}

async function findUser(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username: username } });
}

async function validatePassword(
    user: User,
    hashedPassword: string,
): Promise<boolean> {
    const result = await Bun.password.verify(hashedPassword, user.password);
    return result;
}

async function generateUniqueSessionId(): Promise<string> {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

async function assignUniqueSessionId(
    userId: number,
): Promise<{ sessionId: string; expiresAt: Date } | null> {
    try {
        const sessionId = await generateUniqueSessionId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.user.update({
            where: { id: userId },
            data: {
                sessionId,
                sessionExpireAt: expiresAt,
            },
        });

        return { sessionId, expiresAt };
    } catch (error) {
        console.error("Error assigning unique session ID:", error);
        return null;
    }
}
