import { type Player } from "@kingsmaker/shared";
import { ALREADY_LOGIN } from "@kingsmaker/shared/types/auth";
import { ElysiaWS } from "elysia/ws";

type ClientConnection = {
    sessionId: string;
    ws: ElysiaWS;
    player: Player;
};

class ClientManager {
    connection: Map<number, ClientConnection>;

    constructor() {
        this.connection = new Map<number, ClientConnection>();
    }

    addSession(
        userId: number,
        sessionId: string,
        ws: ElysiaWS,
        player: Player,
    ) {
        this.connection.set(userId, {
            sessionId,
            ws,
            player,
        });
    }

    forceAddConnection(
        userId: number,
        sessionId: string,
        ws: ElysiaWS,
        player: Player,
        location?: "lobby" | "waitingRoom" | "inGame",
    ) {
        const existing = this.connection.get(userId);
        if (existing) {
            try {
                existing.ws.send(
                    JSON.stringify({
                        type: "duplicate",
                        reason: "You've been logged in from another device.",
                    }),
                );
                existing.ws.close(4001, "Force disconnect");
            } catch {}
        }

        this.connection.set(userId, {
            sessionId,
            ws,
            player,
        });
    }

    userAlreadyConnected(userId: number): boolean {
        return this.connection.has(userId);
    }

    cleanupSession(userId: number) {
        this.connection.delete(userId);
    }

    getConnection(userId: number): ClientConnection | undefined {
        return this.connection.get(userId);
    }

    getPlayer(userId: number): Player | undefined {
        return this.connection.get(userId)?.player;
    }

    getSocket(userId: number): ElysiaWS | undefined {
        return this.connection.get(userId)?.ws;
    }

    getUserIdBySessionId(sessionId: string): number | null {
        for (const [userId, conn] of this.connection) {
            if (conn.sessionId === sessionId) {
                return userId;
            }
        }
        return null;
    }

    removeSession(userId: number) {
        this.connection.delete(userId);
    }

    ifPlayerSessionExist(player: Player) {
        const existing = this.connection.get(player.userId);
        if (!existing) return false;
        return true;
    }

    broadCastToAllSession(message: any) {
        for (const [_, connection] of this.connection) {
            connection.ws.send(message);
        }
    }
}

export const clientManager = new ClientManager();
