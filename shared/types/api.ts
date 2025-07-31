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

export function errorRes(type: string, message: string): ErrorResponse {
    return {
        success: false,
        type,
        message,
    };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function ok<T>(data: T, message?: string): SuccessResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}
