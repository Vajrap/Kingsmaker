import { PrismaClient } from './generated/prisma/index.js';

// Export the Prisma client
export const prisma = new PrismaClient();

// Export types
export * from './generated/prisma/index.js';
