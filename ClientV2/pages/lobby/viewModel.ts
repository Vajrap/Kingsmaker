import { storageManager } from '@/utility/storageManager.ts'
import { lobbyModel, type GameRoom, type CreateRoomSettings } from './model.ts'

interface LobbyWebSocket extends WebSocket {
    reconnectAttempts?: number;
}

export class LobbyPage {
    private ws: LobbyWebSocket | null = null
    private sessionId: string | null = null
    private isConnected: boolean = false
    private rooms: GameRoom[] = []

    // DOM Elements
    private welcomeText!: HTMLElement
    private statusIndicator!: HTMLElement
    private statusText!: HTMLElement
    private roomsList!: HTMLElement
    private roomsLoading!: HTMLElement
    private emptyRooms!: HTMLElement
    private roomsTable!: HTMLElement
    private createRoomModal!: HTMLElement
    private createRoomForm!: HTMLFormElement
    private alertContainer!: HTMLElement

    // Form elements
    private roomNameInput!: HTMLInputElement
    private maxPlayersSelect!: HTMLSelectElement
    private turnTimeLimitSelect!: HTMLSelectElement
    private allowSpectatorsCheckbox!: HTMLInputElement
    private allowAnonymousSpectatorsCheckbox!: HTMLInputElement
    private roomNameError!: HTMLElement
    private createRoomBtnText!: HTMLElement
    private createRoomSpinner!: HTMLElement

    constructor() {
        this.sessionId = storageManager.getSessionId()
        this.init()
    }

    private async init() {
        // Verify session first
        if (!this.sessionId) {
            console.log('No session found, redirecting to login')
            window.location.href = '/pagesAndComponent/login/index.html'
            return
        }

        // No need to load template - it's already in the HTML
        this.setupElements()
        this.setupEventListeners()
        this.loadCSS()
        this.setupUserInfo()
        this.connectToLobby()
    }

    private loadCSS() {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/pagesAndComponent/lobby/style.css'
        document.head.appendChild(link)
    }

    private setupElements() {
        // Header elements
        this.welcomeText = document.getElementById('welcomeText') as HTMLElement
        
        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator') as HTMLElement
        this.statusText = document.getElementById('statusText') as HTMLElement
        
        // Room list elements
        this.roomsList = document.getElementById('roomsList') as HTMLElement
        this.roomsLoading = document.getElementById('roomsLoading') as HTMLElement
        this.emptyRooms = document.getElementById('emptyRooms') as HTMLElement
        this.roomsTable = document.getElementById('roomsTable') as HTMLElement
        
        // Modal elements
        this.createRoomModal = document.getElementById('createRoomModal') as HTMLElement
        this.createRoomForm = document.getElementById('createRoomForm') as HTMLFormElement
        this.alertContainer = document.getElementById('alertContainer') as HTMLElement
        
        // Form elements
        this.roomNameInput = document.getElementById('roomName') as HTMLInputElement
        this.maxPlayersSelect = document.getElementById('maxPlayers') as HTMLSelectElement
        this.turnTimeLimitSelect = document.getElementById('turnTimeLimit') as HTMLSelectElement
        this.allowSpectatorsCheckbox = document.getElementById('allowSpectators') as HTMLInputElement
        this.allowAnonymousSpectatorsCheckbox = document.getElementById('allowAnonymousSpectators') as HTMLInputElement
        this.roomNameError = document.getElementById('roomNameError') as HTMLElement
        this.createRoomBtnText = document.getElementById('createRoomBtnText') as HTMLElement
        this.createRoomSpinner = document.getElementById('createRoomSpinner') as HTMLElement
    }

    private setupEventListeners() {
        // Action buttons
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshRooms())
        document.getElementById('createRoomBtn')?.addEventListener('click', () => this.showCreateRoomModal())
        document.getElementById('profileBtn')?.addEventListener('click', () => this.showAlert('Profile settings coming soon!', 'info'))
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showAlert('Settings coming soon!', 'info'))
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme())
        
        // Modal controls
        document.getElementById('closeCreateModal')?.addEventListener('click', () => this.hideCreateRoomModal())
        document.getElementById('cancelCreateRoom')?.addEventListener('click', () => this.hideCreateRoomModal())
        document.getElementById('confirmCreateRoom')?.addEventListener('click', () => this.handleCreateRoom())
        
        // Form submission
        this.createRoomForm.addEventListener('submit', (e) => {
            e.preventDefault()
            this.handleCreateRoom()
        })

        // Real-time validation
        this.roomNameInput.addEventListener('input', () => this.validateRoomName())
        
        // Close modal on backdrop click
        this.createRoomModal.addEventListener('click', (e) => {
            if (e.target === this.createRoomModal) {
                this.hideCreateRoomModal()
            }
        })
    }

    private setupUserInfo() {
        const userInfo = storageManager.getUserInfo()
        if (userInfo) {
            this.welcomeText.textContent = `Welcome, ${userInfo.username}!`
        }
    }

    private connectToLobby() {
        if (!this.sessionId) {
            this.showAlert('No session found. Please login again.', 'error')
            window.location.href = '/pagesAndComponent/login/index.html'
            return
        }

        this.updateConnectionStatus('connecting', 'Connecting to lobby...')

        const wsUrl = `ws://localhost:3000/lobby`
        this.ws = new WebSocket(wsUrl) as LobbyWebSocket
        this.ws.reconnectAttempts = 0

        this.ws.onopen = () => {
            console.log('Connected to lobby WebSocket')
            this.isConnected = true
            this.updateConnectionStatus('connected', 'Connected to lobby')
            
            // Send connect message
            this.sendMessage({
                type: 'connect',
                sessionId: this.sessionId
            })
            
            // Request room list
            this.requestRoomList()
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
            console.log('Lobby WebSocket connection closed')
            this.isConnected = false
            this.updateConnectionStatus('disconnected', 'Connection lost')
            this.handleReconnection()
        }

        this.ws.onerror = (error) => {
            console.error('Lobby WebSocket error:', error)
            this.updateConnectionStatus('disconnected', 'Connection error')
        }
    }

    private handleWebSocketMessage(data: any) {
        switch (data.type) {
            case 'connected':
                this.showAlert('Successfully connected to lobby!', 'success')
                break
                
            case 'roomList':
                this.rooms = data.rooms || []
                this.renderRoomsList()
                break
                
            case 'roomsUpdated':
                this.rooms = data.rooms || []
                this.renderRoomsList()
                break
                
            case 'roomCreated':
                this.handleRoomCreated(data.data)
                break
                
            case 'joinedRoom':
                this.handleJoinedRoom(data.roomId)
                break
                
            case 'playerJoinedLobby':
                this.showAlert(`${data.player.username} joined the lobby`, 'info')
                break
                
            case 'error':
                this.showAlert(data.message, 'error')
                this.setCreateRoomLoading(false)
                break
                
            default:
                console.log('Unknown message type:', data.type)
        }
    }

    private handleReconnection() {
        if (!this.ws) return
        
        const maxReconnectAttempts = 5
        const reconnectDelay = 2000 * Math.pow(2, this.ws.reconnectAttempts || 0) // Exponential backoff
        
        if ((this.ws.reconnectAttempts || 0) < maxReconnectAttempts) {
            this.updateConnectionStatus('connecting', `Reconnecting in ${reconnectDelay/1000}s...`)
            
            setTimeout(() => {
                if (this.ws) {
                    this.ws.reconnectAttempts = (this.ws.reconnectAttempts || 0) + 1
                }
                this.connectToLobby()
            }, reconnectDelay)
        } else {
            this.updateConnectionStatus('disconnected', 'Connection failed')
            this.showAlert('Unable to connect to lobby. Please refresh the page.', 'error')
        }
    }

    private sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        }
    }

    private requestRoomList() {
        this.showRoomsLoading(true)
        this.sendMessage({ type: 'getRooms' })
    }

    private refreshRooms() {
        this.requestRoomList()
        this.showAlert('Refreshing room list...', 'info')
    }

    private renderRoomsList() {
        this.showRoomsLoading(false)
        
        if (this.rooms.length === 0) {
            this.showEmptyRooms(true)
            this.showRoomsTable(false)
            return
        }
        
        this.showEmptyRooms(false)
        this.showRoomsTable(true)
        
        this.roomsList.innerHTML = this.rooms.map(room => {
            const statusDisplay = lobbyModel.getRoomStateDisplay(room.state)
            const playerCount = room.players.length
            const isFull = playerCount >= room.maxPlayers
            const canJoin = room.state === 'WAITING' && !isFull
            
            return `
                <tr>
                    <td class="room-name">${this.escapeHtml(room.name)}</td>
                    <td>
                        <div class="player-count">
                            <span class="player-count-text ${isFull ? 'player-count-full' : ''}">${playerCount}/${room.maxPlayers}</span>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusDisplay.className}">${statusDisplay.text}</span>
                    </td>
                    <td>${lobbyModel.formatTurnTimeLimit(room.turnTimeLimit)}</td>
                    <td>${room.allowSpectators ? 'Yes' : 'No'}</td>
                    <td>
                        ${canJoin 
                            ? `<button class="btn btn-small btn-primary" onclick="lobbyInstance.joinRoom('${room.id}')">Join</button>`
                            : `<button class="btn btn-small" disabled>${isFull ? 'Full' : 'Unavailable'}</button>`
                        }
                    </td>
                </tr>
            `
        }).join('')
        
        // Make this instance available globally for button clicks
        ;(window as any).lobbyInstance = this
    }

    private showCreateRoomModal() {
        this.createRoomModal.classList.remove('hidden')
        this.roomNameInput.focus()
    }

    private hideCreateRoomModal() {
        this.createRoomModal.classList.add('hidden')
        this.resetCreateRoomForm()
    }

    private resetCreateRoomForm() {
        this.createRoomForm.reset()
        this.roomNameError.classList.add('hidden')
        this.setCreateRoomLoading(false)
    }

    private validateRoomName(): boolean {
        const roomName = this.roomNameInput.value.trim()
        this.roomNameError.classList.add('hidden')
        
        if (!roomName) {
            this.showFormError('Room name is required')
            return false
        }
        
        if (roomName.length < 3) {
            this.showFormError('Room name must be at least 3 characters')
            return false
        }
        
        if (roomName.length > 30) {
            this.showFormError('Room name must be less than 30 characters')
            return false
        }
        
        return true
    }

    private showFormError(message: string) {
        this.roomNameError.textContent = message
        this.roomNameError.classList.remove('hidden')
    }

    private handleCreateRoom() {
        if (!this.validateRoomName()) return
        
        const settings: CreateRoomSettings = {
            roomName: lobbyModel.sanitizeRoomName(this.roomNameInput.value),
            maxPlayers: parseInt(this.maxPlayersSelect.value) as 2 | 3 | 4,
            turnTimeLimit: parseInt(this.turnTimeLimitSelect.value),
            allowSpectators: this.allowSpectatorsCheckbox.checked,
            allowAnonymousSpectators: this.allowAnonymousSpectatorsCheckbox.checked
        }
        
        const validation = lobbyModel.validateCreateRoomSettings(settings)
        if (!validation.isValid) {
            this.showAlert(validation.errors[0], 'error')
            return
        }
        
        this.setCreateRoomLoading(true)
        
        // Send create room message
        this.sendMessage({
            type: 'createRoom',
            sessionId: this.sessionId,
            roomData: {
                name: settings.roomName,
                state: 'WAITING',
                players: [],
                maxPlayers: settings.maxPlayers,
                turnTimeLimit: settings.turnTimeLimit,
                allowSpectators: settings.allowSpectators,
                allowAnonymousSpectators: settings.allowAnonymousSpectators,
                spectators: []
            }
        })
    }

    private handleRoomCreated(roomData: any) {
        this.setCreateRoomLoading(false)
        this.hideCreateRoomModal()
        this.showAlert('Room created successfully! Joining room...', 'success')
        
        // Update user status and navigate to waiting room
        storageManager.setUserStatus('IN_WAITING_ROOM')
        storageManager.setCurrentRoomId(roomData.roomId)
        
        // Navigate to waiting room
        window.location.href = '/pagesAndComponent/waitingRoom/index.html'
    }

    private joinRoom(roomId: string) {
        if (!this.isConnected) {
            this.showAlert('Not connected to lobby. Please try again.', 'error')
            return
        }
        
        this.sendMessage({
            type: 'joinRoom',
            sessionId: this.sessionId,
            roomId: roomId
        })
    }

    private handleJoinedRoom(roomId: string) {
        this.showAlert('Joined room successfully!', 'success')
        
        // Update user status and navigate to waiting room
        storageManager.setUserStatus('IN_WAITING_ROOM')
        storageManager.setCurrentRoomId(roomId)
        
        // Navigate to waiting room
        window.location.href = '/pagesAndComponent/waitingRoom/index.html'
    }

    // UI Helper Methods
    private updateConnectionStatus(status: 'connected' | 'connecting' | 'disconnected', text: string) {
        this.statusIndicator.className = `status-indicator ${status}`
        this.statusText.textContent = text
    }

    private showRoomsLoading(show: boolean) {
        this.roomsLoading.classList.toggle('hidden', !show)
    }

    private showEmptyRooms(show: boolean) {
        this.emptyRooms.classList.toggle('hidden', !show)
    }

    private showRoomsTable(show: boolean) {
        this.roomsTable.classList.toggle('hidden', !show)
    }

    private setCreateRoomLoading(loading: boolean) {
        const confirmBtn = document.getElementById('confirmCreateRoom') as HTMLButtonElement
        confirmBtn.disabled = loading
        this.createRoomBtnText.classList.toggle('hidden', loading)
        this.createRoomSpinner.classList.toggle('hidden', !loading)
    }

    private toggleTheme() {
        const body = document.body
        const isDark = body.classList.contains('dark')
        body.classList.toggle('dark', !isDark)
        body.classList.toggle('light', isDark)
        localStorage.setItem('theme', isDark ? 'light' : 'dark')
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
        
        // Add slide-in animation
        requestAnimationFrame(() => {
            alert.style.transform = 'translateX(0)'
        })
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
        
        // Remove global reference
        delete (window as any).lobbyInstance
    }
}

// Initialize the page
new LobbyPage() 