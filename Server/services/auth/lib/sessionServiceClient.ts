import { sessionManagerClient } from "@kingsmaker/shared/session/sessionManagerClient";
import type { User } from "@kingsmaker/shared/prisma/generated";

// Re-export the shared client methods for backward compatibility
export const addConnectionToSessionManager = (user: User) => 
    sessionManagerClient.createSession(user);

export const resumeConnectionInSessionManager = (sessionId: string) => 
    sessionManagerClient.refreshSession(sessionId);

export const removeConnectionFromSessionManager = (sessionId: string) => 
    sessionManagerClient.deleteSession(sessionId);
