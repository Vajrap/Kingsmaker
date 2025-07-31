import { AuthService } from "@/utility/authService.ts";
import { storageManager } from "@/utility/storageManager.ts";

/*
When opening the web

Before Business Logic
1. add tab-session-id
2. check active tab id from local storage
???

SessionId Dominant
1. check local storage for sessionId
  if null -> go to loginPage
2. call server, asking for userData from the sessionId (multiple response)
  - if error -> return error
  - if session expired -> go to loginPage
  - if session is not expired -> extend session and return userData then next go step,

// Session existed + not expired, => autoLogin
3. client received UserData (partial, only data client really needed), check for UserData.userPresence (or something like so, that gives up idea on where the user was before leaveing)
  - if presence === 'WaitingRoom'
    - check with Server, if waitingRoom still exist.
      - true -> go to waiting room page
      - false -> go to lobby page
  - if presence === 'GameRoom'
    - check with Server, if GameRoom still exist.
      - true -> go to waiting room page
      - false -> go to lobby page
  - other presence status -> go to lobby room
*/

class App {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
        this.init();
    }

    private async init() {
        console.log("Initializing app...");

        const path = window.location.pathname;
        console.log(`Path: ${path}`);
        if (path !== "/" && path !== "") {
            console.log(`Already on ${path}, letting page handle itself`);
            return;
        }

        await this.handleInitialRouting();
    }

    private async handleInitialRouting() {
        const sessionId = storageManager.getSessionId();

        if (sessionId) {
            console.log("Found existing session, validating...");
            const isValid = await this.validateSession(sessionId);

            if (isValid) {
                console.log("Session valid, redirecting to lobby");
                window.location.href = "/pagesAndComponent/lobby/index.html";
            } else {
                console.log(
                    "Session invalid, clearing and redirecting to login",
                );
                storageManager.clearSession();
                window.location.href = "/pagesAndComponent/login/index.html";
            }
        } else {
            console.log("No session found, redirecting to login");
            window.location.href = "/pagesAndComponent/login/index.html";
        }
    }

    private async validateSession(sessionId: string): Promise<boolean> {
        try {
            return await this.authService.validateSession(sessionId);
        } catch (error) {
            console.error("Session validation failed:", error);
            return false;
        }
    }
}

// Initialize the application
new App();
