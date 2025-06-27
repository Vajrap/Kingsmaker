export interface UserSession {
    sessionId: string;
    userType: "registered" | "guest";
    username: string;
    loginTime: string;
}

class SessionManager {
    private readonly SESSION_ID = "kingsmaker-session-id";
    private readonly USER_TYPE = "kingsmaker-usertype";
    private readonly USER_NAME = "kingsmaker-user-id";
    private readonly LOGIN_TIME = "kingsmaker-logintime";

    // Save session to localStorage
    saveSession(sessionData: UserSession): void {
        localStorage.setItem(this.SESSION_ID, sessionData.sessionId);
        localStorage.setItem(this.USER_TYPE, sessionData.userType);
        localStorage.setItem(this.USER_NAME, sessionData.username);
        localStorage.setItem(this.LOGIN_TIME, sessionData.loginTime.toString());
    }

    // Get session from localStorage
    getSession(): UserSession | null {
        // const sessionData = localStorage.getItem(this.SESSION_KEY);
        const sessionId = localStorage.getItem(this.SESSION_ID);
        const userType = localStorage.getItem(this.USER_TYPE);
        const username = localStorage.getItem(this.USER_NAME);
        const loginTime = localStorage.getItem(this.LOGIN_TIME);
        if (
            !sessionId ||
            !username ||
            !loginTime ||
            (userType != "registered" && userType !== "guest")
        ) {
            return null;
        }

        const sessionData: UserSession = {
            sessionId,
            userType,
            username,
            loginTime,
        };

        try {
            return sessionData;
        } catch {
            this.clearSession();
            return null;
        }
    }

    // Clear session from localStorage
    clearSession(): void {
        localStorage.removeItem(this.SESSION_ID);
        localStorage.removeItem(this.LOGIN_TIME);
        localStorage.removeItem(this.USER_NAME);
        localStorage.removeItem(this.USER_TYPE);
        // Keep last login for convenience
    }

    // Get last login username
    getLastLogin(): string | null {
        return localStorage.getItem(this.LOGIN_TIME);
    }

    // Check if user is logged in
    isLoggedIn(): boolean {
        return this.getSession() !== null;
    }

    // Get session token for API calls
    getSessionToken(): string | null {
        const session = this.getSession();
        return session?.sessionId || null;
    }

    // Validate session with backend
    async validateSession(): Promise<boolean> {
        const token = this.getSessionToken();
        if (!token) return false;

        try {
            const response = await fetch("http://localhost:3000/api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    head: "auth",
                    body: { token },
                }),
            });

            const result = await response.json();

            if (result.head === "auth-ok") {
                // Update session with fresh data
                const session = this.getSession();
                if (session) {
                    session.userType = result.body.userType;
                    session.username = result.body.username;
                    this.saveSession(session);
                }
                return true;
            } else {
                this.clearSession();
                return false;
            }
        } catch (error) {
            console.error("Session validation failed:", error);
            return false;
        }
    }

    // Logout - clear session and call backend
    async logout(): Promise<void> {
        const token = this.getSessionToken();

        if (token) {
            try {
                await fetch("http://localhost:3000/api/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        head: "logout",
                        body: { sessionID: token },
                    }),
                });
            } catch (error) {
                console.error("Logout API call failed:", error);
            }
        }

        this.clearSession();
    }
}

export const sessionManager = new SessionManager();
