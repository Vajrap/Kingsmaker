import type { ClientMessage, ServerError, ServerMessage } from "./messages";
import { AuthService } from "../Entity/AuthService";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function handleGuestMessage(
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

  if (msg.head !== "guest") {
    console.log(`Wrong message type in handleGuestMessage ${msg.head}`);
    return error("Wrong heading");
  }

  try {
    // Validate guest name
    if (!msg.body.name || msg.body.name.length < 3) {
      return error("Guest name must be at least 3 characters");
    }

    // Create or get guest user
    const user = await AuthService.guestLogin(msg.body.name);
    
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
      console.log(`Reusing existing session for guest ${user.username}: ${existingSession.id}`);
      session = existingSession;
    } else {
      console.log(`Creating new session for guest ${user.username}`);
      
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
      head: "guest",
      body: {
        sessionID: session.id,
        username: user.username,
      },
    };

    return message;
  } catch (err) {
    console.error("Guest login error:", err);
    return error("Guest login failed");
  }
} 