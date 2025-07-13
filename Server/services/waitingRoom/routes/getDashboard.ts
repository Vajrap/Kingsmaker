export async function handleGetDashboard() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WaitingRoom Service Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #fff;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #ff00aa;
            margin-bottom: 10px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #1a1a2e;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #333;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #ff00aa;
        }
        
        .stat-label {
            color: #888;
            margin-top: 5px;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .rooms-section {
            grid-column: 1 / -1;
        }
        
        .rooms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
        }
        
        .room-card {
            background: #1a1a2e;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .room-card:hover {
            border-color: #ff00aa;
            transform: translateY(-2px);
        }
        
        .room-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .room-name {
            font-weight: bold;
            font-size: 1.1em;
            color: #ff00aa;
        }
        
        .room-state {
            background: #333;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            text-transform: uppercase;
        }
        
        .state-active { background: #00ff88; color: #000; }
        .state-waiting { background: #00aaff; color: #fff; }
        .state-full { background: #ffaa00; color: #000; }
        
        .room-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        
        .detail-label {
            color: #888;
            font-size: 0.8em;
            margin-bottom: 2px;
        }
        
        .detail-value {
            color: #fff;
            word-break: break-all;
        }
        
        .players-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #333;
        }
        
        .players-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #ff00aa;
        }
        
        .player-list {
            display: grid;
            gap: 5px;
        }
        
        .player-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 10px;
            background: #333;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .player-name {
            color: #fff;
        }
        
        .player-status {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .status-connected { background: #00ff88; color: #000; }
        .status-disconnected { background: #ff4444; color: #fff; }
        .status-grace_period { background: #ffaa00; color: #000; }
        
        .refresh-btn {
            background: #ff00aa;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .refresh-btn:hover {
            background: #cc0088;
        }
        
        .no-rooms {
            text-align: center;
            color: #888;
            font-style: italic;
            grid-column: 1 / -1;
            padding: 40px;
        }
        
        .auto-refresh {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .auto-refresh input {
            width: 20px;
            height: 20px;
        }
        
        /* Console Log Styles */
        .console-section {
            background: #1a1a2e;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
            height: 400px;
            display: flex;
            flex-direction: column;
        }
        
        .console-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        }
        
        .console-title {
            font-weight: bold;
            color: #ff00aa;
        }
        
        .console-controls {
            display: flex;
            gap: 10px;
        }
        
        .console-btn {
            background: #333;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em;
        }
        
        .console-btn:hover {
            background: #555;
        }
        
        .console-output {
            flex: 1;
            background: #000;
            border-radius: 5px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }
        
        .log-timestamp {
            color: #888;
            font-size: 0.8em;
        }
        
        .log-level-log { color: #fff; }
        .log-level-error { color: #ff4444; }
        .log-level-warn { color: #ffaa00; }
        .log-level-info { color: #ff00aa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 WaitingRoom Service Dashboard</h1>
        <p>Real-time monitoring of game rooms and player activity</p>
    </div>

    <div class="stats" id="stats">
        <div class="stat-card">
            <div class="stat-number" id="totalRooms">0</div>
            <div class="stat-label">Total Rooms</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="activeRooms">0</div>
            <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="waitingRooms">0</div>
            <div class="stat-label">Waiting</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="fullRooms">0</div>
            <div class="stat-label">Full</div>
        </div>
    </div>

    <div class="auto-refresh">
        <input type="checkbox" id="autoRefresh" checked>
        <label for="autoRefresh">Auto-refresh every 5 seconds</label>
        <button class="refresh-btn" onclick="loadRooms()">🔄 Refresh Now</button>
    </div>

    <div class="main-content">
        <div class="rooms-section">
            <h2>Active Rooms</h2>
            <div class="rooms-grid" id="roomsGrid">
                <div class="no-rooms">Loading rooms...</div>
            </div>
        </div>
    </div>

    <div class="console-section">
        <div class="console-header">
            <div class="console-title">📋 Service Logs</div>
            <div class="console-controls">
                <button class="console-btn" onclick="clearLogs()">Clear</button>
                <button class="console-btn" onclick="toggleAutoScroll()">Auto-scroll</button>
            </div>
        </div>
        <div class="console-output" id="consoleOutput">
            <div class="log-entry">
                <span class="log-timestamp">[${new Date().toISOString()}]</span>
                <span class="log-level-info">Dashboard loaded</span>
            </div>
        </div>
    </div>

    <script>
        let autoRefreshInterval;
        let logWebSocket;
        let autoScroll = true;

        // Load rooms data
        async function loadRooms() {
            try {
                const response = await fetch('/api/rooms');
                const result = await response.json();
                
                if (result.status === 'success') {
                    updateStats(result.data);
                    updateRoomsGrid(result.data.rooms);
                } else {
                    console.error('Failed to load rooms:', result.message);
                }
            } catch (error) {
                console.error('Error loading rooms:', error);
            }
        }

        // Update statistics
        function updateStats(data) {
            document.getElementById('totalRooms').textContent = data.total;
            document.getElementById('activeRooms').textContent = data.active;
            document.getElementById('waitingRooms').textContent = data.waiting;
            document.getElementById('fullRooms').textContent = data.full;
        }

        // Update rooms grid
        function updateRoomsGrid(rooms) {
            const grid = document.getElementById('roomsGrid');
            
            if (rooms.length === 0) {
                grid.innerHTML = '<div class="no-rooms">No rooms active</div>';
                return;
            }

            grid.innerHTML = rooms.map(room => \`
                <div class="room-card">
                    <div class="room-header">
                        <div>
                            <div class="room-name">\${room.name}</div>
                            <div class="room-state state-\${room.state}">\${room.state}</div>
                        </div>
                        <div class="detail-value">\${room.currentPlayers}/\${room.maxPlayers} players</div>
                    </div>
                    <div class="room-details">
                        <div class="detail-item">
                            <div class="detail-label">Room ID</div>
                            <div class="detail-value">\${room.id}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Host</div>
                            <div class="detail-value">\${room.hostUsername}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Created</div>
                            <div class="detail-value">\${new Date(room.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Last Activity</div>
                            <div class="detail-value">\${new Date(room.lastActivity).toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Turn Time Limit</div>
                            <div class="detail-value">\${room.turnTimeLimit}s</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Spectators</div>
                            <div class="detail-value">\${room.spectators} (\${room.allowSpectators ? 'Allowed' : 'Disabled'})</div>
                        </div>
                    </div>
                    <div class="players-section">
                        <div class="players-title">Players (\${room.players.length})</div>
                        <div class="player-list">
                            \${room.players.map(player => \`
                                <div class="player-item">
                                    <div class="player-name">\${player.username} \${player.isHost ? '(Host)' : ''}</div>
                                    <div class="player-status status-\${player.connectionStatus}">\${player.connectionStatus}</div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // Auto-refresh functionality
        function setupAutoRefresh() {
            const checkbox = document.getElementById('autoRefresh');
            
            if (checkbox.checked) {
                autoRefreshInterval = setInterval(loadRooms, 5000);
            } else {
                clearInterval(autoRefreshInterval);
            }
        }

        // WebSocket for log streaming
        function connectToLogStream() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = \`\${protocol}//\${window.location.host}/logs\`;
            
            logWebSocket = new WebSocket(wsUrl);
            
            logWebSocket.onopen = function() {
                addLogEntry('info', 'Connected to log stream');
            };
            
            logWebSocket.onmessage = function(event) {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'LOG_ENTRY') {
                        addLogEntry(message.data.level, message.data.message);
                    }
                } catch (error) {
                    console.error('Error parsing log message:', error);
                }
            };
            
            logWebSocket.onclose = function() {
                addLogEntry('warn', 'Log stream disconnected, attempting to reconnect...');
                setTimeout(connectToLogStream, 5000);
            };
            
            logWebSocket.onerror = function(error) {
                addLogEntry('error', 'Log stream error: ' + error);
            };
        }

        // Add log entry to console
        function addLogEntry(level, message) {
            const consoleOutput = document.getElementById('consoleOutput');
            const timestamp = new Date().toISOString();
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = \`
                <span class="log-timestamp">[\${timestamp}]</span>
                <span class="log-level-\${level}">\${message}</span>
            \`;
            
            consoleOutput.appendChild(logEntry);
            
            // Auto-scroll to bottom
            if (autoScroll) {
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
            }
            
            // Keep only last 1000 entries
            while (consoleOutput.children.length > 1000) {
                consoleOutput.removeChild(consoleOutput.firstChild);
            }
        }

        // Clear logs
        function clearLogs() {
            document.getElementById('consoleOutput').innerHTML = '';
        }

        // Toggle auto-scroll
        function toggleAutoScroll() {
            autoScroll = !autoScroll;
            const button = event.target;
            button.textContent = autoScroll ? 'Auto-scroll' : 'Manual-scroll';
        }

        // Event listeners
        document.getElementById('autoRefresh').addEventListener('change', setupAutoRefresh);

        // Initialize
        loadRooms();
        setupAutoRefresh();
        connectToLogStream();
    </script>
</body>
</html>
    `;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
} 