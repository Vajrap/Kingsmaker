import type { ElysiaWS } from "elysia/ws";

export function wsHandler<TInput>(
    ws: ElysiaWS,
    message: TInput,
    handler: (ws: ElysiaWS, message: TInput) => void,
): (ws: ElysiaWS, message: unknown) => void {
    return (ws, raw) => {
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            handler(ws, parsed as TInput);
        } catch {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Invalid message format",
                }),
            );
        }
    };
}
