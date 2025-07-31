import { errorRes, ok, type ApiResponse } from "@kingsmaker/shared";
import type { AuthInput, LoginOutput } from "@kingsmaker/shared/types/auth";
import { clientManager } from "../../../Class/ClientManager/ClientManager";
import { handleAutoLogin } from "./autoLogin";

export async function handleGuestForce({
    body,
}: {
    body: AuthInput;
}): Promise<ApiResponse<LoginOutput>> {
    const userId = clientManager.getUserIdBySessionId(body.token);
    if (!userId) {
        return handleAutoLogin({ body });
    }

    const existing = clientManager.getConnection(userId);
    if (!existing) {
        return handleAutoLogin({ body });
    }

    const player = existing.player;
    existing.ws.close();

    clientManager.removeSession(userId);

    return ok<LoginOutput>({ player });
}
