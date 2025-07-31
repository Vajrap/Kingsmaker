import { storageManager } from "./storageManager.ts";

// Types matching your auth service
export interface LoginInput {
    username: string;
    password: string;
}

export interface LoginOutput {
    sessionId: string;
    userType: "registered" | "guest" | "admin";
    username: string;
    nameAlias: string;
    presenceStatus:
        | "INITIAL"
        | "IN_LOBBY"
        | "IN_WAITING_ROOM"
        | "IN_GAME"
        | "OFFLINE";
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface RegisterOutput {
    id: number;
    nameAlias: string;
    username: string;
    email: string;
    type: "registered" | "guest" | "admin";
}

export interface LogoutInput {
    sessionToken: string;
}

export interface LogoutOutput {
    message: string;
}

export interface AuthInput {
    token: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export class AuthService {
    private readonly baseUrl: string = "http://localhost:7777";

    async login(credentials: LoginInput): Promise<LoginOutput | null> {
        try {
            console.log("Attempting login with:", {
                username: credentials.username,
                password: "[REDACTED]",
            });

            const response = await fetch(`${this.baseUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            console.log(
                "Response status:",
                response.status,
                response.statusText,
            );
            console.log(
                "Response headers:",
                Object.fromEntries(response.headers.entries()),
            );

            // First check if the HTTP response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    "HTTP Error:",
                    response.status,
                    response.statusText,
                );
                console.error("Error response body:", errorText);

                // Try to parse as JSON to see if it's a structured error
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error("Parsed error JSON:", errorJson);
                } catch (e) {
                    console.error("Error response is not JSON:", errorText);
                }

                throw new Error(
                    `Server error (${response.status}): ${response.statusText}`,
                );
            }

            const result: ApiResponse<LoginOutput> = await response.json();
            console.log("Success response data:", result);

            if (result.success && result.data) {
                // Store session data
                storageManager.setSessionId(result.data.sessionId);
                storageManager.setUserData({
                    username: result.data.username,
                    nameAlias: result.data.nameAlias,
                    userType: result.data.userType,
                    presenceStatus: result.data.presenceStatus,
                });
                return result.data;
            }

            throw new Error(result.message || "Login failed");
        } catch (error) {
            console.error("Login error:", error);
            return null;
        }
    }

    async register(userData: RegisterInput): Promise<RegisterOutput | null> {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const result: ApiResponse<RegisterOutput> = await response.json();

            if (result.success && result.data) {
                return result.data;
            }

            throw new Error(result.message || "Registration failed");
        } catch (error) {
            console.error("Registration error:", error);
            return null;
        }
    }

    async guestLogin(): Promise<LoginOutput | null> {
        try {
            const response = await fetch(`${this.baseUrl}/guest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            // First check if the HTTP response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    "HTTP Error:",
                    response.status,
                    response.statusText,
                    errorText,
                );
                throw new Error(
                    `Server error (${response.status}): ${response.statusText}`,
                );
            }

            const result: ApiResponse<LoginOutput> = await response.json();

            if (result.success && result.data) {
                // Store session data
                storageManager.setSessionId(result.data.sessionId);
                storageManager.setUserData({
                    username: result.data.username,
                    nameAlias: result.data.nameAlias,
                    userType: result.data.userType,
                    presenceStatus: result.data.presenceStatus,
                });
                return result.data;
            }

            throw new Error(result.message || "Guest login failed");
        } catch (error) {
            console.error("Guest login error:", error);
            return null;
        }
    }

    async logout(): Promise<boolean> {
        try {
            const sessionId = storageManager.getSessionId();
            if (!sessionId) return true;

            const response = await fetch(`${this.baseUrl}/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sessionToken: sessionId }),
            });

            const result: ApiResponse<LogoutOutput> = await response.json();

            // Clear local storage regardless of server response
            storageManager.clearSession();

            return result.success;
        } catch (error) {
            console.error("Logout error:", error);
            // Clear local storage even on error
            storageManager.clearSession();
            return false;
        }
    }

    async validateSession(sessionId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/autoLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: sessionId }),
            });

            const result: ApiResponse<LoginOutput> = await response.json();

            if (result.success && result.data) {
                // Update stored user data
                storageManager.setUserData({
                    username: result.data.username,
                    nameAlias: result.data.nameAlias,
                    userType: result.data.userType,
                    presenceStatus: result.data.presenceStatus,
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error("Session validation error:", error);
            return false;
        }
    }
}
