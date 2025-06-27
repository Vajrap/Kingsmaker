import { sessionManagerClient } from "../shared/session/sessionManagerClient";
import { prisma } from "../shared/prisma/prisma";
import type { SessionData } from "../shared/types/types";

// Helper function to get userId from sessionId (required by shared client)
async function getUserIdFromSessionId(sessionId: string): Promise<number | null> {
  const user = await prisma.user.findFirst({ 
    where: { sessionId },
    select: { id: true }
  });
  return user?.id || null;
}

// Lobby-specific SessionManager functions
export async function getSession(sessionId: string): Promise<SessionData | null> {
  return sessionManagerClient.getSessionBySessionId(sessionId, getUserIdFromSessionId);
}

export async function updatePresenceInSessionManager(userId: number, presenceStatus: string): Promise<boolean> {
  return sessionManagerClient.updatePresence(userId, presenceStatus);
}

export async function removeSessionFromSessionManager(userId: number): Promise<boolean> {
  return sessionManagerClient.removeConnection(userId);
}
