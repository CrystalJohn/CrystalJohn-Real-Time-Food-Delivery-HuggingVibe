# Real-time Food Delivery (Modular Monolith + Event-Driven)

Real-time Food Delivery app với 4 nhóm actor:
- **Customer**: đặt món, theo dõi đơn hàng real-time
- **Staff**: nhận/duyệt đơn, chuẩn bị món
- **Driver**: nhận đơn giao, cập nhật trạng thái + vị trí
- **Admin**: dashboard, approve driver, thống kê

## Tech Stack
- **Backend**: NestJS + MongoDB + Mongoose
- **Realtime**: WebSocket (Nest Gateway) + internal Event-driven (NestJS EventEmitter)
- **Frontend**: Next.js (App Router)

---

# Architecture Overview

## 1) Modular Monolith + Ownership + Event-Driven
Dự án là **1 backend deployable** (monolith), nhưng code được chia theo **modules** (Option A / domain-per-module).

### Ownership (Single-writer)
Mỗi collection trong MongoDB có **1 module sở hữu (own)** và chỉ module đó được **write** trực tiếp vào collection đó.

Ví dụ (core):
- `ordering` owns: `orders`
- `order-processing` owns: `kitchenTickets`
- `delivery` owns: `deliveryAssignments`, `drivers`
- `tracking` owns: `trackingSessions`, `driverLocations` (persist)

> Module khác muốn thay đổi dữ liệu owned-by-module khác => **không update trực tiếp DB/model**; phải đi qua **Domain Events**.

### Event-driven internal
Các module giao tiếp bằng **Domain Events** (class-based events) chạy nội bộ qua `@nestjs/event-emitter`.
- UseCase publish event (fact happened)
- Module khác subscribe và tự xử lý phần của mình

---

## 2) Design Style (BCE + Ports/Adapters - tối giản)
Trong mỗi module, code được tổ chức theo tư duy BCE (Boundary/Control/Entity) + Ports/Infrastructure:

- `boundary/`: Controllers/Gateways (nhận request/ws, validate DTO, gọi use case)
- `control/`: Use Cases (điều phối nghiệp vụ, gọi repo port, publish events)
- `entity/`: Domain entities (pure TS, không phụ thuộc Mongoose)
- `ports/`: Interfaces (repository ports)
- `infrastructure/`: Adapters kỹ thuật (Mongoose schema + repo mongo)
- `subscribers/`: Event handlers (subscribe events từ module khác)

**Rule quan trọng**
- Domain layer (`control`, `entity`) **không import Mongoose Model/Document**
- Chỉ `infrastructure/persistence` mới chạm Mongoose

---

# Repository Structure

## Root
```

food-delivery/
├── backend/          # NestJS API + WS + event-driven
├── frontend/         # Next.js app
├── scripts/          # helper scripts (github issues, etc.)
└── .github/          # issue templates

```

## Backend (high-level)
```

backend/src/
├── infrastructure/   # shared technical: config, mongo connection
├── eventing/         # event bus + domain events (class-based)
└── modules/          # business modules (ownership + BCE)
├── ordering
├── order-processing
├── delivery
└── tracking

````

### Modules mapping to flows
- **Flow 1 (Order Placement)** → `ordering`
- **Flow 2 (Order Processing)** → `order-processing`
- **Flow 3 (Delivery)** → `delivery`
- **Flow 4 (Real-time Tracking)** → `tracking`

---

# Getting Started

## Requirements
- Node.js (LTS)
- MongoDB (local or Docker)

## Backend
### 1) Install
```bash
cd backend
npm install
````

### 2) Environment

Tạo file `.env` trong `backend/` (tối thiểu):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/food_delivery
```

### 3) Run

```bash
npm run start:dev
```

> API prefix (nếu được bật trong `main.ts`) thường là `/api`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Conventions (để không phá kiến trúc)

## 1) No cross-module DB access

* Module A **không** được import schema/model/repo của module B
* Muốn “tác động” module khác => publish Domain Event

## 2) Controllers are thin

* Controller/Gateway chỉ làm: parse input, validate, gọi UseCase
* Business logic nằm trong `control/` + `entity/`

## 3) Events are facts

* Event mô tả “điều đã xảy ra” (vd: `TicketReady`, `DeliveryAccepted`)
* Không dùng event như “command” ra lệnh module khác

---

# Notes

* EventEmitter là **in-process** (không durable). Kiến trúc đã có `EventBusPort` để dễ nâng cấp sang Redis/NATS sau.
* Tracking persist `driverLocations` để có thể đọc lại “last location”/audit khi cần.
