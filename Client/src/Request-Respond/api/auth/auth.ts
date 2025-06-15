import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";
import type { ApiResponse, AuthBody, LoginResponse } from "@shared/types/types";

export async function validateSessionRequest(): Promise<ApiResponse<LoginResponse>> {
  const token = sessionManager.getSessionToken();
  
  if (!token) {
    return {
      success: false,
      message: "No session token found"
    };
  }

  const body: AuthBody = {
    token,
  };

  const response = await sendRestRequest(
    "http://localhost:3000/api",
    "POST",
    body,
  ) as ApiResponse<LoginResponse>;

  if (response.success) {
    // Update session with fresh data
    const session = sessionManager.getSession();
    if (session) {
      session.userType = response.data.userType as 'registered' | 'guest';
      session.username = response.data.username;
      sessionManager.saveSession(session);
    }
  } else {
    // Invalid session, clear it
    sessionManager.clearSession();
  }

  return response;
}

export async function logoutRequest(): Promise<void> {
  await sessionManager.logout();
  // Redirect to login page
  window.location.href = '/';
} 