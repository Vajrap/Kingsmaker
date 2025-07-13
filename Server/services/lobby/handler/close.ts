import { connections } from "../logic/connections";

export function handleClose(ws: any): void {
    // Remove connection from map when client disconnects
    for (const [sessionId, connection] of connections.connections) {
        if (connection.ws === ws) {
            connections.removeConnection(sessionId);
            console.log(`User disconnected from lobby: ${sessionId}`);
            break;
        }
    }
} 