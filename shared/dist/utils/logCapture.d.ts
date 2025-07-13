interface LogEntry {
    timestamp: string;
    level: 'log' | 'error' | 'warn' | 'info';
    message: string;
    service: string;
}
declare class LogCapture {
    private dashboardClients;
    private logBuffer;
    private maxBufferSize;
    private originalConsole;
    constructor();
    private interceptConsole;
    private captureLog;
    private broadcastLog;
    addDashboardClient(ws: any): void;
    removeDashboardClient(ws: any): void;
    getLogs(): LogEntry[];
    clearLogs(): void;
}
export declare const logCapture: LogCapture;
export {};
//# sourceMappingURL=logCapture.d.ts.map