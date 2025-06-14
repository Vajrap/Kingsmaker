import { errorRes, ok, type ApiResponse, type LoginResponse } from "@shared/types/types";
import { prisma } from "../lib/prisma";
import { getNewNameAlias } from "logic/nameAlias";

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
    await prisma.session.create({
        data: {
            id: sessionToken,
            userID: guestUser.id,
            expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 day
            createdAt: now
        }
    });

    const data: LoginResponse = {
        id: guestUser.id,
        nameAlias: guestUser.nameAlias,
        username: guestUser.username,
        email: guestUser.email,
        type: "guest",
        sessionToken
    };

    return ok<LoginResponse>(data);
}
