import type { ClientMessage, ServerMessage, ServerError } from "../messages";
// import { processQueue, queue, handleResponse } from "./queue";

export async function sendRestRequest(
  url: string,
  method: "POST" | "GET" | "PUT" | "DELETE" = "POST",
  body: ClientMessage,
  timeout = 5000,
): Promise<ServerMessage | ServerError> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    console.log(response);

    clearTimeout(timer);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        head: "error",
        body: {
          message: error.message || "Request failed",
        },
      };
    }

    return response.json();
  } catch (err) {
    clearTimeout(timer);
    return {
      head: "error",
      body: {
        message:
          err instanceof DOMException && err.name === "AbortError"
            ? "Request timed out"
            : (err as Error).message,
      },
    };
  }
}

// export function sendQueuedWSRequest(
//   message: ClientMessage,
//   signal?: AbortSignal,
// ): Promise<ServerMessage | ServerError> {
//   return new Promise((resolve, reject) => {
//     queue.push({ message, resolve, reject, signal });
//     processQueue();
//   });
// }

// export { handleResponse };
