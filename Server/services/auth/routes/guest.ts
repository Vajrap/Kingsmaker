import { errorRes, ok, type ApiResponse, type LoginResponse, type SessionData } from "@shared/types/types";
import { prisma } from "../lib/prisma";
import { getNewNameAlias } from "logic/nameAlias";
import { SessionManager } from "../lib/session";

export async function handleGuest(): Promise<ApiResponse<LoginResponse>> {
    const nameAlias = await getNewNameAlias();
    if (!nameAlias) {
        return errorRes("Failed to generate name alias");
    }
    
    const guestUser = await prisma.user.create({
        data: {
            username: `guest_${crypto.randomUUID().slice(0, 8)}`,
            nameAlias: nameAlias,
            email: `${crypto.randomUUID()}@guest.local`,
            password: "",
            isConfirmed: false,
            type: "guest"
        }
    });

    const now = new Date();
    const sessionToken = crypto.randomUUID();
    
    // Store session in database (existing behavior)
    await prisma.session.create({
        data: {
            id: sessionToken,
            userID: guestUser.id,
            expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 day
            createdAt: now
        }
    });

    // Store session in Redis for fast access by other services
    const sessionData: SessionData = {
        sessionToken: sessionToken,
        userId: guestUser.id.toString(),
        username: guestUser.username,
        userType: "guest",
        connectedAt: now.toISOString(),
        lastSeen: now.toISOString()
    };

    await SessionManager.createSession(sessionToken, sessionData);

    const data: LoginResponse = {
        sessionToken,
        userType: "guest",
        username: guestUser.username,
        nameAlias: guestUser.nameAlias,
    };

    return ok<LoginResponse>(data);
}
