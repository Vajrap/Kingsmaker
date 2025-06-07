import type { ClientMessage, ServerError, ServerMessage } from "./messages";
import { AuthService } from "../Entity/AuthService";

export async function handleAuthMessage(
  msg: ClientMessage,
): Promise<ServerMessage | ServerError> {
  function error(message: string): ServerError {
    return {
      head: "error",
      body: {
        message,
      },
    };
  }

  if (msg.head !== "auth") {
    console.log(`Wrong message type in handleAuthMessage ${msg.head}`);
    return error("Wrong heading");
  }

  console.log("handleAuthMessage", msg);
  try {
    const user = await AuthService.validateSession(msg.body.token);
    
    if (!user) {
      return error("Invalid or expired session");
    }
    
    const message: ServerMessage = {
      head: "auth-ok",
      body: {
        userID: user.id,
        userType: user.type,
        username: user.username,
      },
    };

    return message;
  } catch (err) {
    console.error("Auth validation error:", err);
    return error("Authentication failed");
  }
}

export async function handleLogoutMessage(
  msg: ClientMessage,
): Promise<ServerMessage | ServerError> {
  function error(message: string): ServerError {
    return {
      head: "error",
      body: {
        message,
      },
    };
  }

  if (msg.head !== "logout") {
    console.log(`Wrong message type in handleLogoutMessage ${msg.head}`);
    return error("Wrong heading");
  }

  try {
    await AuthService.logout(msg.body.sessionID);
    
    const message: ServerMessage = {
      head: "logout",
      body: {
        success: true,
      },
    };

    return message;
  } catch (err) {
    console.error("Logout error:", err);
    return error("Logout failed");
  }
} 