import { type User } from "@kingsmaker/shared/prisma/generated";

type ClientPresenceStatus = 'INITIAL' | 'IN_LOBBY' | 'IN_WAITING_ROOM' | 'IN_GAME' | 'OFFLINE';
/*
Behavior
When a client logged in
1. the Client send data
    const clientData = {
        userId: number,
        sessionId: string,
        presenceStatus: string,
    };
2. Auth take the data, validate login, check from db for user where user.userId = clientData.userId and check if user.sessionExpired > Date.now() ?
    if true -> meaning it needed new sessionId; create new sessionId -> replace old sessionId with new sessionId
    if false -> keep using the same sessionId
    Auth send the clientData to SessionManager - await for the response
3. SessionManager 'check' if the client is already connected or presenceStatus === 'OFFLINE'
    if true -> add new client to connectedClientsByUserId map (or replace) with presenceStatus === 'INITIAL'
    if false -> meaning, that the user is somewhere in the IN_WAITING_ROOM or IN_GAME, so we need to push them into 'THAT ROOM'
    Session manager build response with new user data
    const user = {
        // only care for the presence
        presenceStatus: clientData.presenceStatus,
    };
    send back to auth -> client
4. client check the returning 'presenceStatus' -> then move to the respective page;
    - INITIAL -> lobby
    - IN_LOBBY -> lobby
    - IN_GAME -> game
    - IN_WAITING_ROOM -> waitingRoom
    - OFFLIN -> impossible

*/

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
            presenceStatus: 'INITIAL',
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
