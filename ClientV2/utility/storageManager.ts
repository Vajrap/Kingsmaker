// This is the local storage manager class

interface UserData {
    username: string
    nameAlias: string
    userType: "registered" | "guest" | "admin"
    presenceStatus: "INITIAL" | "IN_LOBBY" | "IN_WAITING_ROOM" | "IN_GAME" | "OFFLINE"
}

class StorageManager {
    private readonly SESSION_KEY = 'kingsmaker_session'
    private readonly USER_KEY = 'kingsmaker_user'
    private readonly THEME_KEY = 'kingsmaker_theme'

    // Session management
    setSessionId(sessionId: string): void {
        localStorage.setItem(this.SESSION_KEY, sessionId)
    }

    getSessionId(): string | null {
        return localStorage.getItem(this.SESSION_KEY)
    }

    clearSession(): void {
        localStorage.removeItem(this.SESSION_KEY)
        localStorage.removeItem(this.USER_KEY)
    }

    // User data management
    setUserData(userData: UserData): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData))
    }

    getUserData(): UserData | null {
        const data = localStorage.getItem(this.USER_KEY)
        return data ? JSON.parse(data) : null
    }

    getUserStatus(): string {
        const userData = this.getUserData()
        return userData?.presenceStatus || 'INITIAL'
    }

    // Theme management
    setTheme(theme: 'light' | 'dark'): void {
        localStorage.setItem(this.THEME_KEY, theme)
        document.documentElement.setAttribute('data-theme', theme)
    }

    getTheme(): 'light' | 'dark' {
        const theme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark'
        return theme || 'light'
    }

    // Initialize theme on app start
    initTheme(): void {
        const theme = this.getTheme()
        document.documentElement.setAttribute('data-theme', theme)
    }
}

export const storageManager = new StorageManager()