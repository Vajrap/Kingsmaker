interface RequestContext {
    body: any;
}

export function jsonPost<T = any>(
    handler: (args: { body: T }) => any
) {
    return async (ctx: RequestContext) => {
        const raw = await ctx.body;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return handler({ body: parsed });
    };
}