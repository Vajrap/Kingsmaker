import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { handleLogin } from "./routes/login";
import { handleRegister } from "./routes/register";
import { handleGuestLogin } from "./routes/guest";
import { handleAutoLogin } from "./routes/autoLogin";
import { handleLogout } from "./routes/logout";
import type { LoginBody, LogoutBody, RegisterBody, AuthBody } from "./shared/types/types";
// import type { LoginBody, LogoutBody, RegisterBody, AuthBody } from "@kingsmaker/shared/types/types";
import { jsonPost } from "./shared/utils/jsonPost";
// import { jsonPost } from "@kingsmaker/shared/utils/jsonPost";

const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/register", jsonPost<RegisterBody>(handleRegister))
    .post("/login", jsonPost<LoginBody>(handleLogin))
    .post("/guest", handleGuestLogin)
    .post("/logout", jsonPost<LogoutBody>(handleLogout))
    .post("/autoLogin", jsonPost<AuthBody>(handleAutoLogin))
    // End Routes declaration
    .listen(PORT);

console.log(`Server is running on http://localhost:${PORT}`);
