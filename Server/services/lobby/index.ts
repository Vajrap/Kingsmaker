import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
// Initialize log capture first, before any console.log calls
import { logCapture } from "@kingsmaker/shared/utils/logCapture";
import { wsOptions } from "./wsOptions";
import { handleGetAllClients } from "./routes/getAllClients";
import { handleGetDashboard } from "./routes/getDashboard";

const PORT = 7004;

new Elysia()
    .use(cors())
    // Client routes
    .ws("/lobby", {
        open(ws) {},
        message(ws, message) {},
        close(ws) {},
    })

    // Dashboard routes
    .get("/api/clients", handleGetAllClients)
    .get("/dashboard", handleGetDashboard)
    .ws("/logs", {
        open(ws) {
            logCapture.addDashboardClient(ws);
            console.log("Dashboard client connected for log streaming");
        },
        close(ws) {
            logCapture.removeDashboardClient(ws);
            console.log("Dashboard client disconnected from log streaming");
        },
    })

    // Chat
    .ws("/chat", {
        open(ws) {},
        message(ws, message) {},
        close(ws) {},
    })
    // End WebSocket routes
    .listen(PORT);

console.log(`🚀 Lobby service running on http://localhost:${PORT}`);
console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);

// Add periodic heartbeat logging for testing
setInterval(() => {
    console.log(`💓 Lobby service heartbeat - ${new Date().toISOString()}`);
}, 30000);
