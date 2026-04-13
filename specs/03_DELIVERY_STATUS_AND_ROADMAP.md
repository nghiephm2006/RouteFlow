# Delivery Status And Roadmap

## Current Phase

- `Phase 1: Core route workflow stable`

### Vì sao vẫn ở Phase 1

- core workflow đã có khung nhưng chưa đủ chắc để chuyển sang multi-cluster
- `Route` chưa là aggregate trung tâm
- `Cluster` chưa là domain rõ ràng
- error handling và route execution vẫn cần làm chắc hơn

## Đã Làm

- đã có quản lý đơn hàng với CRUD, import Excel và geocoding background job
- đã có route optimization cơ bản với OSRM, Leaflet và re-optimize sau khi giao
- backend chạy trên .NET 10 + PostgreSQL với Clean Architecture, CQRS, FluentValidation, UnitOfWork và Domain Events
- đã có baseline deploy bằng Docker
- đã dọn secret khỏi HEAD và rewrite git history để xóa Gmail SMTP app password cũ
- đã gỡ public IP Azure khỏi docs
- Azure VM `routeflow-vm` đã được deallocate và port `8081` đã đóng
- đã chuẩn hóa bộ file context về UTF-8 không BOM và kiểm tra tiếng Việt
- đã gom bộ spec canonical vào `specs/` để thay thế cách đọc context rời rạc ở root
- đã bổ sung phần spec còn thiếu cho dự án:
  - domain rules và state machines
  - API và interface contracts
  - user flows và failure scenarios
  - architecture decisions
  - model conformance rules
- đã thêm GitHub Actions CI/CD
- đã thêm `vercel.json` để proxy `/api/*` và `/health` sang backend
- đã hoàn tất cutover deploy:
  - frontend trên Vercel
  - backend trên Render
  - database trên Neon PostgreSQL
- đã chỉnh frontend:
  - thêm nút cấu hình lộ trình ở top bar
  - chuyển điều khiển cấu hình ra khỏi sidebar header
  - mặc định giao diện sáng nếu user chưa chọn theme
- đã đổi tên root `package-lock.json` về `RouteFlow`

## Đang Làm

- quay lại ưu tiên core domain sau khi hạ tầng deploy đã ổn định
- chốt state machine cho `Order` và `Route` trước khi thêm feature mới

## Vướng

- Gmail app password cũ đã bị lộ trong quá khứ, cần rotate thủ công
- hệ thống vẫn còn quá order-centric, chưa có `Route` aggregate đúng nghĩa
- chưa có `Cluster` domain rõ ràng, chưa nên đẩy sang Phase 2
- một số secret đã từng được paste ở môi trường chat, cần rotate ngay trước khi push production
- cần decommission hoàn toàn phần Azure còn sót nếu vẫn còn resource tính phí

## Todo

### Ưu tiên cao

- rotate ngay các secret đã lộ:
  - `VERCEL_TOKEN`
  - Render deploy hook key
  - Neon database password
- xác nhận production ổn định:
  - UI trên Vercel
  - API trên Render
  - template download
  - route optimization flow cơ bản
- chốt state machine cho `Order` và `Route`
- tạo `Route` aggregate ở backend
- tách `Cluster` thành domain/service rõ ràng
- làm reliability cho geocode/route
- thêm navigation deep link cho route execution

### Ưu tiên trung bình

- tạo dispatcher view tối thiểu cho một batch route
- ghi log nghiệp vụ cho route/geocode/status change
- chuẩn bị data model cho proof of delivery bản nhẹ

### Ưu tiên thấp

- rà lại chồng chéo giữa các file docs cũ và bộ spec mới
- cân nhắc chuyển các file root cũ thành thin entrypoint trỏ sang `specs/`
- decommission toàn bộ Azure resources không còn dùng để tránh phát sinh chi phí

## Next 3 Actions

1. Rotate toàn bộ secret đã lộ và cập nhật lại env/secrets production.
2. Chốt state machine `Order` và `Route`.
3. Thiết kế `Route` aggregate và boundary của `Cluster`.
