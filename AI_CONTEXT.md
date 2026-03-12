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

1. Cấu trúc Clean Architecture 4 tầng: `Domain`, `Application`, `Infrastructure`, `Api`.
2. Khởi tạo Domain `Order`, `OrderStatus`, Interfaces Repo và UnitOfWork.
3. **CQRS Kháng lỗi**: `CreateOrderCommand`, `UpdateOrderCommand`, `GetOrdersQuery`, `GetOrderByIdQuery`,...
4. **Auto-Generate OrderCode**: Khi tạo đơn, Backend tự động sinh mã `ORD-YYMMDD-XXXX`. Form cập nhật (`UpdateOrder`) bị cấm ghi đè (không được nhận) OrderCode.
5. `ExcelImportService` và `ExcelTemplateService`: Hỗ trợ người dùng kéo thả file Excel hàng trăm đơn để nạp vào DB. (Data mẫu Excel đang fix ở khu Landmark 81, HCM).
6. **Geocoding Background Service**: Dịch vụ nền (.NET Hosted Service) tự động quét các đơn thiếu vắng Tọa độ (Lat/Lng = 0), gọi Nominatim API delay 1.5s/request để kéo tọa độ đắp vào hệ thống (Hybrid Approach).
7. `GlobalExceptionMiddleware` xử lý lỗi trả bề JSON chuẩn.

### Frontend

1. Tách layout Sidebar hiện đại, chia 2 Tab: **Route Optimization** (Bản đồ) và **Orders Manager** (Quản lý đơn hàng).
2. Tích hợp `order.service.ts` gọi CRUD API xuống .NET (cổng `https://localhost:7141/`).
3. Khung bảng (Table) Orders hiện thông tin chi tiết: Mã đơn, Khách hàng, Toạ độ, Ghi chú.
4. Nút bấm tương tác trên bảng: Xoá Đơn, Sửa Đơn, Import Excel, Tải Template, Làm mới (có Debounce 2 giây).
5. **Add/Edit Order Form**: Nhập tay tên/địa chỉ. Ô địa chỉ có cơ chế Autocomplete gọi thẳng Nominatim với custom Dropdown.
6. **Deployment**: Triển khai bản sản xuất (Production). Đóng gói Docker cho Backend, kết nối Azure SQL Database (đã có account sinh viên), và host Frontend lên Vercel.
7. **Google Maps Migration (Optional)**: Chuyển đổi từ Leaflet/Nominatim sang Google Maps Platform (Maps, Places, Geocoding, Directions API) để tối ưu dữ liệu tại Việt Nam.

---

## 🎯 Định hướng Roadmap (Việc cần làm tiếp theo)

Khi người dùng (USER) yêu cầu bạn làm tiếp dự án, hãy bám sát vào các định hướng (TODO) sau:

1. **Update Status**: Tính năng Cập nhật trạng thái đơn hàng (Đang giao, Giao thành công, Khách hẹn lại,...).
2. **Forward to Map**: Nút bấm ở bảng Quản lý Đơn để chuyển tiếp (FlyTo) góc nhìn thẳng sang Marker trên bản đồ.
3. **Quản lý Khách hàng**: Bổ sung _Phone + Email_, tự động bắn Noti (thông báo/email) khi Shipper chuyển trạng thái đơn.
4. **Auto-Cluster System**: Mở rộng hệ thống tự động gom nhóm (Auto-cluster) Đơn hàng theo lô/khu vực thông qua thuật toán (ví dụ K-Means). Tạo ra nhiều Routes phân bổ cho nhiều Shipper song song để tăng tốc độ giao hàng.

---

**[CHỈ THỊ CHO AI]**
Bạn vừa nạp xong ngữ cảnh. Hãy ghi nhớ rằng mọi thay đổi C# Backend phải tuyệt đối tuân thủ Clean Architecture, không đâm thủng tầng (Domain không gọi xuống Infra). File Frontend Angular luôn dùng Tailwind. Bắt đầu trả lời người dùng đi!
