# AI Context - RouteFlow

## Mục tiêu file này

Đây là file handover kỹ thuật và product cho AI khi tiếp tục làm việc với RouteFlow.

Nếu bắt đầu một session mới, thứ tự đọc nên là:

1. `PROJECT_STATUS.md`
2. `AI_CONTEXT.md`
3. `COMMIT_PUSH_CONTEXT.md`
4. `SECURITY_TODO.md`

## Định vị sản phẩm

RouteFlow không phải logistics platform full.

RouteFlow là công cụ:

- quản lý đơn hàng
- tối ưu tuyến giao
- hỗ trợ điều phối theo batch đơn trong ngày

Hướng hiện tại là `dispatcher-first`.

Feature chỉ nên được ưu tiên nếu phục vụ trực tiếp flow:

`Order -> Cluster -> Route -> Deliver -> Confirm`

Không ưu tiên:

- SMS
- analytics nặng
- VRP toàn cục
- feature trình diễn

## Tech Stack

### Frontend

- Angular
- Tailwind CSS
- Leaflet
- OpenStreetMap
- OSRM
- Nominatim

### Backend

- .NET 10
- Clean Architecture
- DDD
- CQRS với MediatR
- FluentValidation
- PipelineBehavior
- UnitOfWork
- Domain Events
- PostgreSQL
- Background Geocoding Service
- Excel Import với EPPlus
- SMTP email notification

### Deploy

- Docker
- Azure VM (legacy, cần giảm phụ thuộc để tối ưu chi phí)
- GitHub Actions cho CI/CD
- Vercel cho frontend
- Backend deploy bằng deploy hook trên Render
- Database managed trên Neon PostgreSQL

## Trạng thái hệ thống hiện tại

### Phase hiện tại

- `Phase 1: Core route workflow stable`

### Lý do vẫn ở Phase 1

- Core workflow đã có khung nhưng chưa đủ chắc để đi sang multi-cluster
- `Route` chưa là aggregate trung tâm
- `Cluster` chưa là domain rõ ràng
- Reliability cho geocode/route vẫn chưa hoàn chỉnh

## Những gì đã hoàn thành

### Backend

- Cấu trúc 4 tầng: `Domain`, `Application`, `Infrastructure`, `Api`
- CQRS + MediatR
- FluentValidation qua pipeline
- CRUD đơn hàng
- Auto-generate `OrderCode`
- Import Excel
- Geocoding background service
- Email notification qua SMTP
- PostgreSQL + EF Core migrations

### Frontend

- Giao diện map + orders
- Tối ưu route với OSRM
- Map-based status update
- Re-optimize sau khi giao
- Forward to map
- Smart markers
- State persistence
- Dark mode
- Traffic multiplier + service time

### Hạ tầng và bảo mật

- Có baseline Docker để chạy local/test
- Đã dọn secret khỏi `HEAD`
- Đã rewrite git history để xóa secret cũ
- Đã gỡ public IP khỏi docs
- Đã thêm workflow CI/CD bằng GitHub Actions và cấu hình deploy frontend qua Vercel
- Đã có cấu hình proxy API frontend sang backend production qua `vercel.json`
- Production hiện tại đã chạy theo stack:
  - frontend: Vercel
  - backend: Render
  - database: Neon

## Những gì đang thiếu

### Thiếu ở domain

- `Route` aggregate
- `Cluster` domain logic rõ ràng
- state machine chuẩn cho `Order` và `Route`

### Thiếu ở workflow

- navigation deep link
- reliability cho geocode/route
- retry/caching cho geocoding
- dispatcher view tối thiểu

### Thiếu ở field execution

- POD bản nhẹ
- mobile execution flow đủ chắc
- tracking tối thiểu

## Roadmap theo phase

### Phase 1

Ưu tiên:

- Chuẩn hoá trạng thái `Order` và `Route`
- Tạo `Route` aggregate
- Làm reliability cho geocode/route
- Thêm navigation deep link
- Retry/caching cơ bản cho geocoding

### Phase 2

Ưu tiên:

- Auto-cluster
- Multi-cluster dispatcher workflow
- Dispatcher view tối thiểu
- Nhật ký thay đổi trạng thái và lỗi

### Phase 3

Ưu tiên:

- Proof of Delivery bản nhẹ
- UX mobile cho shipper
- Realtime tracking tối thiểu
- PWA sau khi flow mobile đủ chắc

## Nguyên tắc kiến trúc

- Không phá Clean Architecture
- Không thêm feature chỉ vì nhìn hay
- Ưu tiên value vận hành thật
- Domain phải rõ, không đẩy business logic hết ra UI
- Không mở rộng Phase 2 khi Phase 1 còn chưa chắc

## Chỉ thị cho AI

- Khi user hỏi roadmap hoặc trạng thái, luôn bám `PROJECT_STATUS.md`
- Khi user yêu cầu `commit push`, phải cập nhật:
  - `Đã làm`
  - `Đang làm`
  - `Vướng`
  - `Phase hiện tại`
  - `Todo`
  - `Next 3 Actions`
- Không `commit push` nếu context chưa được cập nhật đúng
- Nếu có thay đổi ảnh hưởng product, architecture, deploy, security hoặc roadmap, phải sync lại `README.md` và `AI_CONTEXT.md`
- Với strategy deploy mới: luôn nhắc rõ Vercel chỉ deploy frontend; backend dùng provider phù hợp cho .NET API
- Sau khi deploy ổn định, quay lại ưu tiên domain model thay vì tiếp tục tối ưu hạ tầng
