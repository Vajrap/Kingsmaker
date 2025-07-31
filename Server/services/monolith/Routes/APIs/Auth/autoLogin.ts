import {
    errorRes,
    ok,
    type ApiResponse,
    Player,
    type LoginOutput,
    prisma,
    type User,
    type AuthInput,
} from "@kingsmaker/shared";
import { clientManager } from "../../../Class/ClientManager/ClientManager";

export async function handleAutoLogin({
    body,
}: {
    body: AuthInput;
}): Promise<ApiResponse<LoginOutput>> {
    const user = await findUserBySessionToken(body.token);
    if (!user) return errorRes("ERROR", "Invalid session");
    if (user.sessionExpireAt && user.sessionExpireAt < new Date()) {
        return errorRes("SESSION_EXPIRED", "Session has Expired");
    }
    if (!user.sessionId)
        return errorRes("SESSION_NOT_FOUND", "Session Id not found");

    if (clientManager.userAlreadyConnected(user.id))
        return errorRes("ALREADY_CONNECT", "Already Connect");

    // Extend sessionExpireAt to 30 days
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const updatedUser: User = await prisma.user.update({
        where: { id: user.id },
        data: { sessionExpireAt: newExpiry },
    });

    const player = new Player(updatedUser);

    return ok<LoginOutput>({ player });
}

async function findUserBySessionToken(token: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: {
            sessionId: token,
        },
    });
}
