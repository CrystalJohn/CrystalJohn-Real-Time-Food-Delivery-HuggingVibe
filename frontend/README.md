# Food Delivery - Frontend

A food delivery web application built with **Next.js 16**, **React 19**, **TypeScript**, and **shadcn/ui**.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Directory Structure

frontend/src/
├── app/                          # Pages (Next.js App Router)
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Context providers wrapper
│   ├── (customer)/               # Customer pages
│   │   ├── menu/page.tsx
│   │   ├── cart/page.tsx
│   │   └── orders/[orderId]/page.tsx
│   ├── (staff)/                  # Staff pages
│   ├── (driver)/                 # Driver pages
│   └── (admin)/                  # Admin pages
│
├── components/                   # All UI components
│   ├── ui/                       # shadcn/ui (auto-generated)
│   ├── menu/                     # Menu feature components
│   ├── cart/                     # Cart feature components
│   ├── order/                    # Order feature components
│   └── shared/                   # Shared/common components
│
├── hooks/                        # Custom React hooks
│   ├── useCart.ts
│   ├── useOrder.ts
│   └── ...
│
├── services/                     # API service layer
│   ├── api.ts                    # Base HTTP client
│   ├── order.service.ts
│   └── ...
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
│
├── types/                        # TypeScript type definitions
│   ├── order.ts
│   ├── menu.ts
│   └── ...
│
└── lib/                          # Utilities & constants
    ├── utils.ts
    └── constants.ts

## 🧩 Page Structure

Each page follows this structure:

```
┌──────────────────────────────────────────────────────────────┐
│                         PAGE                                  │
│  - Import hooks & components                                  │
│  - No business logic here                                     │
│  - Example: app/(customer)/menu/page.tsx                      │
└─────────────────────────┬────────────────────────────────────┘
                          │ uses
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                         HOOK                                  │
│  - Business logic & state management                          │
│  - Calls services for API                                     │
│  - Example: hooks/useOrder.ts                                 │
└─────────────────────────┬────────────────────────────────────┘
                          │ calls
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                        SERVICE                                │
│  - API calls only                                             │
│  - Returns data from backend                                  │
│  - Example: services/order.service.ts                         │
└──────────────────────────────────────────────────────────────┘
```
Simple Rules
Layer	Responsibility	Example
Page	Compose UI, no logic	page.tsx imports hook + component
Hook	Handle logic & state	useOrder() manages loading, error, data
Service	Call API endpoints	orderService.getById(id)
Component	Render UI from props	<OrderDetail order={order} />
Context	Share global state	AuthContext, CartContext
Types	Define data shapes	interface Order { ... }

## 🧪 User Login Flow

1. User submits login form
2. Call authService.login(email, password)
3. Store token in localStorage (auth.storage.ts)
4. Update AuthContext with user info
5. Redirect based on user role:
   - customer → /menu
   - staff    → /staff/orders
   - driver   → /driver/jobs
   - admin    → /admin/dashboard
