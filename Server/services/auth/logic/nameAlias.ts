import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { prisma } from "../shared/prisma/prisma";

export async function generateUniqueNameAlias(): Promise<string> {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        const nameAlias = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
            length: 3,
        });

        // Check if this name alias already exists
        const exists = await prisma.user.findUnique({ where: { nameAlias } });
        if (!exists) return nameAlias;
    }
    
    // If we can't generate a unique name after retries, append a timestamp
    const fallbackName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        length: 2,
    });
    return `${fallbackName}-${Date.now()}`;
}