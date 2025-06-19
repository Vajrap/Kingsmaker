import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import { prisma } from "@shared/prisma/prisma";

export async function getNewNameAlias(): Promise<string | null> {
    for (let i = 0; i < 10; i++) {
        const nameAlias = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '',
            style: 'capital'
        }) + Math.floor(Math.random() * 1000).toString();
        if (await isNameAliasAvailable(nameAlias)) {
            return nameAlias;
        }
    }
    return null;
}

async function isNameAliasAvailable(nameAlias: string): Promise<boolean> {
    const existedNameAlias = await prisma.user.findFirst({
        where: {
            nameAlias: nameAlias
        }
    })
    return !existedNameAlias;
}