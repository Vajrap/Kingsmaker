import {
    ok,
    type ApiResponse,
    prisma,
    Player,
    type LoginOutput,
} from "@kingsmaker/shared";
import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
} from "unique-names-generator";

export async function handleGuestLogin(): Promise<ApiResponse<LoginOutput>> {
    const nameAlias = await generateUniqueNameAlias();
    const sessionId = await generateUniqueSessionId();
    const user = await createGuestUser(nameAlias, sessionId);
    const player = new Player(user);
    return ok<LoginOutput>({ player });
}

export async function generateUniqueNameAlias(): Promise<string> {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        const nameAlias = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: "-",
            length: 3,
        });

        // Check if this name alias already exists
        const exists = await prisma.user.findUnique({ where: { nameAlias } });
        if (!exists) return nameAlias;
    }

    // If we can't generate a unique name after retries, append a timestamp
    const fallbackName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: "-",
        length: 2,
    });
    return `${fallbackName}-${Date.now()}`;
}

export async function generateUniqueSessionId(): Promise<string> {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

export async function assignUniqueSessionId(
    userId: number,
): Promise<{ sessionId: string; expiresAt: Date } | null> {
    try {
        const sessionId = await generateUniqueSessionId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.user.update({
            where: { id: userId },
            data: {
                sessionId,
                sessionExpireAt: expiresAt,
            },
        });

        return { sessionId, expiresAt };
    } catch (error) {
        console.error("Error assigning unique session ID:", error);
        return null;
    }
}

async function createGuestUser(nameAlias: string, sessionId: string) {
    return prisma.user.create({
        data: {
            username: `guest_${Date.now()}`,
            type: "guest",
            email: `guest_${Date.now()}@temp.com`,
            password: "", // Empty password for guest users
            nameAlias: nameAlias,
            isConfirmed: true, // Guests are automatically confirmed
            sessionId: sessionId,
            sessionExpireAt: new Date(),
            portrait: "",
            skin: "",
            might: 2,
            intelligence: 2,
            dexterity: 2,
        },
    });
}
