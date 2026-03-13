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
7. **Dark Mode & Theme Support**: Sử dụng `ThemeService` (Signals) để quản lý giao diện. Bản đồ Leaflet được cố định ở Light Mode theo yêu cầu người dùng để đảm bảo độ rõ nét.
8. **Realistic Routing Estimation**:
   - Tích hợp cấu hình **Traffic Multiplier** (Hệ số kẹt xe) và **Service Time** (Thời gian giao hàng/điểm).
   - Hỗ trợ **Random Mode**: Tự động chọn hệ số ngẫu nhiên từ **1.5x - 2.0x** cho mỗi lần tính toán để mô phỏng tính biến thiên của giao thông.

---

## 🎯 Định hướng Roadmap (Việc cần làm tiếp theo)

### 📱 Trải nghiệm Shipper (Sau khi Deploy)
- [ ] **PWA (Progressive Web App)**: Cài đặt ứng dụng như app mobile không cần Store.
- [ ] **Proof of Delivery**: Chụp ảnh đơn hàng & ký nhận điện tử khi hoàn tất giao.
- [ ] **Navigation Deep Link**: Nút mở nhanh Google Maps/Waze để chỉ đường.

### 🎨 Giao diện & Trải nghiệm (UI/UX)
- [x] **Dark Mode**: Chế độ tối hiện đại cho toàn bộ hệ thống.
- [ ] **Dashboard Analytics**: Thống kê tỷ lệ giao hàng, quãng đường bằng biểu đồ (Chart.js).

### ⚙️ Thuật toán & Nâng cao
- [x] **Realistic Routing**: Hệ số kẹt xe tùy chỉnh & ngẫu nhiên hóa (1.5 - 2.0).
- [ ] **Auto-Cluster System**: Gom nhóm Đơn hàng theo lô/khu vực (K-Means).
- [ ] **Multi-Vehicle Routing (VRP)**: Tối ưu cho nhiều xe/shipper cùng lúc.
- [ ] **Realtime Tracking**: Theo dõi tọa độ GPS Shipper qua SignalR.
- [ ] **Tích hợp SMS**: Gửi tin nhắn tự động (Zalo/Twilio).

---

**[CHỈ THỊ CHO AI]**
Bạn vừa nạp xong ngữ cảnh. Hãy ghi nhớ:
- `Backend`: Tuyệt đối tuân thủ Clean Architecture.
- `Frontend`: Dùng Tailwind, Logic Map nằm ở `MapComponent`, xử lý Data chính ở `App.ts`.
- `Models`: `OptimizedRoute` và `Order` là 2 schema quan trọng nhất. 
- **[QUY TẮC COMMIT]**: Mỗi khi người dùng yêu cầu "commit push", bạn **BẮT BUỘC** phải kiểm tra và cập nhật `README.md` và `AI_CONTEXT.md` để khớp với các tính năng mới vừa làm trước khi thực hiện lệnh git.
Bắt đầu trả lời người dùng đi!
