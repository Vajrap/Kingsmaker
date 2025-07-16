import { AuthService } from '@/utility/authService.ts'
import { Router } from '@/utility/router.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class RegisterPage {
    private authService: AuthService
    private router: Router

    constructor() {
        this.authService = new AuthService()
        this.router = new Router()
        this.init()
    }

    private async init() {
        await this.loadTemplate()
    }

    private async loadTemplate() {
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1 class="page-title">Create Account</h1>
                        <p class="page-subtitle">Join KingsMaker today</p>
                    </div>
                    <div class="flex justify-center">
                        <div class="card p-8" style="max-width: 400px; width: 100%;">
                            <p class="text-center mb-4">Registration page coming soon...</p>
                            <button id="backToLogin" class="btn btn-outline w-full">
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            `
        }

        // Add back to login functionality
        const backBtn = document.getElementById('backToLogin')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('/login')
            })
        }
    }
} 