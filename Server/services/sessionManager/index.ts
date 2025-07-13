import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { logCapture } from "@kingsmaker/shared/utils/logCapture";
import { jsonPost } from "@kingsmaker/shared/utils/jsonPost";
import { handleAddConnection } from "./routes/createSession";
import { handleUpdatePresence } from "./routes/updateSessionPresence";
import { handleGetSession } from "./routes/getSession";
import { handleRefreshSession } from "./routes/refreshSession";
import { handleDeleteSession } from "./routes/deleteSession";
import { handleGetAllSessions } from "./routes/getAllSessions";
import { handleValidateSession } from "./routes/validateSession";
import { handleGetDashboard } from "./routes/dashboard/getDashboard";
import {
    ClientPresenceStatus,
    CreateSessionInput,
} from "@kingsmaker/shared/types/session";

const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/createSession", jsonPost<CreateSessionInput>(handleAddConnection))
    .delete(
        "/deleteSession",
        jsonPost<{ sessionId: string }>(handleDeleteSession),
    )
    .get("/getAllSessions", handleGetAllSessions())
    .get("/getSession", jsonPost<{ sessionId: string }>(handleGetSession))
    .post(
        "/refreshSession",
        jsonPost<{ sessionId: string }>(handleRefreshSession),
    )
    .post(
        "/updatePresence",
        jsonPost<{ sessionId: string; presence: ClientPresenceStatus }>(
            handleUpdatePresence,
        ),
    )
    .post(
        "/validateSession",
        jsonPost<{ sessionId: string }>(handleValidateSession),
    )
    // Dashboard routes
    .get("/dashboard", handleGetDashboard)
    // WebSocket for log streaming
    //
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

    // End Routes declaration
    .listen(PORT);

console.log(`🚀 Server is running on http://localhost:${PORT}`);
console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
console.log(`🔍 Log capture system initialized and ready`);

// Add periodic heartbeat logging for testing
setInterval(() => {
    console.log(`💓 SessionManager heartbeat - ${new Date().toISOString()}`);
}, 30000);
