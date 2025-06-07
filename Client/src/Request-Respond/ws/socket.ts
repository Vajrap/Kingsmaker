// import type { ServerMessage } from "../messages";
// import { ws } from "./ws";
// import {
//   sendQueuedWSRequest as queuedSendRequest,
//   handleResponse,
// } from "./sendRequest";

// let isConnected = false;
// let pongTimeout: ReturnType<typeof setTimeout> | null = null;

// export function connectSocket() {
//   if (ws && ws.readyState <= WebSocket.OPEN) return;

//   ws.onopen = () => {
//     isConnected = true;
//     sendPing();
//   };

//   ws.onmessage = (event) => {
//     let msg: unknown;
//     try {
//       msg = JSON.parse(event.data);
//     } catch (error) {
//       console.error("Invalid message format:", error);
//       return;
//     }

//     if (!isServerMessage(msg)) {
//       console.warn("Invalid message format: ", msg);
//       return;
//     }

//     if (msg.head === "pong" && pongTimeout !== null) {
//       clearTimeout(pongTimeout);
//       return;
//     }

//     // Pass all other messages to the queue handler
//     handleResponse(msg);
//   };

//   ws.onclose = () => {
//     // Optional: auto-reconnect
//     setTimeout(connectSocket, 1000);
//   };
// }

// export { queuedSendRequest as sendRequest, isConnected, onDisconnect };

// function isServerMessage(msg: unknown): msg is ServerMessage {
//   return (
//     typeof msg === "object" &&
//     msg !== null &&
//     typeof (msg as { head?: unknown }).head === "string" &&
//     typeof (msg as { id?: unknown }).id === "string"
//   );
// }

// export function sendPing() {
//   pongTimeout = setTimeout(() => {
//     isConnected = false;
//     ws.close(); // force close to trigger reconnect flow
//     onDisconnect(); // e.g., show modal
//   }, 5000);

//   const msg = {
//     id: crypto.randomUUID(),
//     head: "ping",
//   };

//   ws.send(JSON.stringify(msg));
// }

// const onDisconnect = () => {
//   alert(`Lost connection`);
// };
