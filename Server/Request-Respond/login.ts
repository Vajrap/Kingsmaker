import type { ClientMessage, ServerError, ServerMessage } from "./messages";
import { PrismaClient, type Session as PrismaSession } from '@prisma/client';
import { AuthService } from "../Entity/AuthService";

const prisma = new PrismaClient();

export async function handleLoginMessage(
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

  if (msg.head !== "login") {
    console.log(`Wrong message type in handleLoginMessage ${msg.head}`);
    return error("Wrong heading");
  }

  try {
    let user = await AuthService.login(msg.body.username, msg.body.password);

    if (!user) {
      return error("Invalid credentials");
    }

    // Check for existing valid sessions for this user
    const existingSession = await prisma.session.findFirst({
      where: { 
        userID: parseInt(user.id),
        expiresAt: { gt: new Date() } // Only get non-expired sessions
      },
      orderBy: { createdAt: 'desc' } // Get the most recent valid session
    });

    let session;
    if (existingSession) {
      console.log(`Reusing existing session for user ${user.username}: ${existingSession.id}`);
      session = existingSession;
    } else {
      console.log(`Creating new session for user ${user.username}`);
      
      // Clean up any expired sessions for this user
      await prisma.session.deleteMany({
        where: { 
          userID: parseInt(user.id),
          expiresAt: { lte: new Date() }
        }
      });

      // Create new session
      const newSession = await AuthService.createSession(parseInt(user.id));
      session = { id: newSession.id };
    }

    const message: ServerMessage = {
      head: "login",
      body: {
        sessionID: session.id,
        userType: user.type,
        username: user.username,
      },
    };

    return message;
  } catch (err) {
    console.error("Login error:", err);
    return error("Login failed");
  }
}
