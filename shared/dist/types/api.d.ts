export type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};
type ErrorResponse = {
    success: false;
    type: string;
    message: string;
};
export declare function errorRes(type: string, message: string): ErrorResponse;
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export declare function ok<T>(data: T, message?: string): SuccessResponse<T>;
export {};
//# sourceMappingURL=api.d.ts.map