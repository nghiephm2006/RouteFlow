# Domain Rules And State Machines

## Mục tiêu

File này là nguồn sự thật cho:

- business rules bất biến của RouteFlow
- current state machine đang có trong code
- target state machine cần implement tiếp để Phase 1 đủ chắc

Rule quan trọng:

- UI không được tự định nghĩa business state.
- Backend domain phải là nơi chốt transition hợp lệ hay không hợp lệ.
- Không dùng enum thuần như một "danh sách tên trạng thái"; phải có transition rule, guard và side effect rõ ràng.

## Ubiquitous Language

- `Order`: một đơn hàng giao nhận độc lập
- `Cluster`: nhóm đơn tạm thời dùng cho planning, chưa phải aggregate bền vững
- `Route`: đơn vị thực thi giao hàng cho một batch order theo thứ tự stop
- `Dispatcher`: người điều phối, chịu trách nhiệm planning và điều chỉnh route
- `Shipper`: người thực thi giao hàng ngoài thực địa

## Current Implementation Reality

### Order

`Order` hiện đang có 4 trạng thái trong code:

- `Pending`
- `Routing`
- `Assigned`
- `Delivered`

Current implementation gap:

- `Order.UpdateStatus()` cho phép set trực tiếp mọi giá trị enum
- chưa có guard transition
- chưa có terminal-state protection
- chưa có `Cancelled`
- chưa có separation giữa "eligible for routing" và "geocode failed"

### Route

- chưa có `Route` aggregate trong backend
- chưa có `RouteStatus` enum trong domain
- route execution hiện vẫn chủ yếu là flow ở frontend

## Canonical Business Rules

### Order Rules

- `OrderCode` là immutable sau khi tạo.
- `CustomerName` và `Address` là bắt buộc.
- `Delivered` là terminal state.
- `Cancelled` khi được thêm vào domain cũng phải là terminal state.
- Order không có tọa độ usable thì không được đưa vào planning thật.
- Giá trị tọa độ sentinel hiện tại:
  - `0,0` = chưa geocode xong hoặc chưa có tọa độ usable
  - `-1,-1` = geocode fail theo implementation hiện tại
- `0,0` và `-1,-1` là kỹ thuật tạm thời của Phase 1, không nên coi là mô hình domain lâu dài.

### Cluster Rules

- `Cluster` hiện chỉ là artifact planning, không phải aggregate.
- `ClusterService` hiện chỉ chunk list, chưa phải clustering theo địa lý đúng nghĩa.
- Không được nhầm `Cluster` hiện tại với boundary domain bền vững.

### Route Rules

- `Route` phải là aggregate quản lý:
  - tập order đã được chọn
  - stop sequence
  - execution lifecycle
- Khi `Route` chưa tồn tại ở backend, không được để frontend trở thành source of truth cho route state.

## Order State Machine

### Current As-Is State Machine

State hiện có trong code:

- `Pending`
- `Routing`
- `Assigned`
- `Delivered`

Transition thực tế hiện nay:

- API `PATCH /api/orders/{id}/status` có thể set trực tiếp bất kỳ enum value hợp lệ nào
- domain chưa chặn các jump sai như:
  - `Pending -> Delivered`
  - `Delivered -> Pending`
  - `Assigned -> Pending`

Đây là current reality, không phải canonical behavior mong muốn.

### Target Canonical Order State Machine

State dùng cho Phase 1 hardening:

- `Pending`
- `Routing`
- `Assigned`
- `Delivered`
- `Cancelled`

Ý nghĩa:

- `Pending`: order đã được tạo/import nhưng chưa sẵn sàng đi route
- `Routing`: order đủ điều kiện planning và đang ở pool chờ cluster/route
- `Assigned`: order đã thuộc một route thực thi
- `Delivered`: order đã giao thành công
- `Cancelled`: order bị hủy và không còn tham gia planning/execution

Allowed transitions:

- `Pending -> Routing`
- `Pending -> Cancelled`
- `Routing -> Assigned`
- `Routing -> Cancelled`
- `Assigned -> Delivered`
- `Assigned -> Routing`

Transition notes:

- `Assigned -> Routing` chỉ dành cho system/dispatcher khi route bị hủy hoặc unassign trước khi giao xong
- `Delivered` và `Cancelled` là terminal

Invalid transitions:

- `Pending -> Delivered`
- `Delivered -> *`
- `Cancelled -> *`
- `Assigned -> Pending`

Guard conditions:

- `Pending -> Routing`
  - `Address` không rỗng
  - có tọa độ usable
  - tọa độ usable nghĩa là không phải `0,0` và không phải `-1,-1`
- `Routing -> Assigned`
  - order phải được gắn vào một route hợp lệ sau này
  - dispatcher là actor chính
- `Assigned -> Delivered`
  - được xác nhận bởi shipper hoặc dispatcher
- `Assigned -> Routing`
  - chỉ khi route rollback/cancel trước terminal

Side effects:

- đổi trạng thái order có thể gửi email nếu có `Email`
- email failure không được rollback business transition

## Route State Machine

### Current Reality

- chưa có `Route` aggregate
- chưa có route state machine trong backend
- route execution state đang bị tản ở frontend

### Target Canonical Route State Machine

State cho Route Phase 1:

- `Draft`
- `Planned`
- `InProgress`
- `Completed`
- `Cancelled`

Ý nghĩa:

- `Draft`: batch order candidate vừa được gom, chưa lock sequence
- `Planned`: stop sequence đã được tính, route đủ điều kiện thực thi
- `InProgress`: route đang chạy ngoài thực địa
- `Completed`: tất cả order không bị hủy trong route đã ở terminal state
- `Cancelled`: route bị hủy trước khi hoàn tất

Allowed transitions:

- `Draft -> Planned`
- `Draft -> Cancelled`
- `Planned -> InProgress`
- `Planned -> Cancelled`
- `InProgress -> Completed`

Invalid transitions:

- `Draft -> Completed`
- `Planned -> Completed`
- `Completed -> *`
- `Cancelled -> *`

Guard conditions:

- `Draft -> Planned`
  - route có ít nhất 1 order
  - mọi order trong route đều đang ở trạng thái `Routing`
  - stop sequence đã được tính
- `Planned -> InProgress`
  - route có shipper/owner thực thi
  - dispatcher xác nhận bắt đầu
- `InProgress -> Completed`
  - không còn order non-terminal trong route

Side effects:

- `Draft -> Planned`: set order trong route sang `Assigned`
- `Planned -> Cancelled`: trả order non-terminal về `Routing`
- `InProgress -> Completed`: đóng route summary và snapshot execution

## Ownership Of State Changes

- `CreateOrder` / `ImportOrders`: tạo `Pending`
- `GeocodingBackgroundService`: chỉ làm giàu location readiness, không được nhảy terminal state
- `Dispatcher`: chuyển `Pending -> Routing`, `Routing -> Assigned`, `Pending/Routing -> Cancelled`
- `Shipper` hoặc `Dispatcher`: `Assigned -> Delivered`
- `System`: rollback `Assigned -> Routing` khi route bị cancel/unassign

## Required Tests When Implementing

- valid transition phải pass
- invalid transition phải fail ở domain layer
- terminal state không được mutate tiếp
- route cancel phải trả order non-terminal về pool đúng trạng thái
- email failure không được làm fail status transition
