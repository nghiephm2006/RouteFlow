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
- **Dark Mode Hiện đại**: Hỗ trợ giao diện tối toàn diện, tự động chuyển đổi giữa Light/Dark mode cực kỳ mượt mà. Bản đồ được giữ ở chế độ sáng để tối ưu hiển thị các lớp phủ cartography.
- **Cấu hình Lộ trình Thực tế**: Cho phép tinh chỉnh **Hệ số kẹt xe (Traffic Multiplier)** và **Thời gian dừng/giao (Service Time)**. Tích hợp chế độ **Ngẫu nhiên hóa** hệ số kẹt xe (1.5x - 2.0x) để mô phỏng chính xác giao thông đô thị.

### Cài đặt và Khởi chạy

```bash
cd shipper-route-optimization
npm install
npm run start
```

_Giao diện Frontend chạy mặc định tại: `http://localhost:4200`_

_Trong môi trường development, Frontend tự gọi API qua `https://localhost:7141`. Khi build production trong Docker, Frontend dùng đường dẫn tương đối `/api` và được Nginx proxy sang Backend._

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
- **Database**: SQL Server, truy cập qua Entity Framework Core và quản lý schema bằng EF Migrations.
- **Libraries**: EPPlus (đọc/xuất Excel), Swashbuckle (Swagger UI định dạng API).

### Cấu trúc Projects

- **`RouteFlow.Domain`**: Cốt lõi của phần mềm. Định nghĩa `Order` Entity, `OrderStatus` Enum, Interface UnitOfWork, Repository và Domain Events.
- **`RouteFlow.Application`**: Business rules & Service Caching. Tất cả CQRS (Command/Query/Handler) điều phối dữ liệu đều nằm ở đây.
- **`RouteFlow.Infrastructure`**: Code thực thi `AppDbContext`, EF Core Migrations, và các External Services như `ExcelImportService` hay `ClusterService`.
- **`RouteFlow.Api`**: API endpoints `Controllers`, Cấu hình Pipeline Middleware (`GlobalExceptionMiddleware` chuẩn hoá output API 500/400 JSON).

### Cấu hình và Khởi chạy

1. Yêu cầu hệ thống đã cài `.NET 10 SDK` và có SQL Server khả dụng.
2. Cấu hình `ConnectionStrings__DefaultConnection` qua Environment Variables hoặc User Secrets. Không lưu credentials thật vào repo.
3. Nếu cần gửi email, cấu hình thêm `SmtpSettings__Host`, `SmtpSettings__Port`, `SmtpSettings__Username`, `SmtpSettings__Password`, `SmtpSettings__FromEmail`.
4. Mở cmd tại root folder:

```bash
cd RouteFlow.Backend/RouteFlow.Api
dotnet run
```

_API Server và Swagger chạy mặc định tại: `https://localhost:7141/swagger` trong development._

### Deploy-Ready Baseline

Repo hiện đã được chuẩn hoá ở mức deploy test với các điểm sau:

- **Config theo Environment**: Backend đọc `ConnectionStrings`, `SmtpSettings`, `Cors`, `Database`, `Features` từ config/env vars.
- **Không hard-code API URL production**: Frontend dùng environment cho development và dùng `/api` ở production.
- **CORS theo whitelist**: Không còn `AllowAnyOrigin` mặc định.
- **Health endpoint**: Có `GET /health` để check liveness.
- **Auto migration khi startup**: Có thể bật/tắt qua `Database:ApplyMigrationsOnStartup`.
- **Container hoá**: Có `Dockerfile` cho Backend, `Dockerfile + nginx.conf` cho Frontend, và `docker-compose.yml` kèm SQL Server.

### Chạy bằng Docker Compose

```bash
docker compose up --build
```

Sau khi chạy:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8081`
- Health: `http://localhost:8081/health`
- SQL Server: `localhost:1433`

### Lưu ý bảo mật

- `appsettings.json` chỉ nên chứa placeholder, không chứa mật khẩu thật.
- Nếu credentials Gmail cũ từng được commit trước đây, cần **rotate ngay** vì secret đã từng nằm trong git history.

---

## 🚀 Roadmap 3 Tháng

Roadmap này ưu tiên hướng **dispatcher-first**: làm RouteFlow trở thành công cụ điều phối và tối ưu giao hàng đáng tin cậy trước, rồi mới mở rộng mạnh sang trải nghiệm shipper ngoài thực địa. Mục tiêu là tránh lan man vào các tính năng nhìn đẹp nhưng chưa tăng giá trị lõi.

### ✅ Nền tảng đã có

- **[DONE]** Cập nhật trạng thái đơn hàng trực tiếp trên bảng.
- **[DONE]** Forward từ danh sách đơn sang bản đồ để xem nhanh vị trí.
- **[DONE]** CRUD đơn hàng có thêm Phone + Email.
- **[DONE]** Email notification qua Gmail SMTP khi đơn chuyển sang Delivered.
- **[DONE]** Fix UX badge trạng thái để thao tác mượt hơn.
- **[DONE]** Hiển thị và lưu đúng trường Phone trên UI.
- **[DONE]** Marker cải tiến: điểm bắt đầu nổi bật, đánh số thứ tự toàn tuyến.
- **[DONE]** Click chặng đường để xem chi tiết và cập nhật "Giao thành công" ngay trên map.
- **[DONE]** Duy trì trạng thái ứng dụng khi chuyển tab.
- **[DONE]** Xoá nhiều đơn hàng cùng lúc.
- **[DONE]** Excel template mẫu để test route thực tế tại HCMC.
- **[DONE]** Dark Mode cho frontend.
- **[DONE]** Cấu hình route thực tế với traffic multiplier và service time.

### Tháng 1: Ổn định lõi vận hành route

**Mục tiêu**
- Biến luồng "nhập đơn -> ra route -> đi giao -> cập nhật trạng thái" thành luồng dùng được hằng ngày mà không vỡ khi gặp dữ liệu xấu hoặc API ngoài lỗi.

**Ưu tiên triển khai**
- **[TODO]** Navigation Deep Link: mở nhanh Google Maps/Waze từ từng điểm giao hoặc chặng tiếp theo.
- **[TODO]** Route/Geocode Reliability: bổ sung trạng thái lỗi rõ ràng khi Nominatim hoặc OSRM thất bại, tránh UI im lặng hoặc route sai mà user không biết.
- **[TODO]** Retry/Caching cơ bản cho geocoding background job để giảm gọi lặp và tăng độ ổn định.
- **[TODO]** Chuẩn hoá trạng thái đơn hàng theo luồng giao thực tế: Pending -> InProgress -> Delivered -> Failed/Skipped.
- **[TODO]** Deployment baseline: hoàn thiện cấu hình môi trường, connection string SQL Server, Docker hoá backend/frontend ở mức đủ chạy ổn trên môi trường test.

**Tiêu chí hoàn thành**
- User có thể import đơn, tối ưu tuyến, mở app dẫn đường ngoài thực địa và quay lại cập nhật trạng thái mà không phải nhập tay lại.
- Khi geocode/route lỗi, hệ thống báo rõ đơn nào lỗi và lý do ở mức user hiểu được.
- Có môi trường test/deploy nội bộ chạy được ổn định, không còn phụ thuộc hoàn toàn vào máy dev.

**Không ưu tiên trong tháng 1**
- SMS.
- Dashboard biểu đồ.
- PWA.
- Realtime tracking.

### Tháng 2: Từ route đơn sang điều phối nhiều cụm

**Mục tiêu**
- Nâng RouteFlow từ công cụ tối ưu một tuyến sang công cụ hỗ trợ điều phối nhiều đơn theo khu vực/lô hợp lý.

**Ưu tiên triển khai**
- **[TODO]** Auto-Cluster cơ bản: gom nhóm đơn theo khu vực để chia lô giao hàng trước khi tối ưu từng cụm.
- **[TODO]** Multi-Vehicle Routing bản pragmatic: chưa cần solver tối ưu toàn cục, ưu tiên flow "cluster trước, gán cụm cho shipper sau, tối ưu từng cụm riêng".
- **[TODO]** Màn hình điều phối tối thiểu: xem mỗi cụm có bao nhiêu đơn, ước lượng quãng đường/thời gian, ai đang phụ trách.
- **[TODO]** Nhật ký thay đổi trạng thái và các lỗi route/geocode để điều phối viên tra soát.
- **[TODO]** Dashboard vận hành tối thiểu: số đơn Pending/InProgress/Delivered/Failed trong ngày, không làm chart màu mè nếu chưa phục vụ quyết định vận hành.

**Tiêu chí hoàn thành**
- Điều phối viên có thể chia một batch đơn thành nhiều cụm hợp lý thay vì chỉ có một tuyến duy nhất.
- Có thể gán cụm cho nhiều shipper ở mức thao tác được.
- Có số liệu tối thiểu để biết hôm nay còn bao nhiêu đơn và cụm nào đang gặp vấn đề.

**Không ưu tiên trong tháng 2**
- SMS marketing/notification mở rộng.
- Nâng cấp giao diện chỉ để đẹp hơn.
- Các tính năng mobile-first chưa gắn với luồng điều phối.

### Tháng 3: Khép vòng thực địa

**Mục tiêu**
- Nối phần điều phối với phần thực thi ngoài hiện trường, để RouteFlow không chỉ dừng ở tối ưu route mà còn hỗ trợ hoàn tất giao hàng.

**Ưu tiên triển khai**
- **[TODO]** Proof of Delivery bản nhẹ: chụp ảnh xác nhận giao hàng và ghi nhận thời điểm hoàn tất.
- **[TODO]** Chữ ký điện tử hoặc xác nhận người nhận ở mức tối giản nếu phù hợp luồng hiện tại.
- **[TODO]** PWA cơ bản cho shipper sau khi luồng web mobile đã ổn định.
- **[TODO]** Realtime Tracking bản tối thiểu: cập nhật vị trí shipper theo chu kỳ cho mục đích theo dõi tiến độ, không cố giải bài toán live map quá sớm.
- **[TODO]** Tối ưu lại UX shipper trên mobile cho các tác vụ chính: xem điểm tiếp theo, mở navigation, đánh dấu giao thành công/thất bại, chụp POD.

**Tiêu chí hoàn thành**
- RouteFlow hỗ trợ được cả 2 nửa của bài toán: điều phối trong hệ thống và xác nhận giao hàng ngoài thực địa.
- Một shipper có thể dùng điện thoại để đi trọn vòng thao tác chính mà không cần quay lại desktop giữa chừng.

**Không ưu tiên trong tháng 3**
- SMS nếu chưa có use case vận hành thật sự rõ.
- Dashboard nâng cao thiên về trình diễn.
- Mở rộng sang bài toán logistics enterprise như tối ưu toàn cục nhiều ràng buộc phức tạp khi chưa validate xong luồng hiện tại.

### Các việc chủ động hoãn sau 3 tháng

- **[DEFERRED]** SMS (Zalo OA / Twilio / ESMS): chỉ làm khi đã chứng minh có nhu cầu thật và có người chịu chi phí vận hành.
- **[DEFERRED]** Dashboard analytics nâng cao: chỉ mở rộng khi dữ liệu vận hành đủ sạch và có câu hỏi quản trị rõ ràng cần trả lời.
- **[DEFERRED]** VRP tối ưu toàn cục nhiều ràng buộc: chỉ nên làm sau khi cluster + multi-shipper bản pragmatic đã chứng minh giá trị.

---

## 🤖 Chuyển giao Ngữ cảnh AI (AI Context Handover)

Dự án này được hỗ trợ phát triển bởi AI Assistant. Trong bộ Source Code có đính kèm file **`AI_CONTEXT.md`** chứa toàn bộ lược sử cấu trúc Hệ thống và các tiến độ công việc đang làm dở.

Nếu bạn clone source code này sang một máy tính/IDE khác và muốn AI tiếp tục hiểu dự án ngay lập tức, hãy Copy & Paste câu lệnh sau vào khung Chat của AI:

> _"Chào bạn, hãy đọc kỹ file `AI_CONTEXT.md` trong thư mục gốc để nạp lại bối cảnh, sau đó làm tiếp cho tôi tính năng [Tên tính năng bạn muốn làm]"_
