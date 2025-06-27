import { sessionManagerClient } from "../shared/session/sessionManagerClient";
import type { User } from "../shared/prisma/generated";

// Re-export the shared client methods for backward compatibility
export const addConnectionToSessionManager = (user: User) => 
    sessionManagerClient.addConnection(user);

export const resumeConnectionInSessionManager = (user: User) => 
    sessionManagerClient.resumeConnection(user);

export const removeConnectionFromSessionManager = (userId: number) => 
    sessionManagerClient.removeConnection(userId);
