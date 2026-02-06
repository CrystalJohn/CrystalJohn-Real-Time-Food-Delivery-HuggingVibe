# Food Delivery - Frontend

A food delivery web application built with **Next.js 16**, **React 19**, **TypeScript**, and **Sass**.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Directory Structure

```
frontend/src/
├── app/                          # Next.js App Router (Pages)
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Context providers wrapper
│   ├── login/page.tsx            # Login page
│   ├── (customer)/               # Customer route group
│   │   ├── page.tsx              # Customer home
│   │   ├── menu/page.tsx
│   │   ├── cart/page.tsx
│   │   └── orders/[id]/page.tsx
│   ├── (staff)/                  # Staff route group
│   │   └── orders/page.tsx
│   ├── (driver)/                 # Driver route group
│   │   └── jobs/[orderId]/page.tsx
│   └── (admin)/                  # Admin route group
│       ├── dashboard/page.tsx
│       └── drivers/page.tsx
│
├── components/                   # Shared React components
│   ├── ui/                       # UI components (Button, Input, etc.)
│   ├── layout/                   # Layout components (Header, Sidebar, etc.)
│   ├── cart/                     # Cart components
│   ├── menu/                     # Menu components
│   └── shared/                   # Shared/common components
│
├── features/                     # Feature-Based Architecture
│   ├── auth/                     # Auth feature
│   │   ├── AuthContext.tsx       # React Context
│   │   ├── auth.service.ts       # API calls
│   │   ├── auth.storage.ts       # localStorage helpers
│   │   ├── useAuth.ts            # Custom hook
│   │   ├── LoginForm.tsx         # UI Component
│   │   └── index.ts              # Public API exports
│   ├── cart/
│   │   ├── CartContext.tsx
│   │   ├── CartList.tsx
│   │   └── index.ts
│   ├── menu/
│   │   ├── menu.service.ts
│   │   ├── useMenu.ts
│   │   └── index.ts
│   ├── orders/
│   │   ├── order.service.ts
│   │   ├── useOrders.ts
│   │   └── index.ts
│   ├── staff/
│   │   ├── staff.service.ts
│   │   ├── useStaffQueue.ts
│   │   └── index.ts
│   ├── driver/
│   │   ├── driver.service.ts
│   │   ├── useDriverJobs.ts
│   │   └── index.ts
│   └── tracking/
│       ├── tracking.service.ts
│       ├── useTracking.ts
│       └── index.ts
│
├── lib/                          # API Infrastructure & Utilities
│   ├── api.ts                    # Base HTTP client (axios/fetch wrapper)
│   ├── auth-storage.ts           # JWT storage helpers
│   ├── auth.client.ts            # Auth HTTP client
│   ├── menu.client.ts            # Menu HTTP client
│   ├── order.client.ts           # Order HTTP client
│   ├── socket.ts                 # WebSocket client (Socket.IO)
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # Constants
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main exports
│   ├── user.ts                   # User types
│   ├── menu.ts                   # Menu types
│   ├── order.ts                  # Order types
│   ├── ticket.ts                 # Ticket types
│   └── delivery.ts               # Delivery types
│
└── styles/                       # Global styles
    └── globals.scss
```

## 🧩 Architecture Pattern: Feature-Based

Each feature is self-contained with its own:
- **Service** - API calls
- **Hooks** - Business logic & state
- **Context** - Global state (if needed)
- **Components** - UI components

### Data Flow

```
Page (app/) 
    ↓ imports
Feature Component (features/{feature}/)
    ↓ uses
Custom Hook (features/{feature}/use{Feature}.ts)
    ↓ calls
Service (features/{feature}/{feature}.service.ts)
    ↓ calls
HTTP Client (lib/api.ts)
    ↓ calls
Backend API
```

### Example: Auth Flow

```
LoginForm.tsx (features/auth/LoginForm.tsx)
    ↓ calls
useAuth() hook (features/auth/useAuth.ts)
    ↓ calls
AuthContext (features/auth/AuthContext.tsx)
    ↓ calls
authService.login() (features/auth/auth.service.ts)
    ↓ calls
api.post() (lib/api.ts)
    ↓ calls
POST /auth/login
```

## 📐 Simple Rules

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Page** | Routing & Layout | `app/(customer)/menu/page.tsx` |
| **Component** | UI Rendering | `MenuList.tsx`, `OrderCard.tsx` |
| **Hook** | Business Logic & State | `useOrders.ts`, `useOrder(id)` |
| **Context** | Global State | `AuthContext.tsx`, `CartContext.tsx` |
| **Service** | API Communication | `order.service.ts` |
| **API Client** | HTTP Request | `lib/api.ts` |
| **Types** | Define data shapes | `interface Order { ... }` |

## 🔐 User Login Flow

1. User submits login form
2. Call `authService.login(email, password)`
3. Store token in localStorage (`auth.storage.ts`)
4. Update `AuthContext` with user info
5. Redirect based on user role:
   - `customer` → /menu
   - `staff`    → /staff/orders
   - `driver`   → /driver/jobs
   - `admin`    → /admin/dashboard

## 🌐 API Infrastructure

### Base HTTP Client (`lib/api.ts`)

```typescript
// Generic HTTP client with JWT auto-attach
export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

### Auth Storage (`lib/auth-storage.ts`)

```typescript
// JWT token management
export const authStorage = {
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  getToken: () => localStorage.getItem('auth_token'),
  removeToken: () => localStorage.removeItem('auth_token'),
  hasToken: () => !!localStorage.getItem('auth_token'),
};
```

### Feature Services

Each feature has its own service file:

```typescript
// features/auth/auth.service.ts
import { api } from '@/lib/api';

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
};
```

## 🎯 Key Features

### Route Groups

- `(customer)` - Customer pages with customer layout
- `(staff)` - Staff pages with staff layout
- `(driver)` - Driver pages with driver layout
- `(admin)` - Admin pages with admin layout

### Route Protection

- Middleware checks JWT validity
- Redirect to `/login` if not authenticated
- Redirect to appropriate page if wrong role

### State Management

- **AuthContext** - Global auth state (user, isAuthenticated, login, logout)
- **CartContext** - Cart state (items, addItem, removeItem, clearCart)
- **Custom Hooks** - Feature-specific state (useOrders, useMenu, etc.)

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Sass** - CSS preprocessing
- **Socket.IO** - Real-time communication (WebSocket)
