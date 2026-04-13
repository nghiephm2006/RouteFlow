# API And Interface Contracts

## Mục tiêu

File này chốt:

- API surface hiện tại của RouteFlow
- request/response contract mà frontend đang dùng
- error contract hiện tại
- contract drift cần sửa để tránh frontend và backend nói chuyện lệch nhau

## Base URLs

### Production

- frontend UI: `https://routeflow-vn.vercel.app`
- backend API origin: `https://routeflow.onrender.com`

### Frontend Proxy

Theo [vercel.json](/D:/Works/Personal/RouteFlow/shipper-route-optimization/vercel.json):

- `/api/*` trên frontend được rewrite sang backend
- `/health` được rewrite sang backend

Vì vậy frontend production dùng:

- `/api/orders`
- `/api/routes`
- `/health`

thay vì hard-code backend domain ở browser.

## Serialization Rules

- backend trả JSON qua ASP.NET Core controllers
- frontend Angular đang consume theo camelCase property names
- enum `OrderStatus` đang được trao đổi bằng numeric value

Numeric mapping hiện tại:

- `0 = Pending`
- `1 = Routing`
- `2 = Assigned`
- `3 = Delivered`

## Error Contract

### Current Implemented Error Shape

`GlobalExceptionMiddleware` đang trả:

Validation error:

```json
{
  "statusCode": 400,
  "message": "One or more validation failures have occurred.",
  "errors": {
    "CustomerName": ["CustomerName is required."]
  }
}
```

Application error:

```json
{
  "statusCode": 400,
  "message": "Some business/application message"
}
```

Unexpected error:

```json
{
  "statusCode": 500,
  "message": "Unexpected error occurred."
}
```

### Contract Rule

- frontend không được assume mọi lỗi đều có `errors`
- validation failure mới có dictionary `errors`

## Auth API

### `GET /api/auth/bootstrap-status`

Purpose:

- kiểm tra hệ thống còn cho phép tạo admin đầu tiên hay không

Response:

```json
{
  "canBootstrapAdmin": true
}
```

### `POST /api/auth/bootstrap-admin`

Purpose:

- tạo admin đầu tiên khi hệ thống chưa có user nào

Request body:

```json
{
  "email": "admin@example.com",
  "password": "StrongPass123",
  "fullName": "RouteFlow Admin",
  "userName": "admin"
}
```

Response:

- `200 OK` với `AuthResponse`
- `409 Conflict` nếu hệ thống đã có user

### `POST /api/auth/login`

Request body:

```json
{
  "email": "admin@example.com",
  "password": "StrongPass123"
}
```

Response shape:

```json
{
  "accessToken": "jwt-token",
  "expiresAtUtc": "2026-04-13T00:00:00Z",
  "user": {
    "id": "guid",
    "email": "admin@example.com",
    "userName": "admin",
    "fullName": "RouteFlow Admin",
    "roles": ["Admin", "Dispatcher"]
  }
}
```

### `GET /api/auth/me`

Auth:

- yêu cầu bearer token

Response:

- user profile hiện tại

### `POST /api/auth/logout`

Current behavior:

- backend trả `204`
- session invalidation hiện đang là concern phía client

## Orders API

Auth:

- toàn bộ `Orders`, `Import`, `Routes` endpoints hiện yêu cầu bearer token

### `POST /api/orders`

Purpose:

- tạo một order mới

Request body:

```json
{
  "customerName": "Nguyen Van A",
  "phone": "0909...",
  "email": "a@example.com",
  "address": "123 Nguyen Trai, Q1",
  "latitude": 10.77,
  "longitude": 106.69,
  "note": "Giao giờ hành chính"
}
```

Validation:

- `customerName` bắt buộc
- `address` bắt buộc
- `latitude` trong `[-90, 90]`
- `longitude` trong `[-180, 180]`

Success response:

- `201 Created`
- body là `Guid` string của order vừa tạo

Notes:

- `orderCode`, `status`, `createdAt` do backend sinh ra

### `GET /api/orders`

Purpose:

- lấy full list order

Response item shape:

```json
{
  "id": "guid",
  "orderCode": "ORD-250101-ABCD",
  "customerName": "Nguyen Van A",
  "phone": "0909...",
  "email": "a@example.com",
  "address": "123 Nguyen Trai, Q1",
  "latitude": 10.77,
  "longitude": 106.69,
  "note": "Giao giờ hành chính",
  "status": 0,
  "createdAt": "2026-04-13T00:00:00Z"
}
```

### `GET /api/orders/{id}`

- trả `200` với `OrderDto`
- trả `404` nếu không có order

### `GET /api/orders/pending`

Purpose:

- lấy pool order cho planning

Current implementation note:

- handler chỉ map chắc chắn các field:
  - `id`
  - `orderCode`
  - `customerName`
  - `address`
  - `latitude`
  - `longitude`
  - `note`
  - `status`
  - `createdAt`
- `phone` và `email` trong DTO này hiện không được map rõ ở query handler, nên frontend không được phụ thuộc vào chúng ở endpoint này

### `GET /api/orders/stats`

Current backend response shape:

```json
{
  "totalOrders": 100,
  "pendingOrders": 30,
  "assignedOrders": 40,
  "deliveredOrders": 30
}
```

Contract drift:

- frontend interface hiện đang dùng `routingOrders`
- backend hiện trả `assignedOrders`
- đây là drift thật, không được coi là contract ổn định

Recommendation:

- chuẩn hóa một phía và sync cả hai
- không để frontend silently assume field không tồn tại

### `PUT /api/orders/{id}`

Purpose:

- update thông tin order

Request body:

```json
{
  "id": "guid",
  "customerName": "Nguyen Van A",
  "phone": "0909...",
  "email": "a@example.com",
  "address": "123 Nguyen Trai, Q1",
  "latitude": 10.77,
  "longitude": 106.69,
  "note": "Giao giờ hành chính"
}
```

Rules:

- route param `id` phải match body `id`
- `OrderCode` không được update

Response:

- `204 No Content`
- `404 Not Found` nếu order không tồn tại

### `PATCH /api/orders/{id}/status`

Request body:

```json
{
  "id": "guid",
  "newStatus": 3
}
```

Rules:

- route param `id` phải match body `id`
- `newStatus` phải là enum hợp lệ

Current gap:

- backend mới check enum validity, chưa check transition validity

### `DELETE /api/orders/{id}`

- trả `204` nếu xóa thành công
- trả `404` nếu order không tồn tại

### `DELETE /api/orders/batch`

Request body:

```json
["guid-1", "guid-2"]
```

Response:

- `204 No Content`
- `400 Bad Request` nếu body rỗng hoặc xóa không thành công

## Import API

### `POST /api/orders/import`

Purpose:

- import order từ file Excel

Request:

- `multipart/form-data`
- field name: `file`

Current Excel column contract:

1. `CustomerName`
2. `Address`
3. `Latitude`
4. `Longitude`
5. `Note`

Rules:

- thiếu `CustomerName` hoặc `Address` thì row bị skip
- nếu `Latitude`/`Longitude` parse fail thì default về `0`

Success response:

```json
{
  "message": "Orders imported successfully."
}
```

### `GET /api/orders/template`

Purpose:

- download template Excel

Response:

- file `OrderTemplate.xlsx`
- content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Current frontend behavior:

- `downloadTemplate()` đang dùng `window.open(...)`
- đây là browser navigation/open tab, không phải XHR

## Routes API

### `GET /api/routes/orders`

Purpose:

- lấy order list cho frontend map/route algo

Current implementation:

- chỉ là alias của `GetPendingOrdersQuery`
- không có route aggregate thật

### `POST /api/routes/cluster`

Purpose:

- chia orders thành các cluster logic cho planning UI

Request body:

```json
{
  "orders": [
    {
      "id": "guid",
      "orderCode": "ORD-...",
      "customerName": "Nguyen Van A",
      "address": "123 Nguyen Trai",
      "latitude": 10.77,
      "longitude": 106.69,
      "note": "",
      "status": 0,
      "createdAt": "2026-04-13T00:00:00Z"
    }
  ],
  "numberOfClusters": 2
}
```

Response shape:

```json
[
  {
    "clusterId": 1,
    "orders": []
  }
]
```

Current risk:

- backend đang trust order payload do frontend gửi lên
- đây là contract demo-friendly nhưng chưa production-safe

Target direction:

- backend nên cluster theo `orderIds` hoặc theo server-side query, không phải full mutable `OrderDto` từ client

## External Provider Contracts

### Nominatim

- dùng cho geocoding address
- backend background worker gọi Nominatim
- frontend cũng đang có geocoding/search trực tiếp cho optimize/search location

### OSRM

- frontend route optimization hiện gọi OSRM trực tiếp
- backend chưa là owner của routing contract

Implication:

- routing result hiện chưa phải server-authoritative artifact
- suitable cho Phase 1 demo
- chưa đủ tốt cho execution audit dài hạn

## Contract Drift And Risks

1. `OrderStats` drift:
   - frontend dùng `routingOrders`
   - backend trả `assignedOrders`

2. `GET /api/orders/pending` không phải full order projection an toàn cho mọi UI use case

3. `PATCH /api/orders/{id}/status` thiếu transition guard

4. `POST /api/routes/cluster` đang tin dữ liệu order từ client quá nhiều

5. Chưa có route resource contract canon:
   - không có `RouteDto`
   - không có route lifecycle endpoint
   - không có delivery execution contract theo route
