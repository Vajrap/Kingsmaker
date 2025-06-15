
export interface UserSession {
  sessionID: string;
  userType: 'registered' | 'guest';
  username: string;
  loginTime: number;
}

class SessionManager {
  private readonly SESSION_KEY = 'kingsmaker-session';
  private readonly LAST_LOGIN_KEY = 'kingsmaker-lastlogin';
  
  // Save session to localStorage
  saveSession(sessionData: UserSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(this.LAST_LOGIN_KEY, sessionData.username);
  }

  // Get session from localStorage
  getSession(): UserSession | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData) as UserSession;
    } catch {
      this.clearSession();
      return null;
    }
  }

  // Clear session from localStorage
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    // Keep last login for convenience
  }

  // Get last login username
  getLastLogin(): string | null {
    return localStorage.getItem(this.LAST_LOGIN_KEY);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  // Get session token for API calls
  getSessionToken(): string | null {
    const session = this.getSession();
    return session?.sessionID || null;
  }

  // Validate session with backend
  async validateSession(): Promise<boolean> {
    const token = this.getSessionToken();
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          head: 'auth',
          body: { token }
        }),
      });

      const result = await response.json();
      
      if (result.head === 'auth-ok') {
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
      console.error('Session validation failed:', error);
      return false;
    }
  }

  // Logout - clear session and call backend
  async logout(): Promise<void> {
    const token = this.getSessionToken();
    
    if (token) {
      try {
        await fetch('http://localhost:3000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            head: 'logout',
            body: { sessionID: token }
          }),
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    this.clearSession();
  }
}

export const sessionManager = new SessionManager(); 