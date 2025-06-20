import { PrismaClient } from './generated';
// export const prisma = global.prisma || new PrismaClient();
export const prisma = new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    global.prisma = prisma;
