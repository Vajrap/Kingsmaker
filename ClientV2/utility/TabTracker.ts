export class TabTracker {
    private static readonly STORAGE_KEY = "kingsmaker-tab-list";
    private static readonly HEARTBEAT_INTERVAL_MS = 2000;
    private static readonly STALE_THRESHOLD_MS = 5000;

    private thisTabId: string;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.thisTabId =
            sessionStorage.getItem("kingsmaker-this-tab-id") ||
            crypto.randomUUID();
        sessionStorage.setItem("kingsmaker-this-tab-id", this.thisTabId);
    }

    public start() {
        this.sendHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
            this.cleanupStaleTabs();
        }, TabTracker.HEARTBEAT_INTERVAL_MS);

        window.addEventListener("storage", this.onStorageUpdate.bind(this));
        window.addEventListener(
            "beforeunload",
            this.cleanupOnUnload.bind(this),
        );
    }

    public stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        window.removeEventListener("storage", this.onStorageUpdate.bind(this));
        window.removeEventListener(
            "beforeunload",
            this.cleanupOnUnload.bind(this),
        );
        this.cleanupOnUnload();
    }

    public isOnlyTab(): boolean {
        const tabs = this.getActiveTabs();
        return tabs.length === 1 && tabs[0].id === this.thisTabId;
    }

    private getActiveTabs(): { id: string; time: number }[] {
        const raw = localStorage.getItem(TabTracker.STORAGE_KEY);
        if (!raw) return [];
        const tabs = JSON.parse(raw) as { id: string; time: number }[];
        const now = Date.now();
        return tabs.filter((t) => now - t.time < TabTracker.STALE_THRESHOLD_MS);
    }

    private sendHeartbeat() {
        const raw = localStorage.getItem(TabTracker.STORAGE_KEY);
        let tabs = raw
            ? (JSON.parse(raw) as { id: string; time: number }[])
            : [];
        const now = Date.now();

        const existing = tabs.find((t) => t.id === this.thisTabId);
        if (existing) {
            existing.time = now;
        } else {
            tabs.push({ id: this.thisTabId, time: now });
        }

        localStorage.setItem(TabTracker.STORAGE_KEY, JSON.stringify(tabs));
    }

    private cleanupStaleTabs() {
        const tabs = this.getActiveTabs();
        localStorage.setItem(TabTracker.STORAGE_KEY, JSON.stringify(tabs));
    }

    private cleanupOnUnload() {
        const raw = localStorage.getItem(TabTracker.STORAGE_KEY);
        if (!raw) return;
        let tabs = JSON.parse(raw) as { id: string; time: number }[];
        tabs = tabs.filter((t) => t.id !== this.thisTabId);
        localStorage.setItem(TabTracker.STORAGE_KEY, JSON.stringify(tabs));
    }

    private onStorageUpdate(e: StorageEvent) {
        if (e.key === TabTracker.STORAGE_KEY) {
            // Optional: react to tab changes
            const isNowOnlyTab = this.isOnlyTab();
            console.log("Storage updated, am I the only tab?", isNowOnlyTab);
        }
    }
}
