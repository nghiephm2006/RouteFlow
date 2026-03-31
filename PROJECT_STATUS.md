# Trạng Thái Dự Án

Mục tiêu: đây là file trạng thái trung tâm, cần đọc đầu tiên trước khi tiếp tục làm việc với RouteFlow.

Cập nhật lần cuối: 2026-03-31

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

## Đang làm

- Giữ RouteFlow đi đúng hướng dispatcher-first.
- Chốt lại roadmap theo flow: Order -> Cluster -> Route -> Deliver -> Confirm.
- Tiếp tục siết ranh giới vai trò giữa các file docs để tránh chồng chéo lâu dài.

## Vướng

- Gmail app password cũ đã bị lộ trong quá khứ, cần rotate thủ công trong tài khoản Google.
- Hệ thống vẫn còn quá order-centric, chưa có Route aggregate đúng nghĩa.
- Chưa có Cluster domain rõ ràng, nên chưa nên đẩy sang Phase 2.

## Phase hiện tại

- Phase 1: Core route workflow stable

Lý do:
- Core workflow đã có khung nhưng chưa đủ chắc để chuyển sang phase multi-cluster.
- Route vẫn chưa là aggregate trung tâm.
- Error handling và route execution vẫn cần làm chắc hơn.

## Todo

### Ưu tiên cao

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
- [ ] Đánh giá lại deploy strategy trước khi public demo lại

## Next 3 Actions

1. Chốt state machine cho Order và Route.
2. Thiết kế Route aggregate và boundary của Cluster.
3. Làm route/geocode reliability trước khi thêm feature mới.

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
