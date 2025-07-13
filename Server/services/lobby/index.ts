import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
// Initialize log capture first, before any console.log calls
import { logCapture } from "@kingsmaker/shared/utils/logCapture";
import { wsOptions } from "./wsOptions";
import { handleGetAllClients } from "./routes/getAllClients";
import { handleGetDashboard } from "./routes/getDashboard";

const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // WebSocket routes
    .ws("/lobby", wsOptions)
    // Dashboard routes
    .get("/api/clients", handleGetAllClients)
    .get("/dashboard", handleGetDashboard)
    // WebSocket for log streaming
    .ws("/logs", {
        open(ws) {
            logCapture.addDashboardClient(ws);
            console.log("Dashboard client connected for log streaming");
        },
        close(ws) {
            logCapture.removeDashboardClient(ws);
            console.log("Dashboard client disconnected from log streaming");
        }
    })
    // End WebSocket routes
    .listen(PORT);

console.log(`🚀 Lobby service running on http://localhost:${PORT}`);
console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);

// Add periodic heartbeat logging for testing
setInterval(() => {
    console.log(`💓 Lobby service heartbeat - ${new Date().toISOString()}`);
}, 30000);
