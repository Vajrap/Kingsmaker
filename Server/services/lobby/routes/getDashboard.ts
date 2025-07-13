export async function handleGetDashboard() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lobby Service Dashboard</title>
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
            color: #00aaff;
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
            color: #00aaff;
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
            border-color: #00aaff;
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
            color: #00aaff;
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
        
        .status-connected { background: #00ff88; color: #000; }
        .status-disconnected { background: #ff4444; color: #fff; }
        .status-grace_period { background: #ffaa00; color: #000; }
        
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
            background: #00aaff;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .refresh-btn:hover {
            background: #0088cc;
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
            color: #00aaff;
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
        .log-level-info { color: #00aaff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Lobby Service Dashboard</h1>
        <p>Real-time monitoring of lobby connections and activity</p>
    </div>

    <div class="stats" id="stats">
        <div class="stat-card">
            <div class="stat-number" id="totalClients">0</div>
            <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="connectedClients">0</div>
            <div class="stat-label">Connected</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="disconnectedClients">0</div>
            <div class="stat-label">Disconnected</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="gracePeriodClients">0</div>
            <div class="stat-label">Grace Period</div>
        </div>
    </div>

    <div class="auto-refresh">
        <input type="checkbox" id="autoRefresh" checked>
        <label for="autoRefresh">Auto-refresh every 5 seconds</label>
        <button class="refresh-btn" onclick="loadClients()">🔄 Refresh Now</button>
    </div>

    <div class="main-content">
        <div class="clients-section">
            <h2>Connected Clients</h2>
            <div class="clients-grid" id="clientsGrid">
                <div class="no-clients">Loading clients...</div>
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

        // Load clients data
        async function loadClients() {
            try {
                const response = await fetch('/api/clients');
                const result = await response.json();
                
                if (result.status === 'success') {
                    updateStats(result.data);
                    updateClientsGrid(result.data.clients);
                } else {
                    console.error('Failed to load clients:', result.message);
                }
            } catch (error) {
                console.error('Error loading clients:', error);
            }
        }

        // Update statistics
        function updateStats(data) {
            document.getElementById('totalClients').textContent = data.total;
            document.getElementById('connectedClients').textContent = data.connected;
            document.getElementById('disconnectedClients').textContent = data.disconnected;
            document.getElementById('gracePeriodClients').textContent = data.inGracePeriod;
        }

        // Update clients grid
        function updateClientsGrid(clients) {
            const grid = document.getElementById('clientsGrid');
            
            if (clients.length === 0) {
                grid.innerHTML = '<div class="no-clients">No clients connected</div>';
                return;
            }

            grid.innerHTML = clients.map(client => \`
                <div class="client-card">
                    <div class="client-header">
                        <div>
                            <div class="username">\${client.username || 'Anonymous'}</div>
                            <div class="user-type">\${client.userType || 'user'}</div>
                        </div>
                        <div class="status-badge status-\${client.status}">\${client.status}</div>
                    </div>
                    <div class="client-details">
                        <div class="detail-item">
                            <div class="detail-label">User ID</div>
                            <div class="detail-value">\${client.userId}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Session ID</div>
                            <div class="detail-value">\${client.sessionId || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Connected At</div>
                            <div class="detail-value">\${new Date(client.connectedAt).toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Last Activity</div>
                            <div class="detail-value">\${new Date(client.lastActivity).toLocaleString()}</div>
                        </div>
                        \${client.roomId ? \`
                        <div class="detail-item">
                            <div class="detail-label">Room ID</div>
                            <div class="detail-value">\${client.roomId}</div>
                        </div>
                        \` : ''}
                        <div class="detail-item">
                            <div class="detail-label">IP Address</div>
                            <div class="detail-value">\${client.ipAddress || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // Auto-refresh functionality
        function setupAutoRefresh() {
            const checkbox = document.getElementById('autoRefresh');
            
            if (checkbox.checked) {
                autoRefreshInterval = setInterval(loadClients, 5000);
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
        loadClients();
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