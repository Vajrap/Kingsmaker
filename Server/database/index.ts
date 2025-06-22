// Database service - Pure database connection utilities
// Prisma client should be imported from @kingsmaker/shared instead

export const getDatabaseUrl = () => {
    return process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/kingsmaker';
};
