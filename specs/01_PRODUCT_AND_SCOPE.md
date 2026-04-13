# Product And Scope

## Product Definition

RouteFlow là công cụ quản lý đơn hàng và tối ưu tuyến giao cho batch đơn trong ngày theo hướng `dispatcher-first`.

Core flow của sản phẩm:

`Order -> Cluster -> Route -> Deliver -> Confirm`

RouteFlow không nhắm tới bài toán logistics platform full. Trọng tâm là giúp điều phối viên và shipper xử lý tốt flow giao hàng thực tế với chi phí vận hành hợp lý.

## In Scope

- Quản lý đơn hàng
- Geocoding địa chỉ
- Tối ưu tuyến giao hàng
- Điều phối theo batch đơn trong ngày
- Hỗ trợ thực thi giao hàng ngoài thực địa

## Out Of Scope

- SMS
- Analytics nặng
- VRP tối ưu toàn cục
- Feature trình diễn không tăng giá trị vận hành

## Current Product Modules

### Frontend

- `shipper-route-optimization/`
- Angular app cho map, route, điều phối và tác vụ giao hàng

### Backend

- `RouteFlow.Backend/`
- .NET API theo Clean Architecture
- xử lý business flow, persistence, integration và background jobs

## Product Priorities

### Phase 1

- làm chắc flow `nhập đơn -> tối ưu route -> đi giao -> cập nhật trạng thái`
- giảm lỗi vận hành do geocode/route fail
- chuẩn hóa domain trước khi mở rộng

### Phase 2

- auto-cluster
- dispatcher view tối thiểu
- gán cụm cho nhiều shipper
- theo dõi trạng thái cụm và đơn

### Phase 3

- proof of delivery bản nhẹ
- UX mobile cho shipper
- realtime tracking tối thiểu
- PWA sau khi flow mobile đủ chắc

## Product Constraints

- Không mở rộng sang Phase 2 khi Phase 1 chưa đủ chắc.
- Không thêm feature chỉ vì nhìn hay hoặc thuận prompt.
- Mọi feature mới phải phục vụ trực tiếp core flow hoặc làm hệ thống chắc hơn.
