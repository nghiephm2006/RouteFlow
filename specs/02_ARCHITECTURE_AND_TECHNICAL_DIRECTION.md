# Architecture And Technical Direction

## Architecture Overview

RouteFlow hiện có 2 khối chính:

1. Frontend Angular trong `shipper-route-optimization/`
2. Backend .NET trong `RouteFlow.Backend/`

Backend đi theo hướng:

- Clean Architecture
- DDD
- CQRS với MediatR
- FluentValidation
- UnitOfWork
- Domain Events

## Technology Stack

### Frontend

- Angular
- Tailwind CSS
- Leaflet
- OpenStreetMap
- OSRM
- Nominatim

### Backend

- .NET 10
- PostgreSQL
- EF Core
- EPPlus
- SMTP email notification

### Deployment

- Docker cho local/test
- GitHub Actions cho CI/CD
- Vercel cho frontend
- Render cho backend
- Neon PostgreSQL cho database managed

## What Already Exists

### Backend

- cấu trúc 4 tầng: `Domain`, `Application`, `Infrastructure`, `Api`
- CRUD đơn hàng
- import Excel
- auto-generate `OrderCode`
- geocoding background service
- PostgreSQL + migrations
- email notification

### Frontend

- giao diện map + orders
- route optimization với OSRM
- map-based status update
- re-optimize sau khi giao
- forward to map
- smart markers
- state persistence
- dark mode
- traffic multiplier + service time

## Technical Direction

- Domain là nguồn sự thật cho business rule, không đẩy hết logic sang UI.
- Phase 1 phải tập trung vào domain clarity và workflow reliability.
- Hạ tầng deploy đã chuyển sang mô hình chi phí thấp; ưu tiên hiện tại không còn là infra-first.

## Current Technical Gaps

### Domain

- `Route` chưa là aggregate trung tâm
- `Cluster` chưa có domain logic rõ ràng
- state machine cho `Order` và `Route` chưa được chốt

### Workflow

- navigation deep link
- reliability cho geocode/route
- retry/caching cho geocoding
- dispatcher view tối thiểu

### Execution

- POD bản nhẹ
- mobile execution flow đủ chắc
- tracking tối thiểu

## Non-Negotiable Architecture Rules

- Không phá Clean Architecture.
- Không dùng frontend làm nơi quyết định business state.
- Không đổi roadmap bằng trí nhớ; phải bám current status spec.
- Sau khi deploy ổn định, ưu tiên quay lại giải quyết core domain thay vì tiếp tục vá hạ tầng.
