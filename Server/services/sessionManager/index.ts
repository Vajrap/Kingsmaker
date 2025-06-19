import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { jsonPost } from "@kingsmaker/shared/utils/jsonPost";
import { handleAddConnection } from "routes/addConnection";
import { handleRemoveConnection } from "routes/removeConnection";
import { handleGetConnection } from "routes/getConnection";
import { handleUpdatePresence } from "routes/updatePresence";
import type { User } from "@shared/prisma/generated";


const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/addConnection", jsonPost<User>(handleAddConnection))
    .post("/removeConnection", jsonPost<{ userId: number }>(handleRemoveConnection))
    .post("/getConnection", jsonPost<{ userId: number }>(handleGetConnection))
    .post("/updatePresence", jsonPost<{ userId: number; presence: string }>(handleUpdatePresence))

    // End Routes declaration
    .listen(PORT);

console.log(`🚀 Server is running on http://localhost:${PORT}`);
