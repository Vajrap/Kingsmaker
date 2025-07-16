import { AuthService } from '@/utility/authService.ts'
import { Router } from '@/utility/router.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class LobbyPage {
    private authService: AuthService
    private router: Router

    constructor() {
        this.authService = new AuthService()
        this.router = new Router()
        this.init()
    }

    private async init() {
        await this.loadTemplate()
        this.setupEventListeners()
    }

    private async loadTemplate() {
        const userData = storageManager.getUserData()
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1 class="page-title">Lobby</h1>
                        <p class="page-subtitle">Welcome, ${userData?.nameAlias || 'Player'}!</p>
                    </div>
                    <div class="flex justify-center">
                        <div class="card p-8" style="max-width: 600px; width: 100%;">
                            <div class="mb-6">
                                <h3 class="text-xl font-semibold mb-2">Player Info</h3>
                                <p><strong>Username:</strong> ${userData?.username || 'Unknown'}</p>
                                <p><strong>User Type:</strong> ${userData?.userType || 'Unknown'}</p>
                                <p><strong>Status:</strong> ${userData?.presenceStatus || 'Unknown'}</p>
                            </div>
                            <div class="flex gap-4">
                                <button id="logoutBtn" class="btn btn-danger">
                                    Logout
                                </button>
                                <button id="themeToggle" class="btn btn-outline">
                                    🌙
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    }

    private setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn')
        const themeToggle = document.getElementById('themeToggle')

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.authService.logout()
                this.router.navigate('/login')
            })
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme()
            })
        }

        // Initialize theme
        this.updateThemeToggle()
    }

    private toggleTheme() {
        const currentTheme = storageManager.getTheme()
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        storageManager.setTheme(newTheme)
        this.updateThemeToggle()
    }

    private updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle')
        if (themeToggle) {
            const theme = storageManager.getTheme()
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️'
        }
    }
} 