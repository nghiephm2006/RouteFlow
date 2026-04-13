# User Flows And Failure Scenarios

## Mục tiêu

File này mô tả:

- luồng dùng chính của dispatcher và shipper
- async flow hiện có trong hệ thống
- failure path và recovery expectation

Không dùng file này để thay thế state machine; state canon nằm ở `06_DOMAIN_RULES_AND_STATE_MACHINES.md`.

## Primary Actors

- `Dispatcher`: tạo/import order, planning, cluster, theo dõi và điều chỉnh route
- `Shipper`: thực thi giao hàng và xác nhận hoàn thành
- `System`: geocoding background worker, validation pipeline, email notification

## Core Business Flow

Canonical flow của RouteFlow:

`Order -> Cluster -> Route -> Deliver -> Confirm`

Current implementation note:

- `Cluster` đã có ở mức service
- `Route` aggregate backend chưa có
- execution flow hiện vẫn mang tính frontend-driven

## Flow 1: Tạo Order Thủ Công

1. Dispatcher nhập thông tin order.
2. Frontend gọi `POST /api/orders`.
3. Backend validate payload.
4. Backend tạo `OrderCode`, set `Status = Pending`.
5. Backend lưu order.
6. Nếu tọa độ usable đã có sẵn, order có thể được đẩy sang pool planning sau khi business rule được áp dụng.

Expected rule:

- create order không được block vì email notification hay geocoding phụ

## Flow 2: Import Order Từ Excel

1. Dispatcher tải template Excel.
2. Dispatcher upload file qua `POST /api/orders/import`.
3. Backend parse từng row:
   - bỏ qua row thiếu `CustomerName` hoặc `Address`
   - parse `Latitude/Longitude`, fail thì về `0`
4. Backend tạo order hàng loạt.
5. Order mới vào hệ thống với `Pending`.
6. Background geocoding xử lý các order còn `0,0`.

Expected rule:

- import partial success phải an toàn
- row xấu không được làm hỏng toàn bộ batch trừ khi business quyết định rõ khác đi

## Flow 3: Geocoding Background

Current implementation:

1. Background service poll DB mỗi 10 giây.
2. Lấy tối đa 5 order có `Latitude == 0 && Longitude == 0`.
3. Gọi Nominatim.
4. Nếu geocode thành công:
   - update tọa độ thật
5. Nếu geocode fail:
   - set `Latitude = -1`
   - set `Longitude = -1`
6. Save sau từng order.

Current risk:

- `-1,-1` là sentinel kỹ thuật, không phải domain model sạch
- không có retry policy đúng nghĩa
- không có error classification

Expected direction:

- geocode failure phải được quan sát được
- order geocode fail không được lẫn vào pool planning

## Flow 4: Planning Và Cluster

1. Dispatcher lấy pool order planning từ `GET /api/orders/pending` hoặc `GET /api/routes/orders`.
2. Frontend gửi list order sang `POST /api/routes/cluster`.
3. Backend chia cluster bằng `ClusterService`.
4. Frontend tối ưu route bằng OSRM.
5. Dispatcher chọn batch để thực thi.

Current implementation gap:

- backend chưa sở hữu route planning lifecycle
- clustering hiện là chunk list đơn giản
- route optimization hiện chạy ở frontend

Expected direction:

- frontend hỗ trợ visualization và thao tác
- backend phải dần trở thành source of truth cho route artifact

## Flow 5: Delivery Execution

1. Dispatcher/shipper xem route trên map.
2. Khi giao xong một order, frontend gọi `PATCH /api/orders/{id}/status`.
3. Backend update `OrderStatus`.
4. Nếu order có email, hệ thống cố gửi notification bất đồng bộ.
5. Frontend có thể re-optimize phần route còn lại.

Expected rule:

- email failure không được cản business flow
- delivered order không được quay lại pool planning

## Flow 6: Template Download

1. User bấm `Download Template`.
2. Frontend mở trực tiếp `/api/orders/template` bằng browser navigation.
3. Backend stream file `.xlsx`.

Current UX note:

- đây là full browser navigation/open tab
- không phải HttpClient blob download

## Failure Scenarios

## Geocode Fail

Current behavior:

- order bị set `-1,-1`
- hệ thống tránh retry vô hạn

Risk:

- sentinel value khó đọc ở business level
- thiếu reason code

Expected recovery:

- dispatcher có thể sửa address hoặc tọa độ để đưa order quay lại flow

## OSRM Fail

Current frontend behavior:

- log lỗi ở console
- fallback trả route rỗng hoặc dùng nguyên thứ tự point hiện có

Implication:

- optimization fail không được làm app chết
- nhưng quality của route giảm mạnh

## Validation Fail

Current behavior:

- backend trả `400` với validation error map

Expected frontend behavior:

- hiển thị lỗi field-level nếu có thể
- không swallow lỗi generic

## Email Fail

Current behavior:

- email gửi fire-and-forget
- fail chỉ log console, không rollback transaction chính

This is acceptable for Phase 1.

## Backend Cold Start Or Slow Start

Observed production reality với Render:

- request đầu có thể gặp loading delay
- các action kiểu template download bằng browser navigation sẽ lộ rõ trạng thái startup hơn XHR

Expected handling:

- health endpoint phải kiểm tra được
- UI không được assume backend luôn warm

## Contract Drift Between FE And BE

Current real drift:

- stats field name lệch (`routingOrders` vs `assignedOrders`)
- route state chưa có contract canon ở backend

Expected handling:

- fix contract drift trước khi mở rộng feature
- không để frontend tự nội suy field không tồn tại

## Recovery Priorities

Khi có sự cố, thứ tự xử lý nên là:

1. xác nhận backend health
2. xác nhận DB connectivity/migrations
3. xác nhận API contract không drift
4. xác nhận geocode/routing provider availability
5. chỉ sau đó mới xem bug UI
