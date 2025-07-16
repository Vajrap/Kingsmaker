import { AuthService } from '@/utility/authService.ts'
import { Router } from '@/utility/router.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class LoginPage {
    private authService: AuthService
    private router: Router
    private form!: HTMLFormElement
    private usernameInput!: HTMLInputElement
    private passwordInput!: HTMLInputElement
    private guestBtn!: HTMLButtonElement
    private registerBtn!: HTMLButtonElement
    private themeToggle!: HTMLButtonElement
    private alertContainer!: HTMLElement

    constructor() {
        this.authService = new AuthService()
        this.router = new Router()
        this.init()
    }

    private async init() {
        await this.loadTemplate()
        this.setupElements()
        this.setupEventListeners()
        this.setupTheme()
    }

    private async loadTemplate() {
        // Load and inject the HTML template
        const response = await fetch('/pagesAndComponent/login/view.html')
        const html = await response.text()
        
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
            mainContent.innerHTML = html
        }
    }

    private setupElements() {
        this.form = document.getElementById('loginForm') as HTMLFormElement
        this.usernameInput = document.getElementById('username') as HTMLInputElement
        this.passwordInput = document.getElementById('password') as HTMLInputElement
        this.guestBtn = document.getElementById('guestBtn') as HTMLButtonElement
        this.registerBtn = document.getElementById('registerBtn') as HTMLButtonElement
        this.themeToggle = document.getElementById('themeToggle') as HTMLButtonElement
        this.alertContainer = document.getElementById('alertContainer') as HTMLElement
    }

    private setupEventListeners() {
        // Login form submission
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault()
            await this.handleLogin()
        })

        // Guest login
        this.guestBtn.addEventListener('click', async () => {
            await this.handleGuestLogin()
        })

        // Register navigation
        this.registerBtn.addEventListener('click', () => {
            this.router.navigate('/register')
        })

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme()
        })

        // Enter key handling
        this.passwordInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.handleLogin()
            }
        })
    }

    private setupTheme() {
        storageManager.initTheme()
        this.updateThemeToggle()
    }

    private async handleLogin() {
        const username = this.usernameInput.value.trim()
        const password = this.passwordInput.value

        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'error')
            return
        }

        this.setLoading(true)
        this.hideAlert()

        try {
            const result = await this.authService.login({ username, password })
            
            if (result) {
                this.showAlert('Login successful!', 'success')
                // Route based on user status
                this.routeBasedOnStatus(result.presenceStatus)
            } else {
                this.showAlert('Invalid username or password', 'error')
            }
        } catch (error) {
            // Show the actual error message from the server
            const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
            this.showAlert(errorMessage, 'error')
            console.error('Login error:', error)
        } finally {
            this.setLoading(false)
        }
    }

    private async handleGuestLogin() {
        this.setLoading(true)
        this.hideAlert()

        try {
            const result = await this.authService.guestLogin()
            
            if (result) {
                this.showAlert('Guest login successful!', 'success')
                // Route based on user status
                this.routeBasedOnStatus(result.presenceStatus)
            } else {
                this.showAlert('Guest login failed. Please try again.', 'error')
            }
        } catch (error) {
            // Show the actual error message from the server
            const errorMessage = error instanceof Error ? error.message : 'Guest login failed. Please try again.'
            this.showAlert(errorMessage, 'error')
            console.error('Guest login error:', error)
        } finally {
            this.setLoading(false)
        }
    }

    private routeBasedOnStatus(status: string) {
        setTimeout(() => {
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
        }, 1000)
    }

    private setLoading(isLoading: boolean) {
        const submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement
        
        if (isLoading) {
            submitBtn.disabled = true
            submitBtn.textContent = 'Logging in...'
            this.guestBtn.disabled = true
        } else {
            submitBtn.disabled = false
            submitBtn.textContent = 'Login'
            this.guestBtn.disabled = false
        }
    }

    private showAlert(message: string, type: 'success' | 'error' | 'info') {
        this.alertContainer.className = `alert alert-${type}`
        this.alertContainer.textContent = message
        this.alertContainer.classList.remove('hidden')
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideAlert()
            }, 3000)
        }
    }

    private hideAlert() {
        this.alertContainer.classList.add('hidden')
    }

    private toggleTheme() {
        const currentTheme = storageManager.getTheme()
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        storageManager.setTheme(newTheme)
        this.updateThemeToggle()
    }

    private updateThemeToggle() {
        const theme = storageManager.getTheme()
        this.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️'
    }
}