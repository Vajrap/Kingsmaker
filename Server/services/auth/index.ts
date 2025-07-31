import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { handleLogin } from "./routes/login";
import { handleRegister } from "./routes/register";
import { handleGuestLogin } from "./routes/guest";
import { handleAutoLogin } from "./routes/autoLogin";
import { handleLogout } from "./routes/logout";
import type {
    LoginInput,
    LoginOutput,
    LogoutInput,
    LogoutOutput,
    RegisterInput,
    RegisterOutput,
    AuthInput,
} from "@kingsmaker/shared/types/types";
import { jsonPost } from "@kingsmaker/shared/utils/jsonPost";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/register", jsonPost<RegisterInput, RegisterOutput>(handleRegister))
    .post("/login", jsonPost<LoginInput, LoginOutput>(handleLogin))
    .post("/guest", handleGuestLogin)
    .post("/logout", jsonPost<LogoutInput, LogoutOutput>(handleLogout))
    .post("/autoLogin", jsonPost<AuthInput, LoginOutput>(handleAutoLogin))
    // End Routes declaration
    .listen(PORT);

console.log(`Server is running on http://localhost:${PORT}`);
