import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { handleRegisterMessage } from "./Request-Respond/register";
import type { ClientMessage } from "./Request-Respond/messages";
import { handleLoginMessage } from "./Request-Respond/login";
import { handleGuestMessage } from "./Request-Respond/guest";
import { handleAuthMessage, handleLogoutMessage } from "./Request-Respond/auth";
import { LobbyWebSocketHandler } from "./Entity/LobbyWebSocketHandler";

const app = new Elysia();

app.use(cors());

app.post("/api", async ({ body }) => {
  const message = body as ClientMessage;
  
  switch (message.head) {
    case "register":
      return await handleRegisterMessage(message);
    case "login":
      return await handleLoginMessage(message);
    case "guest":
      return await handleGuestMessage(message);
    case "auth":
      return await handleAuthMessage(message);
    case "logout":
      return await handleLogoutMessage(message);
    default:
      return {
        head: "error",
        body: { message: "Unknown message type" }
      };
  }
});

app.ws("/lobby", {
  open(ws) {
    LobbyWebSocketHandler.handleConnection(ws);
  },
  
  message(ws, message) {
    const messageStr = typeof message === 'string'
      ? message
      : Buffer.isBuffer(message)
        ? message.toString('utf8')
        : JSON.stringify(message); // fallback for odd cases
  
    console.log("Lobby WebSocket message received messageStr:", messageStr);
    LobbyWebSocketHandler.handleMessage(ws, messageStr);
  },
  
  close(ws) {
    LobbyWebSocketHandler.handleClose(ws);
  }
});

app.get("/health", () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

setInterval(() => {
  try {
    LobbyWebSocketHandler.cleanupOldRooms();
  } catch (error) {
    console.error("Error during room cleanup:", error);
  }
}, 60 * 60 * 1000);

const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});
