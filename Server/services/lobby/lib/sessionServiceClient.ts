import { sessionManagerClient } from "@kingsmaker/shared/session/sessionManagerClient";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import type { SessionData } from "@kingsmaker/shared/types/types";

async function getUserIdFromSessionId(sessionId: string): Promise<number | null> {
  const user = await prisma.user.findFirst({ 
    where: { sessionId },
    select: { id: true }
  });
  return user?.id || null;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  return sessionManagerClient.getSession(sessionId, getUserIdFromSessionId);
}

export async function updatePresenceInSessionManager(userId: number, presenceStatus: string): Promise<boolean> {
  return sessionManagerClient.updatePresence(userId, presenceStatus);
}

export async function removeSessionFromSessionManager(userId: number): Promise<boolean> {
  return sessionManagerClient.removeConnection(userId);
}
