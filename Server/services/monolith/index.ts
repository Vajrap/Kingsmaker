import { Elysia } from "elysia";
import { restHandler, type LobbyClientMessage } from "@kingsmaker/shared";
import cors from "@elysiajs/cors";
import { handleAutoLogin } from "./Routes/APIs/Auth/autoLogin";
import { handleGuestLogin } from "./Routes/APIs/Auth/guestLogin";
import { handleLogin } from "./Routes/APIs/Auth/login";
import { handleLogout } from "./Routes/APIs/Auth/logout";
import { handleRegister } from "./Routes/APIs/Auth/register";
import { handleLobbyWs } from "./Routes/APIs/Lobby";

import {
    type RegisterInput,
    type AuthInput,
    type GuestInput,
    type LoginInput,
    type LoginOutput,
    type LogoutInput,
    type LogoutOutput,
    type RegisterOutput,
} from "@kingsmaker/shared";
import { handleGuestForce } from "./Routes/APIs/Auth/guestForce";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Elysia()
    .use(cors())
    .get("/", () => "Monolith Service is running!")
    .post(
        "/register",
        restHandler<RegisterInput, RegisterOutput>(handleRegister),
    )
    .post("/login", restHandler<LoginInput, LoginOutput>(handleLogin))
    .post("/auto-login", restHandler<AuthInput, LoginOutput>(handleAutoLogin))
    .post("/guest", restHandler<GuestInput, LoginOutput>(handleGuestLogin))
    .post("/guest_force", restHandler<AuthInput, LoginOutput>(handleGuestForce))
    .post("/logout", restHandler<LogoutInput, LogoutOutput>(handleLogout))
    .ws("/lobby", {
        message(ws, message: LobbyClientMessage) {
            handleLobbyWs(ws, message);
        },
    })
    .ws("/waitingRoom", {
        message(ws, message) {
            // TODO: Implement waiting room websocket
        },
    })
    .listen(PORT);

export type MonolithApp = typeof app;
