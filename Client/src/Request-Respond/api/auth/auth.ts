import type { ClientMessage, ServerError, ServerMessage } from "@/Request-Respond/messages";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";

export async function validateSessionRequest(): Promise<ServerMessage | ServerError> {
  const token = sessionManager.getSessionToken();
  
  if (!token) {
    return {
      head: "error",
      body: { message: "No session token found" }
    };
  }

  const body: ClientMessage = {
    head: "auth",
    body: { token },
  };

  const response = await sendRestRequest(
    "http://localhost:3000/api/auth",
    "POST",
    body,
  );

  if (response.head === "auth-ok") {
    // Update session with fresh data
    const session = sessionManager.getSession();
    if (session) {
      session.userID = response.body.userID;
      session.userType = response.body.userType as 'registered' | 'guest';
      session.username = response.body.username;
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