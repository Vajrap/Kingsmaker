import { AuthService } from '@/utility/authService.ts'
import { storageManager } from '@/utility/storageManager.ts'

export class GamePage {
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
                        <h1 class="page-title">Game</h1>
                        <p class="page-subtitle">The game has begun!</p>
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
    }

    private setupEventListeners() {
        // Add back to lobby functionality
        const backBtn = document.getElementById('backToLobby')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '/lobby'
            })
        }
    }
} 