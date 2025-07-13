import { SessionData } from "@kingsmaker/shared/types/session";
import { ElysiaWS } from "elysia/dist/ws";

export class Connection {
    ws: ElysiaWS;
    session: SessionData;
    constructor(ws: ElysiaWS, session: SessionData) {
        this.ws = ws;
        this.session = session;
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

    addConnection(ws: ElysiaWS, session: SessionData) {
        const connection = new Connection(ws, session);

        this.connections.set(session.userId, connection);
    }

    private getConnectionByUserId(id: number): Connection | null {
        return this.connections.get(id);
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
        return connection !== undefined && connection.session !== undefined;
    }
}

export const connections = new Connections();
