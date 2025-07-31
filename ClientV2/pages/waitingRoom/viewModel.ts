import { storageManager } from '@/utility/storageManager.ts'
import { waitingRoomModel, type WaitingRoomData, type Player } from './model.ts'

interface WaitingRoomWebSocket extends WebSocket {
    reconnectAttempts?: number;
}

export class WaitingRoomPage {
    private ws: WaitingRoomWebSocket | null = null
    private sessionId: string | null = null
    private roomId: string | null = null
    private isConnected: boolean = false
    private roomData: WaitingRoomData | null = null
    private currentPlayer: Player | null = null

    // DOM Elements
    private roomName!: HTMLElement
    private roomIdElement!: HTMLElement
    private turnTimeLimit!: HTMLElement
    private spectatorInfo!: HTMLElement
    private statusIndicator!: HTMLElement
    private statusText!: HTMLElement
    private gameStatusText!: HTMLElement
    private readyCount!: HTMLElement
    private playersLoading!: HTMLElement
    private playersList!: HTMLElement
    private emptySlots!: HTMLElement
    private readyBtn!: HTMLButtonElement
    private readyBtnText!: HTMLElement
    private readyIndicator!: HTMLElement
    private gameStartingModal!: HTMLElement
    private alertContainer!: HTMLElement

    constructor() {
        this.sessionId = storageManager.getSessionId()
        this.roomId = storageManager.getCurrentRoomId()
        this.init()
    }

    private async init() {
        // Verify session and room data
        if (!this.sessionId) {
            console.log('No session found, redirecting to login')
            window.location.href = '/pagesAndComponent/login/index.html'
            return
        }

        if (!this.roomId) {
            console.log('No room ID found, redirecting to lobby')
            window.location.href = '/pagesAndComponent/lobby/index.html'
            return
        }

        // No need to load template - it's already in the HTML
        this.setupElements()
        this.setupEventListeners()
        this.loadCSS()
        this.connectToWaitingRoom()
    }

    private async loadTemplate() {
        const response = await fetch('/pagesAndComponent/waitingRoom/view.html')
        const html = await response.text()
        
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
            mainContent.innerHTML = html
        }
    }

    private loadCSS() {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/pagesAndComponent/waitingRoom/style.css'
        document.head.appendChild(link)
    }

    private setupElements() {
        // Room info elements
        this.roomName = document.getElementById('roomName') as HTMLElement
        this.roomIdElement = document.getElementById('roomId') as HTMLElement
        this.turnTimeLimit = document.getElementById('turnTimeLimit') as HTMLElement
        this.spectatorInfo = document.getElementById('spectatorInfo') as HTMLElement
        
        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator') as HTMLElement
        this.statusText = document.getElementById('statusText') as HTMLElement
        this.gameStatusText = document.getElementById('gameStatusText') as HTMLElement
        this.readyCount = document.getElementById('readyCount') as HTMLElement
        
        // Players elements
        this.playersLoading = document.getElementById('playersLoading') as HTMLElement
        this.playersList = document.getElementById('playersList') as HTMLElement
        this.emptySlots = document.getElementById('emptySlots') as HTMLElement
        
        // Ready elements
        this.readyBtn = document.getElementById('readyBtn') as HTMLButtonElement
        this.readyBtnText = document.getElementById('readyBtnText') as HTMLElement
        this.readyIndicator = document.getElementById('readyIndicator') as HTMLElement
        
        // Modal and alerts
        this.gameStartingModal = document.getElementById('gameStartingModal') as HTMLElement
        this.alertContainer = document.getElementById('alertContainer') as HTMLElement
    }

    private setupEventListeners() {
        // Action buttons
        document.getElementById('leaveRoomBtn')?.addEventListener('click', () => this.leaveRoom())
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showAlert('Room settings coming soon!', 'info'))
        
        // Ready button
        this.readyBtn.addEventListener('click', () => this.toggleReady())
    }

    private connectToWaitingRoom() {
        this.updateConnectionStatus('connecting', 'Connecting to waiting room...')
        this.showPlayersLoading(true)

        const wsUrl = `ws://localhost:3000/waitingRoom`
        this.ws = new WebSocket(wsUrl) as WaitingRoomWebSocket
        this.ws.reconnectAttempts = 0

        this.ws.onopen = () => {
            console.log('Connected to waiting room WebSocket')
            this.isConnected = true
            this.updateConnectionStatus('connected', 'Connected to waiting room')
            
            // Send connect message
            this.sendMessage({
                type: 'connect',
                sessionId: this.sessionId,
                roomId: this.roomId
            })
        }

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this.handleWebSocketMessage(data)
            } catch (error) {
                console.error('Error parsing WebSocket message:', error)
            }
        }

        this.ws.onclose = () => {
            console.log('Waiting room WebSocket connection closed')
            this.isConnected = false
            this.updateConnectionStatus('disconnected', 'Connection lost')
            this.handleReconnection()
        }

        this.ws.onerror = (error) => {
            console.error('Waiting room WebSocket error:', error)
            this.updateConnectionStatus('disconnected', 'Connection error')
        }
    }

    private handleWebSocketMessage(data: any) {
        switch (data.type) {
            case 'roomState':
                this.handleRoomState(data.room)
                break
                
            case 'playerConnected':
                this.showAlert(`${data.player.username} connected`, 'info')
                break
                
            case 'playerLeft':
                this.showAlert(`${data.username} left the room`, 'info')
                break
                
            case 'playerReadyUpdate':
                this.showAlert(`${data.username} is ${data.isReady ? 'ready' : 'not ready'}`, 'info')
                break
                
            case 'readyStatusUpdated':
                this.updateReadyButton(data.isReady)
                break
                
            case 'gameStarting':
                this.handleGameStarting(data.message)
                break
                
            case 'gameStarted':
                this.handleGameStarted()
                break
                
            case 'leftRoom':
                this.handleLeftRoom()
                break
                
            case 'error':
                this.showAlert(data.message, 'error')
                break
                
            default:
                console.log('Unknown message type:', data.type)
        }
    }

    private handleRoomState(roomData: WaitingRoomData) {
        this.roomData = roomData
        this.showPlayersLoading(false)
        
        // Find current player
        const userInfo = storageManager.getUserInfo()
        if (userInfo) {
            this.currentPlayer = roomData.players.find(p => p.username === userInfo.username) || null
        }
        
        this.updateRoomInfo()
        this.updatePlayers()
        this.updateGameStatus()
        this.updateReadyButton(this.currentPlayer?.isReady || false)
    }

    private updateRoomInfo() {
        if (!this.roomData) return
        
        this.roomName.textContent = this.roomData.name
        this.roomIdElement.textContent = `Room ID: ${this.roomData.id}`
        this.turnTimeLimit.textContent = `Turn Limit: ${waitingRoomModel.formatTurnTimeLimit(this.roomData.turnTimeLimit)}`
        this.spectatorInfo.textContent = `Spectators: ${this.roomData.allowSpectators ? 'Allowed' : 'Not allowed'}`
    }

    private updatePlayers() {
        if (!this.roomData) return
        
        // Update players list
        this.playersList.innerHTML = this.roomData.players.map(player => {
            const status = waitingRoomModel.getPlayerDisplayStatus(player)
            const isReady = player.isReady
            const isDisconnected = status.includes('Disconnected')
            
            return `
                <div class="player-card ${isReady ? 'ready' : ''} ${isDisconnected ? 'disconnected' : ''}">
                    <div class="player-avatar">
                        ${player.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="player-info">
                        <div class="player-name">${this.escapeHtml(player.username)}</div>
                        <div class="player-status">${status}</div>
                    </div>
                    <div class="player-ready-indicator">
                        ${isReady ? '<span class="ready-icon">✓</span>' : ''}
                    </div>
                </div>
            `
        }).join('')
        
        // Update empty slots
        const emptySlotCount = this.roomData.maxPlayers - this.roomData.players.length
        this.emptySlots.innerHTML = Array(emptySlotCount).fill(0).map(() => `
            <div class="empty-slot">
                <span>👤</span>
                <span>Waiting for player...</span>
            </div>
        `).join('')
    }

    private updateGameStatus() {
        if (!this.roomData) return
        
        const readyStatus = waitingRoomModel.getReadyStatus(this.roomData.players)
        
        // Update ready count
        this.readyCount.textContent = `${readyStatus.ready}/${readyStatus.total} ready`
        
        // Update game status text
        if (this.roomData.state === 'STARTING') {
            this.gameStatusText.textContent = 'Game starting...'
        } else if (this.roomData.state === 'IN_PROGRESS') {
            this.gameStatusText.textContent = 'Game in progress'
        } else if (readyStatus.allReady) {
            this.gameStatusText.textContent = 'All players ready! Starting soon...'
        } else if (this.roomData.players.length < 2) {
            this.gameStatusText.textContent = 'Waiting for more players...'
        } else {
            this.gameStatusText.textContent = 'Waiting for players to ready up...'
        }
    }

    private updateReadyButton(isReady: boolean) {
        if (isReady) {
            this.readyBtn.classList.add('hidden')
            this.readyIndicator.classList.remove('hidden')
        } else {
            this.readyBtn.classList.remove('hidden')
            this.readyIndicator.classList.add('hidden')
            this.readyBtnText.textContent = 'Ready Up'
        }
    }

    private toggleReady() {
        const isCurrentlyReady = this.currentPlayer?.isReady || false
        
        this.sendMessage({
            type: 'playerReady',
            sessionId: this.sessionId,
            roomId: this.roomId,
            isReady: !isCurrentlyReady
        })
    }

    private leaveRoom() {
        this.sendMessage({
            type: 'leaveRoom',
            sessionId: this.sessionId,
            roomId: this.roomId
        })
    }

    private handleGameStarting(message: string) {
        this.showGameStartingModal(message)
    }

    private handleGameStarted() {
        this.hideGameStartingModal()
        this.showAlert('Game started! Redirecting...', 'success')
        
        // Update user status and navigate to game
        storageManager.setUserStatus('IN_GAME')
        
        setTimeout(() => {
            window.location.href = '/pagesAndComponent/game/index.html'
        }, 1000)
    }

    private handleLeftRoom() {
        this.showAlert('Left room successfully. Returning to lobby...', 'success')
        
        // Clear room data and navigate back to lobby
        storageManager.clearCurrentRoomId()
        storageManager.setUserStatus('IN_LOBBY')
        
        setTimeout(() => {
            window.location.href = '/lobby'
        }, 1000)
    }

    private handleReconnection() {
        if (!this.ws) return
        
        const maxReconnectAttempts = 5
        const reconnectDelay = 2000 * Math.pow(2, this.ws.reconnectAttempts || 0)
        
        if ((this.ws.reconnectAttempts || 0) < maxReconnectAttempts) {
            this.updateConnectionStatus('connecting', `Reconnecting in ${reconnectDelay/1000}s...`)
            
            setTimeout(() => {
                if (this.ws) {
                    this.ws.reconnectAttempts = (this.ws.reconnectAttempts || 0) + 1
                }
                this.connectToWaitingRoom()
            }, reconnectDelay)
        } else {
            this.updateConnectionStatus('disconnected', 'Connection failed')
            this.showAlert('Unable to connect to waiting room. Returning to lobby...', 'error')
            setTimeout(() => window.location.href = '/pagesAndComponent/lobby/index.html', 3000)
        }
    }

    private sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        }
    }

    // UI Helper Methods
    private updateConnectionStatus(status: 'connected' | 'connecting' | 'disconnected', text: string) {
        this.statusIndicator.className = `status-indicator ${status}`
        this.statusText.textContent = text
    }

    private showPlayersLoading(show: boolean) {
        this.playersLoading.classList.toggle('hidden', !show)
    }

    private showGameStartingModal(message: string) {
        const gameStartingText = document.getElementById('gameStartingText')
        if (gameStartingText) {
            gameStartingText.textContent = message
        }
        this.gameStartingModal.classList.remove('hidden')
    }

    private hideGameStartingModal() {
        this.gameStartingModal.classList.add('hidden')
    }

    private showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning') {
        const alert = document.createElement('div')
        alert.className = `alert alert-${type}`
        alert.innerHTML = `
            <span class="alert-message">${this.escapeHtml(message)}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">✕</button>
        `
        
        this.alertContainer.appendChild(alert)
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove()
            }
        }, 5000)
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
    }

    // Cleanup method
    public destroy() {
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }
}

// Initialize the page
new WaitingRoomPage() 