# Food Delivery - Backend API

A food delivery backend API built with **NestJS**, **MongoDB**, **TypeScript**, and **Event-Driven Architecture**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start MongoDB (Docker)
docker-compose up -d

# Seed database with test data
npm run seed

# Run development server
npm run start:dev

# Server runs at http://localhost:3001
```

## 🏗️ Architecture

**Pattern**: NestJS Standard Layered Architecture (Controller → Service → Schema)

**Structure**: Flat Module Organization (no BCE subfolders)

**Communication**: Event-Driven with EventEmitter2

```
Request → Controller → Service → Schema (MongoDB)
                ↓
            EventEmitter
                ↓
        Cross-Module Events → Other Services
```

## 📁 Project Structure

```
backend/src/
├── app.module.ts                  # Root Module (Import các module con)
├── main.ts                        # Entry point (Swagger, ValidationPipe)
│
├── common/                        # 🛠️ CÁC TIỆN ÍCH DÙNG CHUNG
│   ├── configs/                   # Cấu hình Env
│   │   └── env.validation.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts # Lấy user từ Request
│   │   └── roles.decorator.ts        # @Roles('ADMIN')
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # Check login
│   │   └── roles.guard.ts            # Check quyền
│   └── database/
│       └── abstract.schema.ts        # Base schema (_id, timestamps)
│
├── modules/                       # 📦 CÁC MODULE NGHIỆP VỤ
│   │
│   ├── auth/                      # 👤 QUẢN LÝ NGƯỜI DÙNG & PROFILE
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── create-address.dto.ts
│   │   ├── schemas/
│   │   │   ├── user.schema.ts        # [Collection: users]
│   │   │   ├── customer.schema.ts    # [Collection: customers]
│   │   │   ├── staff.schema.ts       # [Collection: staffs]
│   │   │   └── address.schema.ts     # [Collection: addresses]
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── ordering/                  # 🍔 QUẢN LÝ MENU & ĐẶT HÀNG (Core)
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   ├── add-to-cart.dto.ts
│   │   │   └── create-menu-item.dto.ts
│   │   ├── schemas/
│   │   │   ├── category.schema.ts    # [Collection: menu_categories]
│   │   │   ├── menu-item.schema.ts   # [Collection: menu_items] (Chứa Images)
│   │   │   ├── cart.schema.ts        # [Collection: carts] (Chứa Items)
│   │   │   └── order.schema.ts       # [Collection: orders] (Chứa OrderItems + History)
│   │   ├── ordering.controller.ts
│   │   ├── ordering.service.ts
│   │   └── ordering.module.ts
│   │
│   ├── delivery/                  # 🛵 QUẢN LÝ TÀI XẾ & GPS
│   │   ├── dto/
│   │   │   ├── update-location.dto.ts
│   │   │   └── register-driver.dto.ts
│   │   ├── schemas/
│   │   │   ├── driver.schema.ts          # [Collection: drivers] (Thông tin xe, bằng lái)
│   │   │   └── driver-location.schema.ts # [Collection: driver_locations] (Log GPS)
│   │   ├── delivery.controller.ts
│   │   ├── delivery.service.ts
│   │   └── delivery.module.ts
│   │
│   ├── order-processing/          # 🍳 BẾP & STAFF (Logic Only)
│   │   ├── dto/
│   │   │   └── update-status.dto.ts
│   │   ├── order-processing.controller.ts
│   │   ├── order-processing.service.ts   # (Gọi OrderModel từ OrderingModule)
│   │   └── order-processing.module.ts    # (Imports: [OrderingModule])
│   │
│   └── events/                    # 📡 REAL-TIME SOCKET
│       ├── gateways/
│       │   └── tracking.gateway.ts       # Xử lý socket room "order_123"
│       └── events.module.ts
│
└── shared/                        # 🔗 CONSTANTS & ENUMS
    ├── enums/
    │   ├── user-role.enum.ts     # CUSTOMER, DRIVER, STAFF, ADMIN
    │   └── order-status.enum.ts  # PENDING, CONFIRMED, PREPARING...
    └── constants/
        └── app.constant.ts
```

## 🔐 Authentication & Authorization

- **Strategy**: JWT with bcrypt password hashing
- **Global Guards**: JwtAuthGuard + RolesGuard
- **Public Routes**: Use `@Public()` decorator to bypass JWT check
- **Role-Based Access**: `@Roles(UserRole.ADMIN, UserRole.STAFF)` decorator

### Test Accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| customer@test.com | 123456 | CUSTOMER |
| staff@test.com | 123456 | STAFF |
| driver@test.com | 123456 | DRIVER |
| admin@test.com | 123456 | ADMIN |

## 📡 Event-Driven Architecture

**6 Cross-Module Events** managed by EventEmitter2:

```typescript
// Flow 1: Customer places order → Staff receives ticket
'order.placed' → order-processing.service.ts creates KitchenTicket

// Flow 2: Staff confirms ticket → Update customer order
'ticket.confirmed' → ordering.service.ts updates order status

// Flow 3: Staff rejects ticket → Notify customer
'ticket.rejected' → ordering.service.ts updates order status

// Flow 4: Staff marks ticket ready → Assign to driver
'ticket.ready' → delivery.service.ts creates DeliveryAssignment

// Flow 5: Driver accepts job → Notify customer
'delivery.accepted' → ordering.service.ts updates order status

// Flow 6: Driver completes delivery → Complete order
'delivery.delivered' → ordering.service.ts marks order DELIVERED
```

**Implementation Pattern**:

```typescript
// Emit event
this.eventEmitter.emit('order.placed', { orderId, items });

// Listen to event
@OnEvent('order.placed')
handleOrderPlaced(payload: { orderId: string; items: any[] }) {
  // Handle event
}
```

## 🔌 API Endpoints

### Auth Module (Public)

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login (returns {token, user})
GET    /api/auth/me          # Get current user (requires JWT)
```

### Ordering Module

```
# Menu (Public)
GET    /api/menu             # Get all menu items

# Orders (Authenticated)
POST   /api/orders           # Create new order
GET    /api/orders/my        # Get user's orders
GET    /api/orders/:id       # Get order by ID
```

### Order Processing Module (Staff only)

```
GET    /api/tickets          # Get all kitchen tickets
GET    /api/tickets/:id      # Get ticket by ID
POST   /api/tickets/:id/accept   # Accept ticket
POST   /api/tickets/:id/reject   # Reject ticket
POST   /api/tickets/:id/ready    # Mark ticket ready
```

### Delivery Module (Driver)

```
GET    /api/jobs             # Get available delivery jobs
GET    /api/jobs/:id         # Get job details
POST   /api/jobs/:id/accept  # Accept delivery job
POST   /api/jobs/:id/pickup  # Mark order picked up
POST   /api/jobs/:id/deliver # Mark order delivered
```

### Admin Module (Admin only)

```
GET    /api/admin/drivers    # Get all drivers
POST   /api/admin/drivers/:id/approve   # Approve driver
POST   /api/admin/drivers/:id/reject    # Reject driver
```

## 🌐 WebSocket Events (Tracking)

**Gateway**: `TrackingGateway` on `/tracking` namespace

```typescript
// Client subscribes to order tracking
socket.emit('tracking:subscribe', { orderId: '...' });

// Driver sends location updates
socket.emit('driver:location', { orderId: '...', lat: 10.762622, lng: 106.660172 });

// Server broadcasts to subscribers
socket.on('tracking:update', (data) => {
  console.log('Driver location:', data);
});
```

## ⚙️ Environment Configuration

Create `.env` file in `backend/` folder:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/food_delivery

# JWT
JWT_SECRET=mysecretkey123
JWT_EXPIRES_IN=7d
```

## 🗃️ Database Seeding

The seed script creates test data for development:

```bash
npm run seed
```

**What it seeds:**
- **4 Users**: 1 customer, 1 staff, 1 driver, 1 admin
- **10 Menu Items**: Pizza, pasta, salad, drinks, desserts across 4 categories

**Check in MongoDB Compass:**
- Database: `food_delivery`
- Collections: `users`, `menuitems`

## 🛠️ Available Scripts

```bash
# Development
npm run start          # Start server
npm run start:dev      # Start with watch mode
npm run start:debug    # Start with debug mode

# Build
npm run build          # Compile TypeScript

# Production
npm run start:prod     # Run production build

# Testing
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage

# Database
npm run seed           # Seed test data

# Code Quality
npm run format         # Format code with Prettier
npm run lint           # Lint code with ESLint
```

## 🔧 Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + bcrypt + Passport
- **Events**: @nestjs/event-emitter (EventEmitter2)
- **WebSocket**: @nestjs/websockets + Socket.IO
- **Validation**: class-validator + class-transformer
- **Configuration**: @nestjs/config + Joi validation

## 📦 Key Dependencies

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/mongoose": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/event-emitter": "^2.0.0",
  "@nestjs/websockets": "^10.4.14",
  "@nestjs/platform-socket.io": "^10.4.14",
  "mongoose": "^8.0.0",
  "bcrypt": "^5.1.0",
  "passport-jwt": "^4.0.1",
  "class-validator": "^0.14.0",
  "socket.io": "^4.8.1"
}
```

## 🚦 CORS Configuration

Backend allows requests from frontend:

```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

## 📝 Module Status

| Module | Status | TODO |
|--------|--------|------|
| Auth | ✅ Fully Implemented | - |
| Ordering | ✅ Fully Implemented | - |
| Order-Processing | 🟡 Skeleton Ready | Implement ticket logic |
| Delivery | 🟡 Skeleton Ready | Implement job assignment |
| Tracking | 🟡 Skeleton Ready | Implement real-time tracking |

## 🎯 Next Steps

1. **M1 - Customer Flow**: Integrate frontend with Auth + Ordering modules
2. **M2 - Staff Flow**: Implement kitchen ticket processing logic
3. **M3 - Driver Flow**: Implement delivery job assignment logic
4. **M4 - Real-time Tracking**: Integrate WebSocket tracking with map

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Socket.IO Documentation](https://socket.io/docs)

## 📄 License

MIT
