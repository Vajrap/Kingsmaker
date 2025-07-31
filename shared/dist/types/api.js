export function errorRes(type, message) {
    return {
        success: false,
        type,
        message,
    };
}
export function ok(data, message) {
    return {
        success: true,
        data,
        message,
    };
}
