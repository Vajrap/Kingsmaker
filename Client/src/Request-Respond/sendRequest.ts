import type { ApiResponse } from "@shared/types/types";

export async function sendRestRequest<REQ, RES>(
    url: string,
    method: "POST" | "GET" | "PUT" | "DELETE" = "POST",
    body: REQ,
    timeout = 5000,
): Promise<ApiResponse<RES>> {
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
            const error = await response
                .json()
                .catch(() => ({ message: "Unknown error" }));
            return {
                success: false,
                message: error.message,
            };
        }

        return await response.json();
    } catch (err) {
        clearTimeout(timer);
        return {
            success: false,
            message:
                err instanceof DOMException && err.name === "AbortError"
                    ? "Request timed out"
                    : (err as Error).message,
        };
    }
}
