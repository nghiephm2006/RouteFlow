# Architecture Decisions

## Mục tiêu

File này ghi lại các quyết định kiến trúc quan trọng để:

- model khác không "refactor theo cảm hứng"
- team không phải tranh luận lại từ đầu mỗi session
- mọi trade-off đều có context và consequence rõ ràng

## ADR-001: `specs/` là canonical entrypoint cho working context

### Status

- Accepted

### Context

- repo có nhiều file context rời rạc ở root
- dùng nhiều model khác nhau dễ gây lệch ngữ cảnh

### Decision

- gom bộ spec làm việc vào `specs/`
- `specs/README.md` là entrypoint chuẩn
- `03_DELIVERY_STATUS_AND_ROADMAP.md` là source of truth để biết next action

### Consequence

- model mới vào dự án đọc nhanh hơn
- root docs cũ có thể giữ tạm để tương thích, nhưng không nên là nguồn truth lâu dài

## ADR-002: Giữ backend theo Clean Architecture + CQRS

### Status

- Accepted

### Context

- RouteFlow có business flow nhiều bước, async processing và dễ phình rule
- nếu nhồi logic vào controller hoặc frontend thì sẽ nhanh vỡ invariant

### Decision

- giữ `Domain`, `Application`, `Infrastructure`, `Api`
- dùng MediatR command/query để tách intent
- FluentValidation ở pipeline thay vì validation rải rác

### Consequence

- code verbose hơn CRUD app đơn giản
- nhưng maintainable hơn khi bắt đầu chốt route lifecycle thật

## ADR-003: Domain phải là owner của business state, không phải frontend

### Status

- Accepted

### Context

- hiện frontend đã gánh nhiều phần route planning/execution
- backend vẫn còn quá order-centric

### Decision

- business status phải do backend/domain enforce
- frontend chỉ request transition và render state
- state machine `Order` và `Route` phải được chốt ở backend

### Consequence

- một số flow hiện tại ở UI sẽ phải kéo dần về backend
- đổi lại hệ thống ít drift hơn giữa UI và domain

## ADR-004: Geocoding là background concern, không block create/import

### Status

- Accepted

### Context

- create/import cần nhanh và không nên treo vì provider ngoài
- Nominatim có rate limit và độ ổn định không cao

### Decision

- order được tạo/import trước
- background worker xử lý geocode sau

### Consequence

- hệ thống cần rule rõ để phân biệt order đã/ chưa sẵn sàng planning
- sentinel `0,0` và `-1,-1` là nợ kỹ thuật cần xử lý tốt hơn

## ADR-005: `Cluster` hiện là service tạm, chưa là aggregate

### Status

- Accepted for Phase 1

### Context

- clustering hiện mới ở mức chia batch hỗ trợ planning
- chưa có domain boundary đủ rõ để đưa `Cluster` thành aggregate

### Decision

- giữ `ClusterService` như application/infrastructure service
- chưa persist `Cluster` như domain object chính thức

### Consequence

- đơn giản cho Phase 1
- nhưng không được nhầm đây là domain đã hoàn chỉnh

## ADR-006: `Route` sẽ là aggregate tiếp theo cần được đưa vào backend

### Status

- Accepted

### Context

- root issue hiện tại là hệ thống order-centric
- route execution là business artifact quan trọng nhất nhưng chưa có aggregate

### Decision

- bước domain tiếp theo là tạo `Route` aggregate
- `Route` phải quản lý:
  - batch order thuộc route
  - stop sequence
  - lifecycle thực thi

### Consequence

- nhiều endpoint/flow hiện tại sẽ phải được refactor
- nhưng đây là điều kiện để Phase 1 đủ chắc và Phase 2 không vỡ

## ADR-007: Frontend deploy trên Vercel, backend deploy trên Render, DB trên Neon

### Status

- Accepted

### Context

- Azure đang tốn chi phí cao hơn nhu cầu hiện tại
- frontend Angular phù hợp deploy tĩnh/proxy trên Vercel
- backend .NET không phù hợp đặt trên Vercel cho current architecture

### Decision

- frontend: Vercel
- backend: Render
- database: Neon PostgreSQL
- CI/CD: GitHub Actions

### Consequence

- chi phí hạ tầng thấp hơn
- phải quản lý secret, deploy hook và cold start thực tế cẩn thận hơn

## ADR-008: Route optimization hiện vẫn client-side cho Phase 1

### Status

- Accepted with debt

### Context

- frontend đang gọi OSRM trực tiếp và render map/legs
- backend chưa có route artifact đầy đủ

### Decision

- tạm giữ optimization ở frontend để hoàn thành Phase 1 nhanh
- không coi đây là end-state

### Consequence

- nhanh để demo và validate flow
- nhưng auditability, server authority và contract stability còn yếu

## ADR-009: Security event phải được coi là thật, không "để sau"

### Status

- Accepted

### Context

- repo đã từng có secret lộ trong history
- secret cũng từng bị paste trong chat/screen share

### Decision

- secret lộ ở bất kỳ đâu đều phải coi như compromised
- phải rotate thật, không chỉ xóa docs/code

### Consequence

- tăng overhead vận hành
- nhưng đây là giá phải trả để production không tự tạo rủi ro vô nghĩa

## ADR-010: Auth foundation dùng ASP.NET Core Identity + JWT

### Status

- Accepted

### Context

- app đã public qua Vercel/Render
- hệ thống trước đó chưa có login, các API chính chưa có user boundary
- cần slice auth đủ thực dụng để khóa workspace trước khi mở rộng multi-user flow

### Decision

- dùng ASP.NET Core Identity cho `User/Role`
- dùng JWT bearer cho API access
- dùng bootstrap admin cho lần khởi tạo đầu tiên
- frontend giữ token phía client và gửi bearer token qua interceptor

### Consequence

- thêm schema auth vào DB
- cần migration/schema update thật trên môi trường có .NET 10 SDK
- role-based permission có nền tảng để mở rộng nhưng chưa phải RBAC hoàn chỉnh
