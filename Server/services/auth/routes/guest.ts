import { ok, type ApiResponse, type LoginResponse } from "@shared/types/types";
import { prisma } from "../lib/prisma";

export async function handleGuest(): Promise<ApiResponse<LoginResponse>> {
    const guestUser = await prisma.user.create({
        data: {
            username: `guest_${crypto.randomUUID().slice(0, 8)}`,
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
        username: guestUser.username,
        email: guestUser.email,
        type: "guest",
        sessionToken
    };

    return ok<LoginResponse>(data);
}
