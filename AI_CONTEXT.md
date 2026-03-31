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
   - **Database**: PostgreSQL, truy cập qua Entity Framework Core.
   - **Libraries**: FluentValidation (bắt ở PipelineBehavior của MediatR), EPPlus (để Import/Template Excel).
   - **Deploy baseline**: Có `Dockerfile`, `docker-compose.yml`, `health endpoint`, config qua Environment Variables, migration khi startup.
   - **Deploy status**: Bản đầu tiên đã được deploy lên Azure VM bằng Docker.

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

## 🎯 Định hướng Product & Roadmap 3 Tháng

### Định hướng sản phẩm hiện tại
- Không xem RouteFlow là "nền tảng logistics toàn diện" ở giai đoạn này.
- Định vị thực tế hơn: **công cụ điều phối và tối ưu giao hàng cho batch đơn trong ngày**, ưu tiên giúp điều phối viên và shipper xử lý route nhanh, rõ, ít lỗi hơn.
- Chọn hướng **dispatcher-first** trước: làm chắc phần nhập đơn, chia cụm, tối ưu tuyến, theo dõi tiến độ; sau đó mới đầu tư mạnh vào trải nghiệm shipper ngoài thực địa.

### Những gì phải giữ làm lõi
- CRUD đơn hàng + import Excel.
- Geocoding + map visualization.
- Route optimization + re-optimize khi trạng thái đơn thay đổi.
- Traffic multiplier + service time để mô phỏng thực tế.
- Các UX đã chứng minh giá trị như forward to map, smart markers, state persistence.
- Deploy-ready baseline: config sạch, không hard-code secret, Docker chạy được, backend/frontend tách config theo environment.

### Những gì chưa ưu tiên
- SMS.
- Dashboard nặng về biểu đồ.
- PWA nếu luồng mobile chưa đủ chắc.
- Realtime tracking phức tạp.
- VRP tối ưu toàn cục khi cluster và multi-shipper cơ bản còn chưa xong.

### Tháng 1: Ổn định lõi vận hành route
- [ ] Navigation Deep Link: mở Google Maps/Waze từ điểm giao hoặc chặng tiếp theo.
- [ ] Reliability cho geocode/route: error state rõ ràng, không để user thao tác trong mù mờ.
- [ ] Retry/caching cơ bản cho geocoding background job.
- [ ] Chuẩn hoá trạng thái đơn hàng theo luồng giao thực tế: Pending, InProgress, Delivered, Failed/Skipped.
- [x] Deployment baseline: env config, connection string PostgreSQL, Docker hoá mức đủ deploy test.

**Definition of done tháng 1**
- Có thể chạy luồng nhập đơn -> tối ưu -> điều hướng ngoài thực địa -> cập nhật trạng thái mà không phải xử lý tay các lỗi phổ biến.
- Khi API ngoài lỗi, hệ thống báo được đơn nào lỗi và lỗi thuộc bước nào.

### Trạng thái deploy hiện tại
- Azure resource group: `routeflow-rg`
- Azure VM: `routeflow-vm`
- Public frontend: deployed on Azure VM (public IP intentionally omitted from docs).
- Public backend health: available on the same Azure VM deployment.
- Public Swagger: available on the same Azure VM deployment when enabled.
- Trạng thái hiện tại là demo/test running state, chưa có domain và HTTPS.

### Tháng 2: Điều phối nhiều cụm
- [ ] Auto-Cluster cơ bản theo khu vực/lô.
- [ ] Multi-Vehicle Routing bản pragmatic: cluster trước, gán cụm cho shipper sau, tối ưu từng cụm riêng.
- [ ] Màn hình điều phối tối thiểu cho từng cụm.
- [ ] Nhật ký thay đổi trạng thái và lỗi route/geocode.
- [ ] Dashboard vận hành tối thiểu: Pending, InProgress, Delivered, Failed trong ngày.

**Definition of done tháng 2**
- Điều phối viên chia được một batch đơn thành nhiều cụm hợp lý.
- Có thể gán cụm cho nhiều shipper ở mức thao tác được.
- Có số liệu vận hành đủ để phát hiện cụm hoặc shipper đang bị nghẽn.

### Tháng 3: Khép vòng thực địa
- [ ] Proof of Delivery bản nhẹ: ảnh xác nhận + thời điểm hoàn tất.
- [ ] Chữ ký điện tử hoặc xác nhận người nhận ở mức tối giản nếu flow cho phép.
- [ ] PWA cơ bản sau khi web mobile ổn định.
- [ ] Realtime tracking bản tối thiểu theo chu kỳ.
- [ ] Tối ưu UX mobile cho 4 thao tác chính: xem điểm tiếp theo, mở navigation, cập nhật trạng thái, chụp POD.

**Definition of done tháng 3**
- RouteFlow hỗ trợ đủ chuỗi điều phối -> giao hàng -> xác nhận hoàn tất.
- Một shipper có thể chạy luồng chính trên điện thoại mà không cần quay lại desktop giữa chừng.

---

**[CHỈ THỊ CHO AI]**
Bạn vừa nạp xong ngữ cảnh. Hãy ghi nhớ:
- `Backend`: Tuyệt đối tuân thủ Clean Architecture.
- Backend stack hiện tại được chốt là `.NET 10 + PostgreSQL`.
- Trạng thái hiện tại đã có baseline deploy test với Docker Compose; khi sửa config phải giữ được flow đó.
- Bản đầu tiên đã chạy trên Azure VM; nếu thay đổi deploy flow phải cập nhật lại README và AI context cho đúng trạng thái hạ tầng.
- `Frontend`: Dùng Tailwind, Logic Map nằm ở `MapComponent`, xử lý Data chính ở `App.ts`.
- `Models`: `OptimizedRoute` và `Order` là 2 schema quan trọng nhất. 
- Khi đề xuất tính năng mới, phải kiểm tra nó có phục vụ lõi "điều phối + tối ưu + thực thi giao hàng" hay chỉ làm roadmap phình ra.
- Ưu tiên feature tạo giá trị vận hành trực tiếp trước các feature thiên về trình diễn hoặc notification.
- **[QUY TẮC COMMIT]**: Mỗi khi người dùng yêu cầu "commit push", bạn **BẮT BUỘC** phải kiểm tra và cập nhật `README.md` và `AI_CONTEXT.md` để khớp với các tính năng mới vừa làm trước khi thực hiện lệnh git.
Bắt đầu trả lời người dùng đi!
