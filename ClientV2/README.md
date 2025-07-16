# KingsMaker ClientV2 - Vanilla TypeScript Frontend

A modern, clean vanilla HTML + TypeScript + CSS frontend for KingsMaker, designed to work seamlessly with the auth service backend.

## 🚀 **Tech Stack**

### **Frontend Framework**
- **Vanilla TypeScript** - Clean, type-safe JavaScript
- **Vite** - Modern build tool with hot reload
- **Modern CSS** - Custom properties, design tokens, responsive

### **Architecture Pattern**
- **MVVM (Model-View-ViewModel)** - Clean separation of concerns
- **Component-based** - Reusable page components
- **Client-side routing** - Single-page application experience

### **API Communication**
- **Native `fetch()` API** - No external dependencies
- **Type-safe** - Matches backend Input/Output types
- **Automatic session management** - localStorage integration

### **Styling System**
- **Chakra UI inspired design tokens** - CSS custom properties
- **Dark/Light theme support** - Theme switching
- **Responsive design** - Mobile-first approach
- **Utility classes** - Tailwind-like utilities

## 📋 **Project Structure**

```
ClientV2/
├── src/
│   └── main.ts                    # Application entry point
├── utility/
│   ├── authService.ts             # Auth API client
│   ├── router.ts                  # Client-side routing
│   └── storageManager.ts          # LocalStorage management
├── pagesAndComponent/
│   ├── style.css                  # Global design system
│   ├── login/                     # Login page
│   │   ├── viewModel.ts           # Login logic
│   │   ├── view.html              # Login template
│   │   ├── style.css              # Login styles
│   │   └── model.ts               # Login data model
│   ├── lobby/                     # Lobby page
│   ├── register/                  # Register page
│   ├── waitingRoom/               # Waiting room page
│   └── game/                      # Game page
├── index.html                     # Main HTML file
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── vite.config.ts                 # Vite configuration
```

## 🔧 **Setup & Development**

### **Prerequisites**
- Node.js 18+
- Auth service running on `http://localhost:7001`

### **Installation**
```bash
cd ClientV2
npm install
```

### **Development**
```bash
npm run dev
# Open http://localhost:3000
```

### **Build**
```bash
npm run build
# Output in dist/
```

## 🎨 **Design System**

### **Color Palette**
- **Primary:** Blue scale (50-900)
- **Gray:** Neutral scale (50-900)
- **Success:** Green scale (50-900)
- **Error:** Red scale (50-900)

### **Spacing System**
- **Space scale:** 0.25rem to 5rem
- **Consistent margins/padding**

### **Typography**
- **Font sizes:** xs (0.75rem) to 4xl (2.25rem)
- **Font weights:** normal, semibold, bold

### **Components**
- **Buttons:** Primary, secondary, outline, success, danger
- **Cards:** Elevated containers with shadows
- **Forms:** Input fields, labels, validation
- **Alerts:** Success, error, info messages

## 🔐 **Authentication Flow**

### **Session Management**
1. **Login/Register** → Auth service validates → Session stored
2. **Auto-login** → Validates existing session on app load
3. **Session routing** → Routes user based on presence status
4. **Logout** → Clears session and redirects to login

### **Auth Service Integration**
- **Login:** `POST /login` - `LoginInput` → `LoginOutput`
- **Register:** `POST /register` - `RegisterInput` → `RegisterOutput`
- **Guest:** `POST /guest` - `GuestInput` → `LoginOutput`
- **Auto-login:** `POST /autoLogin` - `AuthInput` → `LoginOutput`
- **Logout:** `POST /logout` - `LogoutInput` → `LogoutOutput`

## 🧭 **Routing System**

### **Client-side Routes**
- **`/`** - Root redirect based on auth status
- **`/login`** - Login page
- **`/register`** - Registration page
- **`/lobby`** - Main lobby (authenticated)
- **`/waiting-room`** - Pre-game waiting room
- **`/game`** - Game interface

### **Smart Routing**
- **Session-based routing** - Automatically routes based on user status
- **Protected routes** - Requires authentication
- **Fallback handling** - Invalid routes redirect appropriately

## 🎯 **Features**

### **✅ Implemented**
- **Authentication system** (login, guest, auto-login, logout)
- **Session management** with localStorage
- **Client-side routing** with history API
- **Dark/Light theme** switching
- **Responsive design** for all screen sizes
- **Type-safe API** communication
- **Loading states** and error handling
- **MVVM architecture** with clean separation

### **🔄 Planned**
- **Register page** implementation
- **Lobby functionality** (room creation, joining)
- **Waiting room** with player management
- **Game interface** implementation
- **WebSocket integration** for real-time features

## 📱 **Usage Examples**

### **Login Page**
```typescript
// Automatic routing after login
const result = await authService.login({ username, password })
if (result) {
    // Routes to lobby/waiting-room/game based on presenceStatus
}
```

### **Theme System**
```typescript
// Theme switching
storageManager.setTheme('dark')
// CSS automatically updates via data-theme attribute
```

### **Session Management**
```typescript
// Auto-login on app start
const sessionId = storageManager.getSessionId()
const isValid = await authService.validateSession(sessionId)
// Routes user appropriately
```

## 🔧 **Development Notes**

### **Type Safety**
- All API types match backend exactly
- TypeScript strict mode enabled
- Proper error handling throughout

### **Performance**
- **Lazy loading** - Pages loaded on demand
- **Vite optimizations** - Fast development builds
- **Tree shaking** - Unused code removal

### **Accessibility**
- **Semantic HTML** structure
- **Focus management** for keyboard navigation
- **Color contrast** compliant

## 📈 **Testing**

### **Manual Testing**
1. **Start auth service** (`http://localhost:7001`)
2. **Run ClientV2** (`npm run dev` → `http://localhost:3000`)
3. **Test authentication** flow (login, guest, logout)
4. **Test routing** between pages
5. **Test theme switching**

### **Integration Testing**
- **Auth service** communication
- **Session persistence** across page reloads
- **Error handling** for network failures

## 🎉 **Benefits Over React**

### **Simplicity**
- **No complex state management**
- **No virtual DOM overhead**
- **Direct DOM manipulation**
- **Easier debugging**

### **Performance**
- **Smaller bundle size**
- **Faster initial load**
- **No framework overhead**

### **Developer Experience**
- **TypeScript everywhere**
- **Modern CSS features**
- **Hot reload with Vite**
- **Clean architecture**

---

**🚀 Ready to develop! The foundation is solid and extensible.** 