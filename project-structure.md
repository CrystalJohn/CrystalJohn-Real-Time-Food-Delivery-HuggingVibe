# Project Structure

## Root
```
.
├── BE-REAL-TIME-FOOD-DELIVERY-newest/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── gateways/
│   │   ├── guards/
│   │   ├── migrations/
│   │   ├── repositories/
│   │   ├── seeds/
│   │   └── services/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-newest/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/
│   │   │   ├── (customer)/
│   │   │   ├── (driver)/
│   │   │   ├── (staff)/
│   │   │   ├── about/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── driver/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   ├── staff/
│   │   │   └── tracking/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── all-context-project.md
│   ├── backend-swagger-setup.md
│   ├── frontend-architecture.md
│   └── tests/
│
├── plans/
│   ├── knowledge-project.md
│   └── milestone-plan.md
│
└── package.json
```

## Backend Structure Details

```
BE-REAL-TIME-FOOD-DELIVERY-newest/src/
├── auth/                 # JWT authentication & strategies
├── config/              # Database, JWT, store configs
├── controllers/         # Admin, Auth, Cart, Driver, Order, Staff, Store, Menu
├── dto/                # Data Transfer Objects (Admin, Auth, Cart, Driver, Order, Menu, Store)
├── entities/           # Database entities (User, Customer, Driver, Order, Cart, Wallet, Menu, etc.)
├── enums/             # Status enums (Order, Payment, Delivery, Driver, User Role)
├── gateways/          # WebSocket gateway (Tracking)
├── guards/            # JWT Auth Guard, Roles Guard
├── migrations/        # Database migrations
├── repositories/      # Data access layer
├── services/          # Business logic & services
└── seeds/            # Database seeding
```

## Frontend Structure Details

```
frontend-newest/src/
├── app/                    # Next.js 13+ App Router
│   ├── (admin)/           # Admin panel routes
│   ├── (customer)/        # Customer routes (menu, cart, orders)
│   ├── (driver)/          # Driver routes (jobs)
│   ├── (staff)/           # Staff routes (tickets, menu management)
│   └── [public pages]/    # Auth, about, promotions, store-locator
├── components/            # Reusable UI components
│   ├── layout/            # Header, Footer, Containers
│   ├── shared/            # Auth popup, Cart, Product card
│   └── ui/                # Button, Input, Dialog, Badge, Card
├── features/              # Feature-specific logic
│   ├── admin/            # Admin dashboard & management
│   ├── auth/             # Authentication context & forms
│   ├── cart/             # Cart context & operations
│   ├── driver/           # Driver jobs & profile
│   ├── menu/             # Menu listing & filtering
│   ├── orders/           # Order listing & details
│   ├── staff/            # Staff order queue & menu management
│   └── tracking/         # Real-time delivery tracking
├── lib/                   # API client, utilities, constants
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```
