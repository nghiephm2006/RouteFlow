# Trạng Thái Dự Án

Mục tiêu: đây là file trạng thái trung tâm, cần đọc đầu tiên trước khi tiếp tục làm việc với RouteFlow.

Cập nhật lần cuối: 2026-04-13

## Đã làm

- Đã có quản lý đơn hàng với CRUD, import Excel và geocoding background job.
- Đã có route optimization cơ bản với OSRM, Leaflet và re-optimize sau khi giao thành công.
- Backend đã chạy trên .NET 10 + PostgreSQL với Clean Architecture, CQRS, FluentValidation, UnitOfWork và Domain Events.
- Đã có baseline deploy bằng Docker.
- Đã dọn secret khỏi HEAD và rewrite git history để xóa Gmail SMTP app password cũ.
- Đã gỡ public IP Azure khỏi docs.
- Azure VM routeflow-vm đã được deallocate và port 8081 đã đóng.
- Đã tạo `WORKFLOW_RULES.md` để chuẩn hóa cách đọc và cập nhật context file.
- Đã viết lại `README.md` và `AI_CONTEXT.md` theo vai trò rõ ràng hơn.
- Đã chuẩn hóa `PROJECT_STATUS.md`, `COMMIT_PUSH_CONTEXT.md`, `SECURITY_TODO.md` về UTF-8 không BOM và kiểm tra lại tiếng Việt.
- Đã thêm bộ GitHub Actions CI/CD:
  - CI build frontend Angular + backend .NET 10
  - CD frontend lên Vercel
  - CD backend qua deploy hook
- Đã thêm `shipper-route-optimization/vercel.json` để:
  - fallback SPA về `index.html`
  - proxy `/api/*` và `/health` sang backend Render
- Đã thêm tài liệu triển khai `DEPLOYMENT_GITHUB_ACTIONS_VERCEL.md`.
- Đã hoàn tất cutover deploy chi phí thấp:
  - frontend chạy trên Vercel
  - backend chạy trên Render
  - database chạy trên Neon PostgreSQL
- Đã điều chỉnh frontend:
  - thêm nút cấu hình lộ trình ở top bar
  - chuyển điều khiển cấu hình ra khỏi sidebar header
  - mặc định giao diện sáng nếu user chưa chọn theme
- Đã đổi tên `package-lock.json` root từ `Vibe-coding` về `RouteFlow`.

## Đang làm

- Quay lại ưu tiên core domain sau khi hạ tầng deploy đã ổn định.
- Chốt state machine cho `Order` và `Route` trước khi thêm feature mới.

## Vướng

- Gmail app password cũ đã bị lộ trong quá khứ, cần rotate thủ công trong tài khoản Google.
- Hệ thống vẫn còn quá order-centric, chưa có Route aggregate đúng nghĩa.
- Chưa có Cluster domain rõ ràng, nên chưa nên đẩy sang Phase 2.
- Một số secret đã từng được paste ở môi trường chat, cần rotate ngay trước khi push production.
- Cần decommission hoàn toàn phần Azure còn sót nếu vẫn còn resource tính phí.

## Phase hiện tại

- Phase 1: Core route workflow stable

Lý do:
- Core workflow đã có khung nhưng chưa đủ chắc để chuyển sang phase multi-cluster.
- Route vẫn chưa là aggregate trung tâm.
- Error handling và route execution vẫn cần làm chắc hơn.

## Todo

### Ưu tiên cao

- [ ] Rotate ngay các secret đã lộ:
  - `VERCEL_TOKEN`
  - Render deploy hook key
  - Neon database password
- [ ] Xác nhận production ổn định:
  - UI trên Vercel
  - API trên Render
  - template download
  - route optimization flow cơ bản
- [ ] Chốt state machine cho Order và Route
- [ ] Tạo Route aggregate ở backend
- [ ] Tách Cluster thành domain/service rõ ràng
- [ ] Làm reliability cho geocode/route
- [ ] Thêm navigation deep link cho route execution

### Ưu tiên trung bình

- [ ] Tạo dispatcher view tối thiểu cho một batch route
- [ ] Ghi log nghiệp vụ cho route/geocode/status change
- [ ] Chuẩn bị data model cho Proof of Delivery bản nhẹ

### Ưu tiên thấp

- [ ] Rà lại chồng chéo giữa README.md, AI_CONTEXT.md và PROJECT_STATUS.md sau đợt cleanup docs
- [ ] Decommission toàn bộ Azure resources không còn dùng để tránh phát sinh chi phí

## Next 3 Actions

1. Rotate toàn bộ secret đã lộ và cập nhật lại env/secrets production.
2. Chốt state machine `Order` và `Route`.
3. Thiết kế `Route` aggregate và boundary của `Cluster`.

## Quy tắc

- Mỗi lần bắt đầu session, đọc file này trước.
- Mỗi lần có lệnh commit push, phải cập nhật đầy đủ:
  - Đã làm
  - Đang làm
  - Vướng
  - Phase hiện tại
  - Todo
  - Next 3 Actions
- Nếu roadmap thay đổi, file này phải được cập nhật trước khi push.
