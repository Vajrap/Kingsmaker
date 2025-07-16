export class Router {
    private routes: Map<string, () => void> = new Map()

    register(path: string, handler: () => void) {
        this.routes.set(path, handler)
    }

    navigate(path: string) {
        // Update URL without page reload
        window.history.pushState({}, '', path)
        
        // Execute route handler
        const handler = this.routes.get(path)
        if (handler) {
            handler()
        } else {
            console.error(`Route not found: ${path}`)
        }
    }

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const path = window.location.pathname
            const handler = this.routes.get(path)
            if (handler) {
                handler()
            }
        })

        // Handle initial route
        const currentPath = window.location.pathname
        const handler = this.routes.get(currentPath) || this.routes.get('/')
        if (handler) {
            handler()
        }
    }
} 