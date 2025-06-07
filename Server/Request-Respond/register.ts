import type { ClientMessage, ServerError, ServerMessage } from "./messages";
import { AuthService } from "../Entity/AuthService";
import db from "../Database/database";

export async function handleRegisterMessage(
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

  if (msg.head !== "register") {
    console.log(`Wrong message type in handleRegisterMessage ${msg.head}`);
    return error("Wrong heading");
  }

  const existingEmail = await db.user.findUnique({
    where: {
      email: msg.body.email,
    },
  });

  if (existingEmail) {
    return error("EMAIL_ALREADY_IN_USE");
  }

  const existingUsername = await db.user.findUnique({
    where: {
      username: msg.body.username,
    },
  });
  if (existingUsername) {
    return error("USERNAME_ALREADY_IN_USE");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(msg.body.email)) {
    return error("INVALID_EMAIL_FORMAT");
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(msg.body.username)) {
    return error("INVALID_USERNAME_FORMAT");
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/;
  if (!passwordRegex.test(msg.body.password)) {
    return error("INVALID_PASSWORD_FORMAT");
  }

  try {
    const user = await AuthService.register(msg.body.email, msg.body.username, msg.body.password);
    
    if (!user) {
      return error("Registration failed - email or username already exists");
    }

    sendConfirmationEmail(msg.body.email);

    const message: ServerMessage = {
      head: "register",
      body: {
        status: true,
      },
    };

    return message;
  } catch (err) {
    console.error("Registration error:", err);
    return error("Registration failed");
  }
}

function sendConfirmationEmail(email: string) {
  // Send confirmation email logic here
}
