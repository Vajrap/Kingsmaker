
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";
import type { ApiResponse, LoginBody, LoginResponse } from "@shared/types/types";

export async function sendLoginRequest(
  username: string,
  password: string,
): Promise<ApiResponse<LoginResponse>> {
  const body: LoginBody = {
    username,
    password,
  };

  const response = await sendRestRequest(
    "http://localhost:7001/login",
    "POST",
    body,
  ) as ApiResponse<LoginResponse>;

  if (response.success) {
    // Successful login - save session and redirect
    sessionManager.saveSession({
      sessionID: response.data.sessionToken,
      userType: response.data.userType as 'registered' | 'guest',
      username: response.data.username,
      loginTime: Date.now(),
    });

    // Redirect to lobby
    window.location.href = '/lobby';
  }

  return response;
}
