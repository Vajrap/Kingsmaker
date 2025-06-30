type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

type ErrorResponse = {
    success: false;
    message: string;
};

export function errorRes(message: string): ErrorResponse {
    return {
        success: false,
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