interface LogEntry {
    timestamp: string;
    level: 'log' | 'error' | 'warn' | 'info';
    message: string;
    service: string;
}

class LogCapture {
    private dashboardClients: Set<any> = new Set();
    private logBuffer: LogEntry[] = [];
    private maxBufferSize = 1000; // Keep last 1000 logs

    // Capture original console methods
    private originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };

    constructor() {
        this.interceptConsole();
    }

    private interceptConsole() {
        // Override console.log
        console.log = (...args: any[]) => {
            this.captureLog('log', args);
            this.originalConsole.log(...args);
        };

        // Override console.error
        console.error = (...args: any[]) => {
            this.captureLog('error', args);
            this.originalConsole.error(...args);
        };

        // Override console.warn
        console.warn = (...args: any[]) => {
            this.captureLog('warn', args);
            this.originalConsole.warn(...args);
        };

        // Override console.info
        console.info = (...args: any[]) => {
            this.captureLog('info', args);
            this.originalConsole.info(...args);
        };
    }

    private captureLog(level: LogEntry['level'], args: any[]) {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
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

    private broadcastLog(logEntry: LogEntry) {
        const message = JSON.stringify({
            type: 'LOG_ENTRY',
            data: logEntry
        });

        this.dashboardClients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                try {
                    client.send(message);
                } catch (error) {
                    // Remove disconnected clients
                    this.dashboardClients.delete(client);
                }
            }
        });
    }

    // Add dashboard client
    addDashboardClient(ws: any) {
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
    removeDashboardClient(ws: any) {
        this.dashboardClients.delete(ws);
    }

    // Get all logs (for API endpoint)
    getLogs(): LogEntry[] {
        return [...this.logBuffer];
    }

    // Clear logs
    clearLogs() {
        this.logBuffer = [];
    }
}

export const logCapture = new LogCapture();