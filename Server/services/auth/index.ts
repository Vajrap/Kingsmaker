import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { handleLogin } from "./routes/login";
import { handleRegister } from "./routes/register";
import { handleGuest } from "./routes/guest";
import { handleAutoLogin } from "./routes/autoLogin";
import { handleLogout } from "./routes/logout";

const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/register", handleRegister)
    .post("/login", handleLogin)
    .post("/guest", handleGuest)
    .post("/logout", handleLogout)
    .post("/autoLogin", handleAutoLogin)
    // End Routes declaration
    .listen(PORT);

console.log(`🚀 Server is running on http://localhost:${PORT}`);
