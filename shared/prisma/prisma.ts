import { PrismaClient } from "./generated";

declare global {
    var prisma: PrismaClient;
}

// export const prisma = global.prisma || new PrismaClient();
export const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
