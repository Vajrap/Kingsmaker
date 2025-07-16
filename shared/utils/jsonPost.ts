import { ApiResponse } from "../types/api";

interface RequestContext {
    body: any;
}

export function jsonPost<TInput, TOutput>(
    handler: (args: { body: TInput }) => Promise<ApiResponse<TOutput>>,
) {
    return async (ctx: RequestContext) => {
        const raw = await ctx.body;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return handler({ body: parsed });
    };
}
