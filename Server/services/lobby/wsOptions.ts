import { t } from "elysia";
import { handleMessage } from "./handler/message";
import { handleClose } from "./handler/close";
import type { LobbyClientMessage } from "@kingsmaker/shared/types/types";

export const wsOptions = {
    body: t.Object({
        type: t.String(),
        data: t.Optional(t.Any()),
    }),
    async open(ws: any) {
        console.log("New WebSocket connection opened, waiting for first message...");
        // Don't validate here - wait for first message with sessionId
    },
    async message(ws: any, msg: LobbyClientMessage) {
        await handleMessage(ws, msg);
    },
    close(ws: any) {
        handleClose(ws);
    },
}; 