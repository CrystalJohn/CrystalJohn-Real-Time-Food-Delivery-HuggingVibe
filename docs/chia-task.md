# Kế hoạch chia việc theo Milestone (2 tuần / milestone)

---

## Milestone 1 — Tuần 1–2: Foundation + “Order đặt được”

**Demo cuối M1:** Customer login → xem menu (fake/seed) → place order → nhận orderId + xem order status.
**Mục tiêu kỹ thuật:** app chạy end-to-end, Mongo connect, eventing backbone sẵn, role-based guard basic.

### Leader (Full-stack / Architect)
- [ ] Repo conventions + README kiến trúc (backend/frontend)
- [ ] Setup backend: `ConfigModule` + `MongoModule` (mongoose) + `EventingModule` (EventEmitter + EventBusPort)
- [ ] Setup Auth skeleton: role model + guard (4 roles), login stub (có thể fake token trước)
- [ ] CI basic (lint/build) (optional)

### BE #1 (Ordering – minimal)
- [ ] `ordering` module skeleton + orders schema + repo mongo
- [ ] API: `POST /orders` (place order) + `GET /orders/:id`
- [ ] Publish event: `OrderPlaced`

### BE #2 (User minimal)
- [ ] `auth/users` minimal: user model + seed 4 roles (hoặc hardcode)
- [ ] API: login/register stub để FE tích hợp (tối thiểu trả token giả)

### Front-end Dev
- [ ] Frontend skeleton (app router groups + modules structure + infra/api client)
- [ ] Login page + route groups (customer/staff/driver/admin) skeleton
- [ ] Customer UI tối thiểu: menu page (mock) + checkout/place order gọi API
- [ ] Order detail page hiển thị status

**Test target (M1):**
- Smoke test: app boot + Mongo OK
- Unit test (1–2 cái): `PlaceOrderUseCase` hoặc repo save/get

---

## Milestone 2 — Tuần 3–4: Staff workflow + Event sync (Hướng 1)

**Demo cuối M2:** Customer đặt → Staff queue thấy ticket → Accept/Reject/Ready → Customer thấy OrderStatus đổi (qua event).
**Mục tiêu kỹ thuật:** ownership + event-driven chạy thật giữa modules.

### Leader
- [ ] Chuẩn hóa event contracts (class-based) + naming
- [ ] Guidelines: state mapping `TicketStatus` → `OrderStatus` (bảng mapping)
- [ ] Fix auth/guards để staff routes hoạt động thật

### BE #1 (Order-processing – core)
- [ ] `order-processing` module + kitchenTickets schema + repo mongo
- [ ] Subscriber: nghe `OrderPlaced` → tạo `KitchenTicket` (PENDING)
- [ ] APIs staff:
    - `GET /tickets?status=PENDING&limit=4`
    - `POST /tickets/:id/accept`
    - `POST /tickets/:id/reject`
    - `POST /tickets/:id/ready`
- [ ] Publish events: `TicketConfirmed`, `TicketRejected`, `TicketReady`

### BE #2 (Ordering subscriber + status update)
- [ ] `ordering/subscribers`: nghe ticket events → update `orders.orderStatus`
- [ ] API: `GET /orders/:id` trả status mới
- [ ] (Optional) notification stub: log event

### Front-end Dev
- [ ] Staff UI:
    - Queue page: list 4 PENDING
    - Detail page: accept/reject/ready
- [ ] Customer order detail auto-refresh (polling) để thấy status đổi

**Test target (M2):**
- Integration test: `OrderPlaced` → tạo ticket
- Integration test: `TicketReady` → order status updated

---

## Milestone 3 — Tuần 5–6: Driver accept + Realtime tracking basic (WS + persist)

**Demo cuối M3 (core demo đề tài):** Staff READY → Driver accept → driver gửi location (WS) → Customer thấy last location + status.
**Mục tiêu kỹ thuật:** WS pipeline + persist location + tracking page.

### Leader
- [ ] WebSocket infra chung (auth WS basic nếu kịp) + conventions channel/event
- [ ] “Demo script” chuẩn cho M3 (ai bấm gì)
- [ ] WS gateway:
    - driver emit location: `{orderId, lat, lng, ts}`
    - customer subscribe order tracking

### BE #2 (Delivery + Tracking – core)
- [ ] `delivery` module:
    - Subscriber nghe `TicketReady` → tạo “delivery job” (deliveryAssignment READY)
    - APIs driver:
        - `GET /delivery/jobs` (list READY)
        - `POST /delivery/jobs/:id/accept` (DeliveryAccepted)
        - `POST /delivery/jobs/:id/pickup`
        - `POST /delivery/jobs/:id/complete` (DeliveryDelivered)
    - Publish events: `DeliveryAccepted`, `DeliveryDelivered` (+ optional pickedup/outfordelivery)
- [ ] `tracking` module:
    - Persist `driverLocations` (last-only) + `trackingSessions` (start/stop)
    - Subscriber nghe `DeliveryAccepted` → start session, `DeliveryDelivered` → stop session

### BE #1 (Ordering status from delivery events)
- [ ] Subscribe delivery events → update `orders.orderStatus` (DELIVERING/DELIVERED)
- [ ] Ensure `GET /orders/:id` trả status + lastLocation (nếu bạn muốn join data thì query tracking qua facade; tối thiểu FE gọi tracking endpoint)

### Front-end Dev
- [ ] Driver UI:
    - jobs list + accept + start sending location (interval 3–5s)
- [ ] Customer tracking page:
    - connect WS subscribe + hiển thị last location (map placeholder cũng được)
    - hiển thị status realtime/polling

**Test target (M3):**
- WS smoke test: connect → send location → persisted → customer receive
- Integration: `TicketReady` → job appears → accept → tracking session starts

---

## Milestone 4 — Tuần 7–8: Driver recruitment/approval + Tracking nâng cấp

**Demo cuối M4:** Admin approve driver + tracking tốt hơn (ETA cơ bản).
**Mục tiêu kỹ thuật:** admin flow + quality improvement.

### Leader
- [ ] Admin module skeleton + role-based UI/guards hoàn chỉnh

### BE #2
- [ ] Driver recruitment + approval workflow:
    - `POST /drivers/apply`
    - `POST /admin/drivers/:id/approve`
- [ ] Tracking:
    - geospatial query basic (nearby jobs) (optional)
    - ETA calculator basic (optional)

### BE #1
- [ ] Admin staff/menu management tối thiểu (nếu scope cần)
- [ ] Hardening order-processing rules (transition validation)

### Front-end Dev
- [ ] Admin UI: approve drivers
- [ ] Staff UI polish + error states
- [ ] Customer tracking map cải thiện (render marker, ETA nếu có)

**Test target (M4):**
- Approval workflow test
- Tracking ETA unit test (nếu có)

---

## Milestone 5 — Tuần 9–10: Statistics + Polish integration

**Demo cuối M5:** Dashboard có số liệu cơ bản + toàn bộ flow chạy mượt.
**Mục tiêu:** chuẩn bị final.

### Leader + BE #1
- [ ] Statistics APIs: total orders, total revenue, daily chart (simple aggregate)
- [ ] Admin dashboard endpoints

### BE #2
- [ ] Driver management admin endpoints (list/ban/approve status)
- [ ] Reliability: idempotent handlers + logging

### Front-end Dev
- [ ] Dashboard UI + chart
- [ ] End-to-end UX polish + bugfix

**Test target (M5):**
- E2E smoke flows (manual script) + regression tests tối thiểu

---

## Tuần 11: Finalization (Deploy + Demo prep)

- [ ] Deploy (Docker) + env config
- [ ] Fix bugs, chuẩn hóa README + API docs
- [ ] Chuẩn bị demo script + dữ liệu seed

---

### Notes (để team không lệch)
- Ownership rules giữ chặt: module không write collection của module khác.
- Cross-module updates qua events (Hướng 1).
- Mỗi milestone phải có demo script + smoke tests để không dồn tích hợp cuối.
