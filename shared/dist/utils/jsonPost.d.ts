import { ApiResponse } from "../types/api";
interface RequestContext {
    body: any;
}
export declare function jsonPost<TInput, TOutput>(handler: (args: {
    body: TInput;
}) => Promise<ApiResponse<TOutput>>): (ctx: RequestContext) => Promise<ApiResponse<TOutput>>;
export {};
//# sourceMappingURL=jsonPost.d.ts.map