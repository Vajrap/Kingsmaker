import { AuthService } from '@/utility/authService.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class LoginPage {
    private authService: AuthService
    private form!: HTMLFormElement
    private usernameInput!: HTMLInputElement
    private passwordInput!: HTMLInputElement
    private guestBtn!: HTMLButtonElement
    private registerBtn!: HTMLButtonElement
    private themeToggle!: HTMLButtonElement
    private alertContainer!: HTMLElement

    constructor() {
        this.authService = new AuthService()
        this.init()
    }

    private async init() {
        // No need to load template - it's already in the HTML
        this.setupElements()
        this.setupEventListeners()
        this.setupTheme()
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
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault()
                await this.handleLogin()
            })
        }

        if (this.guestBtn) {
            this.guestBtn.addEventListener('click', async () => {
                await this.handleGuestLogin()
            })
        }

        if (this.registerBtn) {
            this.registerBtn.addEventListener('click', () => {
                window.location.href = '/pagesAndComponent/register/index.html'
            })
        }

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme()
            })
        }
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
                this.showAlert('Login successful! Redirecting...', 'success')
                // Simple redirect based on user status
                setTimeout(() => {
                    this.routeBasedOnStatus(result.presenceStatus)
                }, 1000)
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
                this.showAlert('Guest login successful! Redirecting...', 'success')
                setTimeout(() => {
                    this.routeBasedOnStatus(result.presenceStatus)
                }, 1000)
            } else {
                this.showAlert('Guest login failed', 'error')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Guest login failed. Please try again.'
            this.showAlert(errorMessage, 'error')
            console.error('Guest login error:', error)
        } finally {
            this.setLoading(false)
        }
    }

    private routeBasedOnStatus(status: string) {
        switch (status) {
            case 'IN_LOBBY':
                window.location.href = '/pagesAndComponent/lobby/index.html'
                break
            case 'IN_WAITING_ROOM':
                window.location.href = '/pagesAndComponent/waitingRoom/index.html'
                break
            case 'IN_GAME':
                window.location.href = '/pagesAndComponent/game/index.html'
                break
            default:
                window.location.href = '/pagesAndComponent/lobby/index.html'
        }
    }

    private setLoading(isLoading: boolean) {
        const submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement
        const guestBtn = this.guestBtn
        
        if (submitBtn) {
            submitBtn.disabled = isLoading
            submitBtn.textContent = isLoading ? 'Signing in...' : 'Login'
        }
        
        if (guestBtn) {
            guestBtn.disabled = isLoading
            guestBtn.textContent = isLoading ? 'Connecting...' : 'Continue as Guest'
        }
    }

    private showAlert(message: string, type: 'success' | 'error') {
        this.alertContainer.textContent = message
        this.alertContainer.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`
        this.alertContainer.classList.remove('hidden')

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

// Initialize the page
new LoginPage()