import type { ApiResponse, AuthBody, LoginBody, LoginResponse, RegisterResponse } from "@shared/types/types";

export async function sendRestRequest(
  url: string,
  method: "POST" | "GET" | "PUT" | "DELETE" = "POST",
  body: LoginBody | AuthBody,
  timeout = 5000,
): Promise<ApiResponse<LoginResponse> | ApiResponse<RegisterResponse>> {
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
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      data: await response.json(),
    };
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