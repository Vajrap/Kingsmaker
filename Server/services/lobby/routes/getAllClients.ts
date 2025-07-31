import { Connection, connections } from "entity/Connections";

export async function handleGetAllClients() {
    try {
        const allConnections: Connection[] = connections.getAllConnections();

        allConnections[0].session.waitingRoomId;
        const clients = allConnections.map((connection) => ({
            sessionId: connection.session.sessionId,
            userId: connection.session.userId,
            userType: connection.session.userType,
            username: connection.session.username,
            connectedAt: connection.session.connectedAt,
            lastSeen: connection.session.lastSeen,
            presenceStatus: connection.session.presenceStatus,
            waitingRoomId: connection.session.waitingRoomId,
            gameRoomId: connection.session.gameRoomId,
        }));

        return {
            status: "success",
            data: {
                clients,
                total: clients.length,
                connected: clients.filter((c) => c.presenceStatus === "INITIAL")
                    .length,
                disconnected: clients.filter(
                    (c) => c.presenceStatus === "OFFLINE",
                ).length,
            },
        };
    } catch (error) {
        console.error("Error getting all clients:", error);
        return {
            status: "error",
            data: null,
            message: "Failed to get clients",
        };
    }
}
