import type { ElysiaWS } from "elysia/ws";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import type { LobbyClientMessage } from "@kingsmaker/shared";
import { ALREADY_LOGIN, Player, prisma } from "@kingsmaker/shared";
import { UserType } from "@kingsmaker/shared/prisma/generated/client";

export async function handleLobbyConnect(
    ws: ElysiaWS,
    data: LobbyClientMessage,
) {
    if (data.type != "JOIN") {
        ws.send({ type: "ERROR", error: "INVALID_TYPE" });
        return;
    }

    const { userId, sessionId } = data.data;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.sessionId !== sessionId) {
        ws.send({ type: "ERROR", error: "SESSION_INVALID" });
        return;
    }

    if (clientManager.userAlreadyConnected(userId)) {
        ws.send({
            type:
                user.type === UserType.registered
                    ? ALREADY_LOGIN.REGIST
                    : user.type === UserType.guest
                      ? ALREADY_LOGIN.GUEST
                      : "YOU_ARE_AN_ADMIN_WE_DON'T_ALLOW_ADMIN_YET",
        });
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { sessionExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    const player = new Player(user);
    clientManager.addSession(user.id, user.sessionId, ws, player);

    ws.send({
        type: "CONNECTED",
        message: "Connected to lobby",
    });
}
