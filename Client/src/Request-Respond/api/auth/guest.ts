import type { ServerMessage, ServerError, ClientMessage } from "@/Request-Respond/messages";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";

export async function sendGuestLoginRequest(
    guestName: string
  ): Promise<ServerMessage | ServerError> {
    const body: ClientMessage = {
      head: "guest",
      body: {
        name: guestName,
        sessionID: localStorage.getItem("kingsmaker-session.sessionID") || "",
      },
    };

    const response = await sendRestRequest(
      "http://localhost:3000/api",
      "POST",
      body,
    );

    if (response.head === "guest") {
      // Successful guest login - save session and redirect
      sessionManager.saveSession({
        sessionID: response.body.sessionID,
        userID: response.body.username, // For guests, we use username as ID
        userType: 'guest',
        username: response.body.username,
        loginTime: Date.now(),
      });

      // Redirect to lobby
      window.location.href = '/lobby';
    }

    return response;
  }
