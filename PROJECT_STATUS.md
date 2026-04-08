# Trạng Thái Dự Án

Mục tiêu: đây là file trạng thái trung tâm, cần đọc đầu tiên trước khi tiếp tục làm việc với RouteFlow.

Cập nhật lần cuối: 2026-04-08

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

## Đang làm

- Chuyển hạ tầng deploy từ Azure VM sang mô hình chi phí thấp:
  - frontend trên Vercel
  - backend + database trên provider rẻ/free tier
  - orchestration bằng GitHub Actions
- Chốt checklist cutover production và xác nhận pipeline chạy ổn định sau push.

## Vướng

- Gmail app password cũ đã bị lộ trong quá khứ, cần rotate thủ công trong tài khoản Google.
- Hệ thống vẫn còn quá order-centric, chưa có Route aggregate đúng nghĩa.
- Chưa có Cluster domain rõ ràng, nên chưa nên đẩy sang Phase 2.
- Secrets production cho CI/CD phải do owner cấu hình trên GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `BACKEND_DEPLOY_HOOK_URL`
- Một số secret đã từng được paste ở môi trường chat, cần rotate ngay trước khi push production.

## Phase hiện tại

- Phase 1: Core route workflow stable

Lý do:
- Core workflow đã có khung nhưng chưa đủ chắc để chuyển sang phase multi-cluster.
- Route vẫn chưa là aggregate trung tâm.
- Error handling và route execution vẫn cần làm chắc hơn.

## Todo

### Ưu tiên cao

- [ ] Rotate ngay `VERCEL_TOKEN` và regenerate Render deploy hook key mới
- [ ] Cấu hình đầy đủ GitHub Actions secrets cho pipeline mới
- [ ] Push `main` và xác nhận 3 workflow chạy xanh (CI, frontend deploy, backend deploy hook)
- [ ] Xác nhận route API production qua `https://routeflow.onrender.com`
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
- [ ] Decommission Azure resources không còn dùng để tránh phát sinh chi phí

## Next 3 Actions

1. Rotate toàn bộ secret đã lộ (Vercel token, Render deploy hook) và cập nhật lại GitHub secrets.
2. Push `main`, theo dõi 3 workflow GitHub Actions đến khi xanh hoàn toàn.
3. Sau khi deploy ổn định, quay lại ưu tiên domain: state machine `Order/Route` và `Route` aggregate.

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
