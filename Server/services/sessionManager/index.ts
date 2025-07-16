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
    CreateSessionInput,
    DeleteSessionInput,
    DeleteSessionOutput,
    GetSessionInput,
    GetSessionOutput,
    RefreshSessionInput,
    RefreshSessionOutput,
    UpdatePresenceInput,
    UpdatePresenceOutput,
    ValidateSessionInput,
    ValidateSessionOutput,
} from "@kingsmaker/shared/types/session";
import { CreateSessionOutput } from "@kingsmaker/shared";

const PORT = 7007;

new Elysia()
    .use(cors())
    // Routes declaration
    .post(
        "/createSession",
        jsonPost<CreateSessionInput, CreateSessionOutput>(handleAddConnection),
    )
    .delete(
        "/deleteSession",
        jsonPost<DeleteSessionInput, DeleteSessionOutput>(handleDeleteSession),
    )
    .get("/getAllSessions", handleGetAllSessions())
    .get(
        "/getSession",
        jsonPost<GetSessionInput, GetSessionOutput>(handleGetSession),
    )
    .post(
        "/refreshSession",
        jsonPost<RefreshSessionInput, RefreshSessionOutput>(
            handleRefreshSession,
        ),
    )
    .post(
        "/updatePresence",
        jsonPost<UpdatePresenceInput, UpdatePresenceOutput>(
            handleUpdatePresence,
        ),
    )
    .post(
        "/validateSession",
        jsonPost<ValidateSessionInput, ValidateSessionOutput>(
            handleValidateSession,
        ),
    )

    // Dashboard routes
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

    // End Routes declaration
    .listen(PORT);

console.log(`🚀 Server is running on http://localhost:${PORT}`);
console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
console.log(`🔍 Log capture system initialized and ready`);

// Add periodic heartbeat logging for testing
setInterval(() => {
    console.log(`💓 SessionManager heartbeat - ${new Date().toISOString()}`);
}, 30000);
