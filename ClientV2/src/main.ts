import { Router } from '@/utility/router.ts'
import { AuthService } from '@/utility/authService.ts'
import { storageManager } from '@/utility/storageManager.ts'

class App {
    private router: Router
    private authService: AuthService

    constructor() {
        this.router = new Router()
        this.authService = new AuthService()
        this.init()
    }

    private async init() {
        await this.setupRoutes()
        await this.checkAuthAndRoute()
        this.hideLoading()
    }

    private async setupRoutes() {
        // Register all routes
        this.router.register('/', () => this.redirectToAppropriateRoute())
        this.router.register('/login', () => this.loadLoginPage())
        this.router.register('/register', () => this.loadRegisterPage())
        this.router.register('/lobby', () => this.loadLobbyPage())
        this.router.register('/waiting-room', () => this.loadWaitingRoomPage())
        this.router.register('/game', () => this.loadGamePage())
    }

    private async checkAuthAndRoute() {
        const sessionId = storageManager.getSessionId()
        
        if (sessionId) {
            // Try to validate existing session
            const isValid = await this.authService.validateSession(sessionId)
            if (isValid) {
                // Route based on user's presence status
                const userStatus = storageManager.getUserStatus()
                this.routeBasedOnStatus(userStatus)
                return
            }
        }
        
        // No valid session, go to login
        this.router.navigate('/login')
    }

    private routeBasedOnStatus(status: string) {
        switch (status) {
            case 'IN_LOBBY':
                this.router.navigate('/lobby')
                break
            case 'IN_WAITING_ROOM':
                this.router.navigate('/waiting-room')
                break
            case 'IN_GAME':
                this.router.navigate('/game')
                break
            default:
                this.router.navigate('/lobby')
        }
    }

    private async redirectToAppropriateRoute() {
        await this.checkAuthAndRoute()
    }

    private async loadLoginPage() {
        const { LoginPage } = await import('../pagesAndComponent/login/viewModel')
        new LoginPage()
    }

    private async loadRegisterPage() {
        const { RegisterPage } = await import('../pagesAndComponent/register/viewModel')
        new RegisterPage()
    }

    private async loadLobbyPage() {
        const { LobbyPage } = await import('../pagesAndComponent/lobby/viewModel')
        new LobbyPage()
    }

    private async loadWaitingRoomPage() {
        const { WaitingRoomPage } = await import('../pagesAndComponent/waitingRoom/viewModel')
        new WaitingRoomPage()
    }

    private async loadGamePage() {
        const { GamePage } = await import('../pagesAndComponent/game/viewModel')
        new GamePage()
    }

    private hideLoading() {
        const loading = document.getElementById('loading')
        const mainContent = document.getElementById('main-content')
        if (loading) loading.classList.add('hidden')
        if (mainContent) mainContent.classList.remove('hidden')
    }
}

// Initialize the application
new App() 