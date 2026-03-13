# RouteFlow 🚀

RouteFlow là giải pháp phần mềm toàn diện dành cho việc Quản lý và Tối ưu hóa Tuyến đường Giao hàng (Delivery Route Optimization), bao gồm 2 thành phần chính: **Frontend (Web App)** và **Backend (API Server)**. Hệ thống giúp shipper tự động hóa việc tính toán, sắp xếp các điểm giao hàng theo thứ tự tối ưu nhất nhằm tiết kiệm thời gian lẫn chi phí di chuyển.

---

## 🏗 Tổng quan Kiến trúc

Dự án được chia làm 2 thư mục riêng biệt tại Root:

1. **`shipper-route-optimization/`**: Dự án Frontend xây dựng bằng Angular Standalone.
2. **`RouteFlow.Backend/`**: Dự án Backend API xây dựng bằng .NET 10 (C#) theo chuẩn Clean Architecture.

---

## 🎨 1. Frontend - Shipper Route Optimization

Web App cung cấp giao diện hiển thị Bản đồ và bảng điều khiển (Sidebar) cho phép người dùng cấu hình các điểm đi/đến.

### Công nghệ sử dụng

- **Framework**: Angular 16+ (Standalone Components).
- **Ngôn ngữ**: TypeScript, HTML, CSS.
- **UI/UX**: Tailwind CSS (Thiết kế dựa trên bộ nhận diện thương hiệu `RouteFlow` với Xanh Đậm `#1A365D` & Cam nổi bật `#F97316`).
- **Map Engine**: Leaflet (OpenStreetMap) hoàn toàn miễn phí, bo tròn tuyến đường chính xác trên từng ngõ ngách.
- **Core API**: Sử dụng trực tiếp **OSRM Trip API** cho logic tối ưu bài toán Người chào hàng (TSP) và **Nominatim API** cho Geocoding.

### Tính năng nổi bật

- **Định vị & Lộ trình Thông minh**: Tự động lấy vị trí GPS thực tế làm **Điểm bắt đầu (Số 1)**. Marker khởi đầu được thiết kế lớn hơn, icon Ngôi nhà màu Cam nổi bật. Các điểm giao tiếp theo được đánh số thứ tự (1, 2, 3...) trực quan.
- **Lộ trình Tương tác & Đa sắc**: Tuyến đường được vẽ bằng các gam màu hiện đại, hài hoà cho từng chặng. Cho phép click vào từng đoạn đường để xem chi tiết Quãng đường (km) và Thời gian (phút).
- **Cập nhật Trạng thái từ Bản đồ**: Tích hợp nút **"Giao thành công"** ngay trong Popup của Marker hoặc chặng đường. Tự động cập nhật Database và tính toán lại (Re-optimize) tuyến đường còn lại ngay lập tức.
- **Duy trì Trạng thái (State Persistence)**: Chuyển đổi linh hoạt giữa các Tab mà không lo mất dữ liệu bản đồ hay thông tin đang nhập liệu.
- **Quản lý Đơn Hàng (Orders)**: Tích hợp bảng quản lý đơn thông minh. Hỗ trợ _Thêm, Sửa (Update), Xóa_ đơn hàng. Danh sách tự đồng bộ với Server.
- **Tự động Tìm Kiếm (Autocomplete)**: Nhập liệu tên đường tiện lợi với API Nominatim, tự fix số nhà. Đảm bảo 100% tọa độ chính xác khi chốt đơn.
- **Markers Độc đáo**: Các Custom Marker SVG bo tròn khác biệt giữa Điểm đầu (Kho), các Điểm giao (Cửa hàng) và Điểm cuối.

### Cài đặt và Khởi chạy

```bash
cd shipper-route-optimization
npm install
npm run start
```

_Giao diện Frontend chạy mặc định tại: `http://localhost:4200`_

---

## ⚙️ 2. Backend - RouteFlow.Backend

Hệ thống API RESTful đóng vai trò cung cấp, quản lý dữ liệu Master (Orders) cực kỳ mạnh mẽ. Backend có khả năng tự động sửa lỗi dữ liệu khuyết thiếu nhờ kiến trúc Background Jobs.

### Tính năng Backend nổi bật

- **Auto-Generated OrderCode**: Mã đơn được Backend tự sinh chuẩn Auth `ORD-YYMMDD-XXXX` đảm bảo Unique 100% không lo trùng lặp.
- **Geocoding Background Service**: Dịch vụ ngầm (Background Job) chạy tự động song song không ảnh hưởng API Thread, liên tục quét các đơn hàng được Import File Excel bị thiếu Tọa độ và gửi yêu cầu Phân giải qua mạng lấy (Lat, Lng) điền bù vào cho khách hàng nghỉ ngơi.
- **Excel EPPlus Integration**: Cho phép Import hàng nghìn Orders nhanh chóng và xuất file Template chuẩn có sẵn cấu trúc bảng tự động fit width.

### Kiến trúc & Design Patterns

- **Standard**: Clean Architecture, Domain-Driven Design (DDD).
- **Logic Mapping**: CQRS Pattern thông qua thư viện **MediatR**.
- **Data Access**: Repository Pattern và Unit of Work để đảm bảo dải Transaction an toàn.
- **Validation**: Tích hợp **FluentValidation** vào thẳng PipelineBehavior của MediatR để đánh giá Request DTOs trước khi vào Controller.

### Công nghệ sử dụng

- **Framework**: .NET 10 (ASP.NET Core Web API).
- **Ngôn ngữ**: C# 12+.
- **Database**: Entity Framework Core (Hỗ trợ LocalDb / SQL Server chuẩn bị sẵn qua EF Migrations).
- **Libraries**: EPPlus (đọc/xuất Excel), Swashbuckle (Swagger UI định dạng API).

### Cấu trúc Projects

- **`RouteFlow.Domain`**: Cốt lõi của phần mềm. Định nghĩa `Order` Entity, `OrderStatus` Enum, Interface UnitOfWork, Repository và Domain Events.
- **`RouteFlow.Application`**: Business rules & Service Caching. Tất cả CQRS (Command/Query/Handler) điều phối dữ liệu đều nằm ở đây.
- **`RouteFlow.Infrastructure`**: Code thực thi `AppDbContext`, EF Core Migrations, và các External Services như `ExcelImportService` hay `ClusterService`.
- **`RouteFlow.Api`**: API endpoints `Controllers`, Cấu hình Pipeline Middleware (`GlobalExceptionMiddleware` chuẩn hoá output API 500/400 JSON).

### Cấu hình và Khởi chạy

1. Yêu cầu hệ thống đã cài `.NET SDK`.
2. Mở cmd tại root folder:

```bash
cd RouteFlow.Backend/RouteFlow.Api
dotnet run
```

_API Server và bảng đặc tả Swagger chạy mặc định tại: `http://localhost:5xxx/swagger`_

---

## 🚀 Định hướng Phát triển (Roadmap)

1. **[DONE]** Tính năng Cập nhật trạng thái đơn hàng — Click badge trên bảng để đổi trạng thái, có popup xác nhận.
2. **[DONE]** Chức năng Forward chuyển tiếp góc nhìn sang Tab Bản đồ để xem nhanh vị trí từng đơn.
3. **[DONE]** Quản lý chi tiết Đơn hàng: Bổ sung Phone + Email — Cập nhật trong form Sửa, gửi email tự động khi đổi trạng thái.
4. **[DONE]** Email notification gửi thành công qua Gmail SMTP khi cập nhật trạng thái đơn.
5. **[DONE]** Fix lỗi layout badge trạng thái: Đã fix dứt điểm hiện tượng "clear ô", hiển thị native Dropdown một cách mượt mà ngay trong lần click đầu tiên bằng cơ chế Select Overlay.
6. **[DONE]** Trường Phone chưa được lưu/hiển thị đúng trên UI — Đã bổ sung cột SĐT vào bảng danh sách đơn hàng.
7. **[DONE]** Hệ thống Marker cải tiến: Phóng to điểm bắt đầu, đánh số thứ tự 1,2,3... cho toàn bộ lộ trình.
8. **[DONE]** Tương tác Lộ trình: Click xem quãng đường từng chặng & Cập nhật trạng thái "Giao thành công" ngay trên Bản đồ.
9. **[DONE]** Duy trì trạng thái ứng dụng: Khắc phục triệt để việc reset bản đồ khi chuyển tab.
10. **[DONE]** Tính năng **Xoá nhiều đơn hàng (Batch Delete)** cùng lúc với xác nhận popup.
11. **[DONE]** Nâng cấp **Excel Template** với các địa chỉ mẫu HCMC cách nhau ~10km để test route thực tế.
12. **[DONE]** **Dark Mode** — Chế độ tối hiện đại cho toàn bộ hệ thống (Frontend).
13. **[TODO]** Tích hợp SMS (Zalo OA / Twilio / ESMS) — gửi tin nhắn tự động khi đổi trạng thái.
14. **[TODO]** Mở rộng hệ thống Tự động gom nhóm (Auto-cluster) Đơn hàng theo lô/khu vực.
15. **[TODO]** Dashboard Report (Chart.js): Biểu đồ tổng kết số đơn hoàn thành theo ngày.
16. **[TODO]** Triển khai (Deployment): Đóng gói Docker và đưa hệ thống lên Cloud.
17. **[TODO]** PWA (Progressive Web App) — Cài đặt app mobile (Sau khi Deploy).
18. **[TODO]** Proof of Delivery — Chụp ảnh & Ký nhận điện tử (Sau khi Deploy).
19. **[TODO]** Navigation Deep Link — Nút mở Google Maps/Waze chỉ đường (Sau khi Deploy).

---

## 🤖 Chuyển giao Ngữ cảnh AI (AI Context Handover)

Dự án này được hỗ trợ phát triển bởi AI Assistant. Trong bộ Source Code có đính kèm file **`AI_CONTEXT.md`** chứa toàn bộ lược sử cấu trúc Hệ thống và các tiến độ công việc đang làm dở.

Nếu bạn clone source code này sang một máy tính/IDE khác và muốn AI tiếp tục hiểu dự án ngay lập tức, hãy Copy & Paste câu lệnh sau vào khung Chat của AI:

> _"Chào bạn, hãy đọc kỹ file `AI_CONTEXT.md` trong thư mục gốc để nạp lại bối cảnh, sau đó làm tiếp cho tôi tính năng [Tên tính năng bạn muốn làm]"_
