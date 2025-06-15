import type { ApiResponse, LoginResponse } from "@shared/types/types";

export async function sendForgotRequest(
  email: string,
): Promise<ApiResponse<LoginResponse>> {
  console.log(`Forgot request received for email: ${email}, but not implemented yet.`);
  return {
    success: false,
    message: "Not implemented",
  };
}