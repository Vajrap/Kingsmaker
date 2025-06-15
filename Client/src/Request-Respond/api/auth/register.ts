import type { ApiResponse, RegisterBody, RegisterResponse } from "@shared/types/types";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";

export async function sendRegisterRequest(
  email: string,
  username: string,
  password: string,
): Promise<ApiResponse<RegisterResponse>> {
  const body: RegisterBody = {
      email,
      username,
      password,
  };

  const response = await sendRestRequest(
    "http://localhost:3000/api",
    "POST",
    body,
  );

  return response as ApiResponse<RegisterResponse>;
}
