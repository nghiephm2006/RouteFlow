# RouteFlow

RouteFlow là công cụ quản lý đơn hàng và tối ưu tuyến giao cho batch đơn trong ngày, theo hướng `dispatcher-first`.

Sản phẩm này không nhắm tới bài toán logistics platform full. Trọng tâm hiện tại là giúp điều phối viên và shipper xử lý tốt hơn flow:

`Order -> Cluster -> Route -> Deliver -> Confirm`

## Phạm vi sản phẩm

RouteFlow tập trung vào:

- Quản lý đơn hàng
- Geocoding địa chỉ
- Tối ưu route giao hàng
- Điều phối theo batch đơn trong ngày
- Hỗ trợ thực thi giao hàng ngoài thực địa

Chưa ưu tiên:

- SMS
- Dashboard analytics nặng
- VRP tối ưu toàn cục
- Feature trình diễn không tăng giá trị vận hành

## Kiến trúc tổng quan

Dự án hiện có 2 phần chính:

1. `shipper-route-optimization/`
   Frontend Angular, giao diện bản đồ và thao tác route.
2. `RouteFlow.Backend/`
   Backend .NET 10 theo Clean Architecture, xử lý business flow, dữ liệu và background jobs.

## Tech Stack

### Frontend

- Angular + Tailwind CSS
- Leaflet + OpenStreetMap
- OSRM cho route optimization
- Nominatim cho geocoding

### Backend

- .NET 10
- Clean Architecture + DDD
- CQRS với MediatR
- FluentValidation
- PipelineBehavior
- UnitOfWork
- Domain Events
- PostgreSQL
- Background Geocoding Service
- Excel Import với EPPlus
- Email Notification qua SMTP

### Deploy

- Docker
- Azure VM

## CI/CD (GitHub Actions + Vercel)

Repo da co san workflow de chuyen sang huong tiet kiem chi phi:

- CI build frontend + backend: `.github/workflows/ci.yml`
- CD frontend len Vercel: `.github/workflows/deploy-frontend-vercel.yml`
- CD backend qua deploy hook: `.github/workflows/deploy-backend-hook.yml`

Chi tiet setup secrets va rollout: `DEPLOYMENT_GITHUB_ACTIONS_VERCEL.md`

## Những gì đã có

### Frontend

- Giao diện map + orders
- Tối ưu tuyến với OSRM
- Cập nhật trạng thái giao hàng từ bản đồ
- Re-optimize tuyến còn lại sau khi giao
- Forward từ danh sách đơn sang map
- Smart markers và state persistence
- Dark mode
- Traffic multiplier và service time

### Backend

- CRUD đơn hàng
- Import Excel
- Auto-generate `OrderCode`
- Geocoding background job
- Validation qua FluentValidation + PipelineBehavior
- Cấu trúc dự án theo Clean Architecture
- Email notification khi đơn chuyển sang `Delivered`

## Trạng thái hiện tại

- Current phase: `Phase 1 - Core route workflow stable`
- Hệ thống đã có baseline đủ để demo và test nội bộ
- Azure VM đã từng chạy bản deploy đầu tiên, nhưng hiện trạng hạ tầng cần được kiểm tra lại trước khi public demo tiếp

## Những gì còn thiếu ở Phase 1

- Navigation deep link
- Reliability rõ ràng cho geocode/route
- Retry/caching cơ bản cho geocoding job
- Chuẩn hoá trạng thái nghiệp vụ cho `Order` và `Route`
- Đưa `Route` thành aggregate đúng nghĩa ở backend

## Hướng phát triển theo phase

### Phase 1: Core route workflow stable

Mục tiêu:

- Làm chắc flow `nhập đơn -> tối ưu route -> đi giao -> cập nhật trạng thái`
- Giảm lỗi vận hành do geocode/route fail
- Chuẩn hoá domain trước khi mở rộng

### Phase 2: Multi-cluster + dispatcher

Mục tiêu:

- Auto-cluster
- Dispatcher view tối thiểu
- Gán cụm cho nhiều shipper
- Theo dõi trạng thái cụm và đơn

### Phase 3: Field execution

Mục tiêu:

- Proof of Delivery bản nhẹ
- UX mobile cho shipper
- Realtime tracking tối thiểu
- PWA khi flow mobile đã đủ chắc

## Chạy local

### Frontend

```bash
cd shipper-route-optimization
npm install
npm run start
```

Frontend mặc định chạy tại `http://localhost:4200`.

### Backend

```bash
cd RouteFlow.Backend/RouteFlow.Api
dotnet run
```

Backend development mặc định chạy tại `https://localhost:7141`.

### Docker Compose

```bash
docker compose up --build
```

Sau khi chạy:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8081`
- Health: `http://localhost:8081/health`
- PostgreSQL: `localhost:5432`

## Cấu hình

- Dùng environment variables hoặc user secrets cho `ConnectionStrings__DefaultConnection`
- Không lưu credentials thật trong repo
- Nếu dùng SMTP, cấu hình:
  - `SmtpSettings__Host`
  - `SmtpSettings__Port`
  - `SmtpSettings__Username`
  - `SmtpSettings__Password`
  - `SmtpSettings__FromEmail`

## Lưu ý bảo mật

- `appsettings.json` chỉ nên chứa placeholder
- Secret cũ đã từng tồn tại trong lịch sử git, nên việc rotate và kiểm tra remote vẫn là bắt buộc
- Không public thông tin hạ tầng thật nếu không cần thiết

## File nên đọc trước khi tiếp tục làm việc

- [`WORKFLOW_RULES.md`](/D:/Works/Personal/RouteFlow/WORKFLOW_RULES.md)
  Quy tắc tổng cho toàn bộ bộ file context và workflow làm việc với AI.
- [`PROJECT_STATUS.md`](/D:/Works/Personal/RouteFlow/PROJECT_STATUS.md)
  Trạng thái hiện tại của dự án: đã làm, đang làm, vướng, phase, todo, next actions.
- [`AI_CONTEXT.md`](/D:/Works/Personal/RouteFlow/AI_CONTEXT.md)
  Ngữ cảnh kỹ thuật và product handover cho AI.
- [`COMMIT_PUSH_CONTEXT.md`](/D:/Works/Personal/RouteFlow/COMMIT_PUSH_CONTEXT.md)
  Quy tắc bắt buộc phải cập nhật context trước mỗi lần `commit push`.
- [`SECURITY_TODO.md`](/D:/Works/Personal/RouteFlow/SECURITY_TODO.md)
  Các việc bảo mật và chi phí hạ tầng còn phải làm.
