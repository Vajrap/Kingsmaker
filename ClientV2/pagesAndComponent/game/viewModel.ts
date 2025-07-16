import { AuthService } from '@/utility/authService.ts'
import { Router } from '@/utility/router.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class GamePage {
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
                        <h1 class="page-title">Game</h1>
                        <p class="page-subtitle">Battle in progress...</p>
                    </div>
                    <div class="flex justify-center">
                        <div class="card p-8" style="max-width: 600px; width: 100%;">
                            <p class="text-center mb-4">Game page coming soon...</p>
                            <button id="backToLobby" class="btn btn-outline w-full">
                                Back to Lobby
                            </button>
                        </div>
                    </div>
                </div>
            `
        }

        // Add back to lobby functionality
        const backBtn = document.getElementById('backToLobby')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.navigate('/lobby')
            })
        }
    }
} 