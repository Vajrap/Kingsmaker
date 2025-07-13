class LogCapture {
    dashboardClients = new Set();
    logBuffer = [];
    maxBufferSize = 1000; // Keep last 1000 logs
    // Capture original console methods
    originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };
    constructor() {
        this.interceptConsole();
    }
    interceptConsole() {
        // Override console.log
        console.log = (...args) => {
            this.captureLog('log', args);
            this.originalConsole.log(...args);
        };
        // Override console.error
        console.error = (...args) => {
            this.captureLog('error', args);
            this.originalConsole.error(...args);
        };
        // Override console.warn
        console.warn = (...args) => {
            this.captureLog('warn', args);
            this.originalConsole.warn(...args);
        };
        // Override console.info
        console.info = (...args) => {
            this.captureLog('info', args);
            this.originalConsole.info(...args);
        };
    }
    captureLog(level, args) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '),
            service: 'sessionManager'
        };
        // Add to buffer
        this.logBuffer.push(logEntry);
        // Keep buffer size manageable
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
        }
        // Send to all connected dashboard clients
        this.broadcastLog(logEntry);
    }
    broadcastLog(logEntry) {
        const message = JSON.stringify({
            type: 'LOG_ENTRY',
            data: logEntry
        });
        this.dashboardClients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                try {
                    client.send(message);
                }
                catch (error) {
                    // Remove disconnected clients
                    this.dashboardClients.delete(client);
                }
            }
        });
    }
    // Add dashboard client
    addDashboardClient(ws) {
        this.dashboardClients.add(ws);
        // Send existing logs to new client
        this.logBuffer.forEach(logEntry => {
            const message = JSON.stringify({
                type: 'LOG_ENTRY',
                data: logEntry
            });
            ws.send(message);
        });
    }
    // Remove dashboard client
    removeDashboardClient(ws) {
        this.dashboardClients.delete(ws);
    }
    // Get all logs (for API endpoint)
    getLogs() {
        return [...this.logBuffer];
    }
    // Clear logs
    clearLogs() {
        this.logBuffer = [];
    }
}
export const logCapture = new LogCapture();
