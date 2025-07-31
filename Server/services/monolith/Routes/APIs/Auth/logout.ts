import {
    errorRes,
    ok,
    type ApiResponse,
    prisma,
    type LogoutInput,
    type LogoutOutput,
} from "@kingsmaker/shared";
import { clientManager } from "../../../Class/ClientManager/ClientManager";

export async function handleLogout({
    body,
}: {
    body: LogoutInput;
}): Promise<ApiResponse<LogoutOutput>> {
    const user = await prisma.user.update({
        where: { sessionId: body.sessionToken },
        data: {
            sessionId: null,
            sessionExpireAt: new Date(),
        },
    });

    if (!user) return errorRes("NOT_FOUND", "Session not found");

    clientManager.removeSession(user.id);

    return ok<LogoutOutput>({ message: "Logged out successfully" });
}
