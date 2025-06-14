// types/types.ts
function errorRes(message) {
  return {
    success: false,
    message
  };
}
function ok(data, message) {
  return {
    success: true,
    data,
    message
  };
}
export {
  ok,
  errorRes
};
