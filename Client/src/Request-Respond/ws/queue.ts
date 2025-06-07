// import type { ClientMessage, ServerMessage, ServerError } from "../messages";
// import { ws } from "./ws";

// // Each queue item includes the message, and the resolve/reject for the request promise
// export const queue: {
//   message: ClientMessage;
//   resolve: (value: ServerMessage | ServerError) => void;
//   reject: (reason?: unknown) => void;
//   signal?: AbortSignal;
// }[] = [];

// let busy = false;

// // Local handler for the current request
// let currentHandler: ((data: ServerMessage | ServerError) => void) | null = null;

// export function processQueue() {
//   if (busy || queue.length === 0) return;
//   busy = true;
//   const { message, resolve, reject, signal } = queue[0];

//   // Attach abort logic
//   let aborted = false;
//   const onAbort = () => {
//     aborted = true;
//     currentHandler = null;
//     queue.shift();
//     busy = false;
//     reject({
//       head: "error",
//       body: { message: "Request aborted" },
//     });
//     processQueue();
//   };
//   if (signal) {
//     if (signal.aborted) return onAbort();
//     signal.addEventListener("abort", onAbort, { once: true });
//   }

//   try {
//     ws.send(JSON.stringify(message));
//   } catch {
//     queue.shift();
//     busy = false;
//     reject({
//       head: "error",
//       body: { message: "WebSocket send failed" },
//     });
//     processQueue();
//     return;
//   }

//   // Set up response handler for this request
//   currentHandler = (data: ServerMessage | ServerError) => {
//     if (signal) signal.removeEventListener("abort", onAbort);
//     if (!aborted) {
//       queue.shift();
//       busy = false;
//       resolve(data);
//       processQueue();
//     }
//   };
// }

// // Called from socket.ts when a message is received
// export function handleResponse(msg: ServerMessage | ServerError) {
//   if (currentHandler) {
//     const handler = currentHandler;
//     currentHandler = null;
//     handler(msg);
//   }
// }
