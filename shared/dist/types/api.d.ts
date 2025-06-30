type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};
type ErrorResponse = {
    success: false;
    message: string;
};
export declare function errorRes(message: string): ErrorResponse;
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export declare function ok<T>(data: T, message?: string): SuccessResponse<T>;
export {};
//# sourceMappingURL=api.d.ts.map