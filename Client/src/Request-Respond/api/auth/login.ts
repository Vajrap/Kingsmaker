import type { ServerError, ServerMessage} from "@/Request-Respond/messages";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";

export async function sendLoginRequest(
  username: string,
  password: string,
): Promise<ServerMessage | ServerError> {
  const body: {
    username: string;
    password: string;
  } = {
    username,
    password,
  };

  const response = await sendRestRequest(
    "http://localhost:7001/login",
    "POST",
    body,
  );

  if (response.head === "login") {
    // Successful login - save session and redirect
    sessionManager.saveSession({
      sessionID: response.body.sessionID,
      userID: response.body.userType === 'guest' ? response.body.username : response.body.username, // For guests, we use username as ID
      userType: response.body.userType as 'registered' | 'guest',
      username: response.body.username,
      loginTime: Date.now(),
    });

    // Redirect to lobby
    window.location.href = '/lobby';
  }

  return response;
}
