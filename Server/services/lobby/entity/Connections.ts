import { SessionData } from "@kingsmaker/shared/types/session";
import { sessionManagerClient } from "@shared/session/sessionManagerClient";
import { ElysiaWS } from "elysia/dist/ws";

export class Connection {
    ws: ElysiaWS;
    session: SessionData;
    constructor(ws: ElysiaWS, session: SessionData) {
        this.ws = ws;
        this.session = session;

        const a = session.waitingRoomId;
    }
}

export class Connections {
    connections: Map<number, Connection>;

    constructor() {
        this.connections = new Map<number, Connection>();
    }

    removeConnection(id: number) {
        this.connections.delete(id);
    }

    async addConnection(ws: ElysiaWS, session: SessionData) {
        const existingSession = await sessionManagerClient.validateSession(
            session.sessionId,
        );
        if (existingSession) {
            // if existSession = session of the id already existed
        } else {
            // if no existingSession == new session
            const connection = new Connection(ws, session);
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            sessionManagerClient.createSession(user);
            this.connections.set(user.id, connection);
        }
        const connection = new Connection(ws, session);
        this.connections.set(session.userId, connection);
    }

    private getConnectionByUserId(id: number): Connection | null {
        const connection = this.connections.get(id);
        if (connection === undefined) return null;
        return connection;
    }

    getConnectionBySessionId(sessionId: string): Connection | null {
        for (const connection of this.connections.values()) {
            if (connection.session.sessionId === sessionId) {
                return connection;
            }
        }
        return null;
    }

    private validateSession(id: string): boolean {
        const connection = this.getConnectionBySessionId(id);
        return (
            connection !== undefined &&
            connection !== null &&
            connection.session !== undefined
        );
    }

    getAllConnections(): Connection[] {
        return Array.from(this.connections.values());
    }
}

export const connections = new Connections();
