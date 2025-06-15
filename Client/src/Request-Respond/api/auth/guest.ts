import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";
import type { ApiResponse, LoginBody, LoginResponse } from "@shared/types/types";

export async function sendGuestLoginRequest(
    guestName: string
  ): Promise<ApiResponse<LoginResponse>> {
    const body: LoginBody = {
      username: guestName,
      password: "",
    };

    const response = await sendRestRequest(
      "http://localhost:3000/api",
      "POST",
      body,
    ) as ApiResponse<LoginResponse>;

    if (response.success) {
      // Successful guest login - save session and redirect
      sessionManager.saveSession({
        sessionID: response.data.sessionToken,
        userType: 'guest',
        username: response.data.username,
        loginTime: Date.now(),
      });

      // Redirect to lobby
      window.location.href = '/lobby';
    }

    return response;
  }
