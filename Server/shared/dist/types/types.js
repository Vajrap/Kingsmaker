export function errorRes(message) {
    return {
        success: false,
        message
    };
}
export function ok(data, message) {
    return {
        success: true,
        data,
        message
    };
}
