export function jsonPost(handler) {
    return async (ctx) => {
        const raw = await ctx.body;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return handler({ body: parsed });
    };
}
