export async function handleGetDashboard() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SessionManager Dashboard</title>
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
            color: #00ff88;
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
            color: #00ff88;
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

        .clients-section {
            grid-column: 1 / -1;
        }

        .clients-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .client-card {
            background: #1a1a2e;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .client-card:hover {
            border-color: #00ff88;
            transform: translateY(-2px);
        }

        .client-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .username {
            font-weight: bold;
            font-size: 1.1em;
            color: #00ff88;
        }

        .user-type {
            background: #333;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            text-transform: uppercase;
        }

        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-INITIAL { background: #ffaa00; color: #000; }
        .status-IN_LOBBY { background: #00aaff; color: #fff; }
        .status-IN_WAITING_ROOM { background: #ff00aa; color: #fff; }
        .status-IN_GAME { background: #00ff88; color: #000; }
        .status-OFFLINE { background: #ff4444; color: #fff; }

        .client-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 0.9em;
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

        .room-info {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #333;
        }

        .refresh-btn {
            background: #00ff88;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .refresh-btn:hover {
            background: #00cc6a;
        }

        .no-clients {
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
            color: #00ff88;
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
            background: #444;
        }

        .console-btn.clear {
            background: #ff4444;
        }

        .console-btn.clear:hover {
            background: #ff6666;
        }

        .console-output {
            flex: 1;
            background: #000;
            border: 1px solid #333;
            border-radius: 5px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
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
            font-size: 10px;
        }

        .log-level {
            font-weight: bold;
            margin: 0 5px;
        }

        .log-level.log { color: #fff; }
        .log-level.error { color: #ff4444; }
        .log-level.warn { color: #ffaa00; }
        .log-level.info { color: #00aaff; }

        .log-message {
            color: #ccc;
        }

        .log-service {
            color: #00ff88;
            font-size: 10px;
            margin-left: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕹️ SessionManager Dashboard</h1>
        <p>Real-time client monitoring and console logs for The Kingsmaker</p>
    </div>

    <div class="auto-refresh">
        <input type="checkbox" id="autoRefresh" checked>
        <label for="autoRefresh">Auto-refresh every 5 seconds</label>
    </div>

    <button class="refresh-btn" onclick="loadClients()">🔄 Refresh Now</button>

    <div class="stats" id="stats">
        <div class="stat-card">
            <div class="stat-number" id="totalClients">-</div>
            <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="inLobby">-</div>
            <div class="stat-label">In Lobby</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="inWaitingRoom">-</div>
            <div class="stat-label">In Waiting Room</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="inGame">-</div>
            <div class="stat-label">In Game</div>
        </div>
    </div>

    <div class="main-content">
        <div class="console-section">
            <div class="console-header">
                <div class="console-title">�� Console Logs (Real-time)</div>
                <div class="console-controls">
                    <button class="console-btn" onclick="toggleAutoScroll()">Auto-scroll</button>
                    <button class="console-btn clear" onclick="clearLogs()">Clear</button>
                </div>
            </div>
            <div class="console-output" id="consoleOutput">
                <div class="log-entry">
                    <span class="log-timestamp">Connecting to log stream...</span>
                </div>
            </div>
        </div>
    </div>

    <div class="clients-section">
        <h2 style="margin-bottom: 20px; color: #00ff88;">Connected Clients</h2>
        <div class="clients-grid" id="clientsGrid">
            <div class="no-clients">Loading clients...</div>
        </div>
    </div>

    <script>
        let autoRefreshInterval;
        let logWebSocket;
        let autoScroll = true;

        // Console Log Management
        function connectToLogStream() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = \`\${protocol}//\${window.location.host}/logs\`;

            logWebSocket = new WebSocket(wsUrl);

            logWebSocket.onopen = function() {
                addLogEntry('info', 'Connected to log stream');
            };

            logWebSocket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'LOG_ENTRY') {
                    addLogEntry(data.data.level, data.data.message, data.data.timestamp, data.data.service);
                }
            };

            logWebSocket.onclose = function() {
                addLogEntry('error', 'Disconnected from log stream');
                // Reconnect after 5 seconds
                setTimeout(connectToLogStream, 5000);
            };

            logWebSocket.onerror = function(error) {
                addLogEntry('error', 'WebSocket error: ' + error);
            };
        }

        function addLogEntry(level, message, timestamp = new Date().toISOString(), service = 'dashboard') {
            const consoleOutput = document.getElementById('consoleOutput');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';

            const time = new Date(timestamp).toLocaleTimeString();
            const levelClass = level === 'log' ? 'log' : level;

            logEntry.innerHTML = \`
                <span class="log-timestamp">[\${time}]</span>
                <span class="log-level \${levelClass}">\${level.toUpperCase()}</span>
                <span class="log-message">\${message}</span>
                <span class="log-service">[\${service}]</span>
            \`;

            consoleOutput.appendChild(logEntry);

            // Auto-scroll to bottom
            if (autoScroll) {
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
            }

            // Limit log entries to prevent memory issues
            const maxEntries = 1000;
            while (consoleOutput.children.length > maxEntries) {
                consoleOutput.removeChild(consoleOutput.firstChild);
            }
        }

        function clearLogs() {
            document.getElementById('consoleOutput').innerHTML = '';
        }

        function toggleAutoScroll() {
            autoScroll = !autoScroll;
            const btn = event.target;
            btn.textContent = autoScroll ? 'Auto-scroll' : 'Manual';
            btn.style.background = autoScroll ? '#333' : '#00ff88';
            btn.style.color = autoScroll ? '#fff' : '#000';
        }

        // Client Management
        function updateStats(clients) {
            const stats = {
                total: clients.length,
                inLobby: clients.filter(c => c.presenceStatus === 'IN_LOBBY').length,
                inWaitingRoom: clients.filter(c => c.presenceStatus === 'IN_WAITING_ROOM').length,
                inGame: clients.filter(c => c.presenceStatus === 'IN_GAME').length
            };

            document.getElementById('totalClients').textContent = stats.total;
            document.getElementById('inLobby').textContent = stats.inLobby;
            document.getElementById('inWaitingRoom').textContent = stats.inWaitingRoom;
            document.getElementById('inGame').textContent = stats.inGame;
        }

        function formatTime(isoString) {
            const date = new Date(isoString);
            return date.toLocaleTimeString();
        }

        function formatDuration(isoString) {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return \`\${diffMins}m ago\`;

            const diffHours = Math.floor(diffMins / 60);
            return \`\${diffHours}h \${diffMins % 60}m ago\`;
        }

        function createClientCard(client) {
            return \`
                <div class="client-card">
                    <div class="client-header">
                        <div>
                            <div class="username">\${client.username}</div>
                            <div class="user-type">\${client.userType}</div>
                        </div>
                        <div class="status-badge status-\${client.presenceStatus}">
                            \${client.presenceStatus.replace(/_/g, ' ')}
                        </div>
                    </div>

                    <div class="client-details">
                        <div class="detail-item">
                            <div class="detail-label">User ID</div>
                            <div class="detail-value">\${client.userId}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Session ID</div>
                            <div class="detail-value">\${client.sessionId.substring(0, 8)}...</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Connected</div>
                            <div class="detail-value">\${formatTime(client.connectedAt)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Last Seen</div>
                            <div class="detail-value">\${formatDuration(client.lastSeen)}</div>
                        </div>
                    </div>

                    \${(client.waitingRoomId || client.gameRoomId) ? \`
                        <div class="room-info">
                            \${client.waitingRoomId ? \`
                                <div class="detail-item">
                                    <div class="detail-label">Waiting Room</div>
                                    <div class="detail-value">\${client.waitingRoomId}</div>
                                </div>
                            \` : ''}
                            \${client.gameRoomId ? \`
                                <div class="detail-item">
                                    <div class="detail-label">Game Room</div>
                                    <div class="detail-value">\${client.gameRoomId}</div>
                                </div>
                            \` : ''}
                        </div>
                    \` : ''}
                </div>
            \`;
        }

        async function loadClients() {
            try {
                const response = await fetch('/api/clients');
                const data = await response.json();

                if (data.success) {
                    const clients = data.data;
                    updateStats(clients);

                    const clientsGrid = document.getElementById('clientsGrid');

                    if (clients.length === 0) {
                        clientsGrid.innerHTML = '<div class="no-clients">No clients connected</div>';
                    } else {
                        clientsGrid.innerHTML = clients.map(createClientCard).join('');
                    }
                } else {
                    console.error('Failed to load clients:', data.message);
                }
            } catch (error) {
                console.error('Error loading clients:', error);
                document.getElementById('clientsGrid').innerHTML =
                    '<div class="no-clients">Error loading clients</div>';
            }
        }

        function setupAutoRefresh() {
            const checkbox = document.getElementById('autoRefresh');

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    autoRefreshInterval = setInterval(loadClients, 5000);
                } else {
                    clearInterval(autoRefreshInterval);
                }
            });

            // Start auto-refresh if checked
            if (checkbox.checked) {
                autoRefreshInterval = setInterval(loadClients, 5000);
            }
        }

        // Initialize
        connectToLogStream();
        loadClients();
        setupAutoRefresh();
    </script>
</body>
</html>
    `;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
