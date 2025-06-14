import { Elysia, type Context } from "elysia";
import cors from "@elysiajs/cors";
import "dotenv/config";
import { handleLogin } from "./routes/login";
import { handleRegister } from "./routes/register";
import { handleGuest } from "./routes/guest";
import { handleAutoLogin } from "./routes/autoLogin";
import { handleLogout } from "./routes/logout";
import type { AutoLoginBody, LoginBody, LogoutBody, RegisterBody } from "@shared/types/types";

const PORT = parseInt(process.env.PORT || "3000");

new Elysia()
    .use(cors())
    // Routes declaration
    .post("/register", jsonPost<RegisterBody>(handleRegister))
    .post("/login", jsonPost<LoginBody>(handleLogin))
    .post("/guest", handleGuest)
    .post("/logout", jsonPost<LogoutBody>(handleLogout))
    .post("/autoLogin", jsonPost<AutoLoginBody>(handleAutoLogin))
    // End Routes declaration
    .listen(PORT);

console.log(`🚀 Server is running on http://localhost:${PORT}`);

function jsonPost<T = any>(
    handler: (args: { body: T }) => any
  ) {
    return async (ctx: Context) => {
      const raw = await ctx.body;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return handler({ body: parsed });
    };
  }