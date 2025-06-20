import { prisma } from "../shared/prisma/prisma";

export async function generateUniqueSessionId(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export async function assignUniqueSessionId(userId: number): Promise<{sessionId: string, expiresAt: Date} | null> {
    try {
        const sessionId = await generateUniqueSessionId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.user.update({
            where: { id: userId },
            data: {
                sessionId,
                sessionExpireAt: expiresAt
            }
        });

        return { sessionId, expiresAt };
    } catch (error) {
        console.error('Error assigning unique session ID:', error);
        return null;
    }
}