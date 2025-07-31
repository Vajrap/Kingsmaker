import { ApiResponse, errorRes } from "../types/api";

interface RequestContext {
    body: any;
}

export function restHandler<TInput, TOutput>(
    handler: (args: { body: TInput }) => Promise<ApiResponse<TOutput>>,
) {
    return async (ctx: RequestContext): Promise<ApiResponse<TOutput>> => {
        try {
            const raw = await ctx.body;
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

            return await handler({ body: parsed });
        } catch (e) {
            let error = { type: "Unknown", message: "Unknonw Error" };
            if (e instanceof Error) {
                error.type = e.name;
                error.message = e.message;
            }
            return errorRes(error.type, error.message);
        }
    };
}
