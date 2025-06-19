import { type User } from "@shared/prisma/generated";

type ClientPresenceStatus = 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';

type ConnectedClient = {
    sessionId: string;
    userType: 'registered' | 'guest' | 'admin';
    username: string;
    presenceStatus: ClientPresenceStatus;
    lastSeen: Date;
    connectedAt: Date;
}

class SessionManager {
    private connectedClientsByUserId = new Map<number, ConnectedClient>();

    connectClient(user: User) {
        const now = new Date();
        this.connectedClientsByUserId.set(user.id, {
            sessionId: user.sessionId,
            userType: user.type,
            username: user.username,
            presenceStatus: 'OFFLINE',
            lastSeen: now,
            connectedAt: now,
        });
    }

    disconnectClient(userId: number) {
        this.connectedClientsByUserId.delete(userId);
    }

    updatePresence(userId: number, presence: ClientPresenceStatus) {
        const client = this.connectedClientsByUserId.get(userId);
        if (client) {
            client.presenceStatus = presence;
            client.lastSeen = new Date();
        }
    }

    getClient(userId: number): ConnectedClient | undefined {
        return this.connectedClientsByUserId.get(userId);
    }

    isConnected(userId: number): boolean {
        return this.connectedClientsByUserId.has(userId);
    }
}

export const sessionManager = new SessionManager();
