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
export type LoginBody = {
    username: string;
    password: string;
};
export type LoginResponse = {
    sessionToken: string;
    userType: 'registered' | 'guest' | 'admin';
    username: string;
    nameAlias: string;
};
export type RegisterBody = {
    username: string;
    email: string;
    password: string;
};
export type RegisterResponse = {
    id: number;
    username: string;
    email: string;
    type: 'registered' | 'guest' | 'admin';
};
export type LogoutBody = {
    sessionToken: string;
};
export type LogoutResponse = {
    message: string;
};
export type AutoLoginBody = {
    sessionToken: string;
};
export {};
//# sourceMappingURL=types.d.ts.map