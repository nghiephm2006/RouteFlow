# AI Context Handover - RouteFlow Logistics System

**Chào AI Assistant tương lai!**
Nếu bạn đang đọc file này, điều đó có nghĩa là người dùng (USER) vừa chuyển sang một máy tính mới hoặc khởi tạo một môi trường AntiGravity mới và cần bạn nắm bắt lại toàn bộ bối cảnh dự án để tiếp tục làm việc một cách mượt mà nhất. Dưới đây là bộ nhớ (Context) của dự án RouteFlow!

---

## 🏗 Tổng quan Kiến trúc & Tech Stack

Dự án RouteFlow giải quyết bài toán Quản lý & Tối ưu tuyến đường giao hàng (Vehicle Routing / TSP). Hệ thống bao gồm 2 phần độc lập:

1. **Frontend (`shipper-route-optimization/`)**:
   - Angular 16+ (Standalone Components), Tailwind CSS, TypeScript.
   - Thư viện Bản đồ: Leaflet (OpenStreetMap).
   - Core API sử dụng: OSRM Trip API (Tối ưu tuyến đường), Nominatim API (Geocoding / Autocomplete).

2. **Backend (`RouteFlow.Backend/`)**:
   - .NET 10 (ASP.NET Core Web API), C# 12.
   - **Architecture**: Clean Architecture & Domain-Driven Design (DDD).
   - **Patterns**: CQRS với MediatR, Repository Pattern, Unit of Work.
   - **Database**: Entity Framework Core (chưa config thực tế, hiện đang dùng setup EF).
   - **Libraries**: FluentValidation (bắt ở PipelineBehavior của MediatR), EPPlus (để Import/Template Excel).

---

## ✅ Các Tính năng đã Hoàn thiện (Đã code xong)

### Backend
1. **Cấu trúc Clean Architecture 4 tầng**: `Domain`, `Application`, `Infrastructure`, `Api`.
2. **CQRS & MediatR**: Hệ thống Command/Query chuẩn mực, tích hợp FluentValidation.
3. **Auto-Generate OrderCode**: Mã `ORD-YYMMDD-XXXX` tự sinh, bất biến khi Update.
4. **Geocoding Background Service**: Tự động lấy toạ độ đơn hàng từ địa chỉ thông qua Nominatim ngầm.
5. **Excel Integration**: Import file Excel hàng loạt và Export template chuẩn EPPlus.
6. **Email Notifications**: Tích hợp **Gmail SMTP (MailKit)**, tự động gửi email thông báo cho khách hàng khi trạng thái đơn hàng thay đổi thành "Delivered".

### Frontend
1. **Sidebar & Map Layout**: Chia 2 Tab (Map/Orders) với giao diện Xanh/Cam hiện đại.
2. **Interactive Optimization**:
   - Sử dụng **OSRM Trip API** để tối ưu bài toán TSP.
   - **Tuyến đường tương tác**: Hiển thị đa màu sắc (Đa sắc theo từng chặng), cho phép click vào từng chặng (Leg) để xem Quãng đường & Thời gian dự kiến.
   - **Map-based Status Update**: Nút "Giao thành công" ngay trong popup của Marker hoặc Segment. Clicking confirm sẽ cập nhật DB và **tự động tính toán lại (Re-optimize)** tuyến đường còn lại từ vị trí hiện tại.
3. **Quản lý Đơn hàng nâng cao**: Đầy đủ CRUD, có thêm trường **Phone & Email**.
4. **Duy trì Trạng thái (State Persistence)**: Chuyển đổi qua lại giữa Tab Map và Orders không bị mất dữ liệu hay vị trí bản đồ (sử dụng `[class.hidden]` và `invalidateSize`).
5. **Forward to Map**: Nút tắt từ bảng Orders để "bay" thẳng tới vị trí đơn hàng trên bản đồ (FlyTo).
6. **Smart Markers**: Phóng to Điểm bắt đầu (Home), đánh số thứ tự (1, 2, 3...) cho lộ trình giao hàng trực quan.

---

## 🎯 Định hướng Roadmap (Việc cần làm tiếp theo)

1. **Auto-Cluster System**: Gom nhóm Đơn hàng theo lô/khu vực (K-Means) để chia cho nhiều Shipper.
2. **Tích hợp SMS**: Gửi tin nhắn tự động (Zalo/Twilio) song song với Email.
3. **Realtime Tracking**: Thêm WebSockets (SignalR) bắn toạ độ GPS Shipper.
4. **Triển khai (Deployment)**: Đóng gói Docker, cấu hình Azure SQL Database thực tế.

---

**[CHỈ THỊ CHO AI]**
Bạn vừa nạp xong ngữ cảnh. Hãy ghi nhớ:
- `Backend`: Tuyệt đối tuân thủ Clean Architecture.
- `Frontend`: Dùng Tailwind, Logic Map nằm ở `MapComponent`, xử lý Data chính ở `App.ts`.
- `Models`: `OptimizedRoute` và `Order` là 2 schema quan trọng nhất. 
Bắt đầu trả lời người dùng đi!
