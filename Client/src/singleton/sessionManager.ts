import { sendRestRequest } from "@/Request-Respond/sendRequest";
import type { ApiResponse } from "@shared/types/api";
import type { AuthBody, LoginResponse, LogoutBody } from "@shared/types/auth";
import type {
    ValidateRoomStatusRequest,
    ValidateRoomStatusResponse,
} from "@shared/types/room";

export interface UserSession {
    sessionId: string;
    userType: "registered" | "guest" | "admin";
    username: string;
    loginTime: string;
    presenceStatus?:
        | "INITIAL"
        | "IN_LOBBY"
        | "IN_WAITING_ROOM"
        | "IN_GAME"
        | "OFFLINE";
    waitingRoomId?: string;
    gameRoomId?: string;
}

class SessionManager {
    private readonly SESSION_ID = "kingsmaker-session-id";
    private readonly USER_TYPE = "kingsmaker-usertype";
    private readonly USER_NAME = "kingsmaker-user-id";
    private readonly LOGIN_TIME = "kingsmaker-logintime";
    private readonly PRESENCE_STATUS = "kingsmaker-presence-status";
    private readonly WAITING_ROOM_ID = "kingsmaker-waiting-room-id";
    private readonly GAME_ROOM_ID = "kingsmaker-game-room-id";

    // Save session to localStorage
    saveSession(sessionData: UserSession): void {
        console.log(`Saving Data`);
        console.log(`ID: ${sessionData.sessionId}`);
        localStorage.setItem(this.SESSION_ID, sessionData.sessionId);
        localStorage.setItem(this.USER_TYPE, sessionData.userType);
        localStorage.setItem(this.USER_NAME, sessionData.username);
        localStorage.setItem(this.LOGIN_TIME, sessionData.loginTime.toString());

        if (sessionData.presenceStatus) {
            localStorage.setItem(
                this.PRESENCE_STATUS,
                sessionData.presenceStatus,
            );
        }
        if (sessionData.waitingRoomId) {
            localStorage.setItem(
                this.WAITING_ROOM_ID,
                sessionData.waitingRoomId,
            );
        }
        if (sessionData.gameRoomId) {
            localStorage.setItem(this.GAME_ROOM_ID, sessionData.gameRoomId);
        }
    }

    // Get session from localStorage
    getSession(): UserSession | null {
        // const sessionData = localStorage.getItem(this.SESSION_KEY);
        const sessionId = localStorage.getItem(this.SESSION_ID);
        const userType = localStorage.getItem(this.USER_TYPE);
        const username = localStorage.getItem(this.USER_NAME);
        const loginTime = localStorage.getItem(this.LOGIN_TIME);
        const presenceStatus = localStorage.getItem(this.PRESENCE_STATUS);
        const waitingRoomId = localStorage.getItem(this.WAITING_ROOM_ID);
        const gameRoomId = localStorage.getItem(this.GAME_ROOM_ID);

        if (
            !sessionId ||
            !username ||
            !loginTime ||
            (userType !== "registered" && userType !== "guest")
        ) {
            return null;
        }

        const sessionData: UserSession = {
            sessionId,
            userType,
            username,
            loginTime,
            presenceStatus: presenceStatus as UserSession["presenceStatus"],
            waitingRoomId: waitingRoomId || undefined,
            gameRoomId: gameRoomId || undefined,
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
        localStorage.removeItem(this.PRESENCE_STATUS);
        localStorage.removeItem(this.WAITING_ROOM_ID);
        localStorage.removeItem(this.GAME_ROOM_ID);
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
            const body: AuthBody = {
                token,
            };

            const response = (await sendRestRequest<AuthBody, LoginResponse>(
                "http://localhost:3000/api",
                "POST",
                body,
            )) as ApiResponse<LoginResponse>;

            if (response.success && response.message === "auth-ok") {
                // Update session with fresh data
                const session = this.getSession();
                if (session) {
                    session.userType = response.data.userType;
                    session.username = response.data.username;
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
                const body: LogoutBody = {
                    sessionToken: token,
                };

                await sendRestRequest<LogoutBody, LoginResponse>(
                    "http://localhost:3000/api/logout",
                    "POST",
                    body,
                );
            } catch (error) {
                console.error("Logout API call failed:", error);
            }
        } else {
            // TODO: Handle the case when there is no token, ERROR?
        }

        this.clearSession();
    }

    // Presence management methods
    updatePresenceStatus(status: UserSession["presenceStatus"]): void {
        if (status) {
            localStorage.setItem(this.PRESENCE_STATUS, status);
        } else {
            localStorage.removeItem(this.PRESENCE_STATUS);
        }
    }

    getPresenceStatus(): UserSession["presenceStatus"] {
        return localStorage.getItem(
            this.PRESENCE_STATUS,
        ) as UserSession["presenceStatus"];
    }

    // Room ID management methods
    setWaitingRoomId(roomId: string | null): void {
        if (roomId) {
            localStorage.setItem(this.WAITING_ROOM_ID, roomId);
        } else {
            localStorage.removeItem(this.WAITING_ROOM_ID);
        }
    }

    getWaitingRoomId(): string | null {
        return localStorage.getItem(this.WAITING_ROOM_ID);
    }

    setGameRoomId(roomId: string | null): void {
        if (roomId) {
            localStorage.setItem(this.GAME_ROOM_ID, roomId);
        } else {
            localStorage.removeItem(this.GAME_ROOM_ID);
        }
    }

    getGameRoomId(): string | null {
        return localStorage.getItem(this.GAME_ROOM_ID);
    }

    // Server presence validation - calls SessionManager service
    async validatePresenceStatus(): Promise<{
        valid: boolean;
        redirectTo?: string;
        roomId?: string;
    }> {
        const session = this.getSession();
        if (!session) {
            return { valid: false, redirectTo: "login" };
        }

        const presenceStatus = session.presenceStatus;

        switch (presenceStatus) {
            case "INITIAL":
            case "IN_LOBBY":
                return { valid: true };

            case "IN_WAITING_ROOM": {
                const waitingRoomId = session.waitingRoomId;
                if (!waitingRoomId) {
                    // No room ID stored, redirect to lobby
                    this.updatePresenceStatus("IN_LOBBY");
                    return { valid: false, redirectTo: "lobby" };
                }

                // Validate with waiting room service
                try {
                    const body: ValidateRoomStatusRequest = {
                        sessionId: session.sessionId,
                        roomId: waitingRoomId,
                    };
                    const response = await sendRestRequest<
                        ValidateRoomStatusRequest,
                        ValidateRoomStatusResponse
                    >("http://localhost:7005/validateRoomStatus", "POST", body);

                    if (response.success && response.data.valid) {
                        return { valid: true, roomId: waitingRoomId };
                    } else {
                        // Room no longer valid, redirect to lobby
                        this.updatePresenceStatus("IN_LOBBY");
                        this.setWaitingRoomId(null);
                        return { valid: false, redirectTo: "lobby" };
                    }
                } catch (error) {
                    console.error(
                        "Error validating waiting room status:",
                        error,
                    );
                    // On error, redirect to lobby
                    this.updatePresenceStatus("IN_LOBBY");
                    this.setWaitingRoomId(null);
                    return { valid: false, redirectTo: "lobby" };
                }
            }

            case "IN_GAME": {
                const gameRoomId = session.gameRoomId;
                if (!gameRoomId) {
                    // No game ID stored, redirect to lobby
                    this.updatePresenceStatus("IN_LOBBY");
                    return { valid: false, redirectTo: "lobby" };
                }

                // TODO: Validate with game service when implemented
                // For now, redirect to lobby
                alert("Wait for implementation!");
                // this.updatePresenceStatus("IN_LOBBY");
                // this.setGameRoomId(null);
                return { valid: false, redirectTo: "lobby" };
            }

            case "OFFLINE":
            default:
                // Invalid presence, redirect to login
                this.clearSession();
                return { valid: false, redirectTo: "login" };
        }
    }
}

export const sessionManager = new SessionManager();
