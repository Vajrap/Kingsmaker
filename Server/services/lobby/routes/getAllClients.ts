import { connections } from "../lib/connections";

export async function handleGetAllClients() {
    try {
        const allConnections = connections.getAllConnections();
        
        const clients = allConnections.map(connection => ({
            userId: connection.userId,
            username: connection.username,
            userType: connection.userType,
            status: connection.status,
            connectedAt: connection.connectedAt,
            lastActivity: connection.lastActivity,
            sessionId: connection.sessionId,
            roomId: connection.roomId || null,
            ipAddress: connection.ipAddress,
            userAgent: connection.userAgent
        }));

        return {
            status: "success",
            data: {
                clients,
                total: clients.length,
                connected: clients.filter(c => c.status === "connected").length,
                disconnected: clients.filter(c => c.status === "disconnected").length,
                inGracePeriod: clients.filter(c => c.status === "grace_period").length
            }
        };
    } catch (error) {
        console.error("Error getting all clients:", error);
        return {
            status: "error",
            data: null,
            message: "Failed to get clients"
        };
    }
} 