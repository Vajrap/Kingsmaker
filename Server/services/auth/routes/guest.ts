import type { LoginResponse, ApiResponse } from "@kingsmaker/shared/types/types";
import { errorRes, ok } from "@kingsmaker/shared/types/types";
import { getNewNameAlias } from "logic/nameAlias";
import { prisma } from "@shared/prisma/prisma";
import { generateUniqueSessionId } from "logic/assignUniqueSessionId";
import { addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleGuest(): Promise<ApiResponse<LoginResponse>> {
    const nameAlias = await getNewNameAlias();
    if (!nameAlias) {
        return errorRes("Failed to generate name alias");
    }

    const sessionId = await generateUniqueSessionId();

    const guestUser = await prisma.user.create({
        data: {
            username: `guest_${crypto.randomUUID().slice(0, 8)}`,
            nameAlias: nameAlias,
            email: `${crypto.randomUUID()}@guest.local`,
            password: "",
            isConfirmed: false,
            type: "guest",
            sessionId,
            sessionExpireAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    });

    // Add connection to sessionManager
    const sessionManagerResponse = await addConnectionToSessionManager(guestUser);
    if (!sessionManagerResponse) {
        // SessionManager connection failed, but don't fail guest login entirely
        console.warn("Failed to add guest connection to SessionManager, proceeding with guest login");
    }

    const data: LoginResponse = {
        sessionId: sessionId,
        userType: "guest",
        username: guestUser.username,
        nameAlias: guestUser.nameAlias,
    };

    return ok<LoginResponse>(data);
}
