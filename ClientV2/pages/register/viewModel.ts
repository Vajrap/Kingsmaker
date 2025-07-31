import { AuthService } from '@/utility/authService.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class RegisterPage {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
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
                        <h1 class="page-title">Register</h1>
                        <p class="page-subtitle">Create your account</p>
                    </div>
                    <div class="flex justify-center">
                        <div class="card p-8" style="max-width: 600px; width: 100%;">
                            <p class="text-center mb-4">Registration page coming soon...</p>
                            <button id="backToLogin" class="btn btn-outline w-full">
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            `
        }
    }

    private setupEventListeners() {
        // Add back to login functionality
        const backBtn = document.getElementById('backToLogin')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '/pagesAndComponent/login/index.html'
            })
        }
    }
} 