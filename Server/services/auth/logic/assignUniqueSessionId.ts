import { prisma } from "@shared/prisma/prisma";

export async function generateUniqueSessionId(): Promise<string> {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        const sessionId = crypto.randomUUID();
        const exists = await prisma.user.findUnique({ where: { sessionId } });
        if (!exists) return sessionId;
    }
    throw new Error("Failed to generate unique session ID");
}

export async function assignUniqueSessionId(userId: number): Promise<{ sessionId: string, expiresAt: Date } | null> {
    const sessionId = await generateUniqueSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await prisma.user.update({
        where: { id: userId },
        data: { sessionId, sessionExpireAt: expiresAt }
    });
    return { sessionId, expiresAt };
}