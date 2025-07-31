export async function sendRestRequest(url, method = "POST", body, timeout = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : null,
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
                type: error.name,
                message: error.message,
            };
        }
        return await response.json();
    }
    catch (err) {
        clearTimeout(timer);
        return {
            success: false,
            type: err instanceof DOMException && err.name === "AbortError"
                ? err.name
                : "Unknown Error",
            message: err instanceof DOMException && err.name === "AbortError"
                ? "Request timed out"
                : err.message,
        };
    }
}
