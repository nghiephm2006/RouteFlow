# Workflow And Quality Gates

## Mục tiêu

Các rule trong file này là bắt buộc để:

- giữ một nguồn sự thật thống nhất cho trạng thái dự án
- tránh lệch roadmap giữa code, docs và quyết định sản phẩm
- tránh mất ngữ cảnh khi đổi máy, đổi session hoặc quay lại task cũ
- buộc mọi thay đổi phải đi qua quality gate tối thiểu

## Default Startup Procedure

Trước khi làm gì trên RouteFlow:

1. Xác định đây là case nào:
   - session mới hoặc đổi máy
   - tiếp tục việc đang làm
   - `commit push`
2. Đọc đúng spec theo case đó.
3. Tóm tắt current state.
4. Chỉ sau đó mới được đề xuất hoặc thực hiện thay đổi.

## Reading Order By Case

### Session mới hoặc đổi máy

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`

Không được làm trước khi đọc xong:

- không đề xuất roadmap mới
- không bắt đầu code
- không mô tả trạng thái dự án theo trí nhớ
- không `commit push`

Sau khi đọc xong phải tóm tắt:

- phase hiện tại
- đã làm
- đang làm
- vướng
- next action gần nhất

### Tiếp tục việc đang làm

1. đọc lại `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. đọc thêm `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md` nếu task đụng product direction, architecture hoặc có nguy cơ lệch roadmap

Sau khi đọc xong phải tóm tắt:

- current task là gì
- current blocker là gì nếu có
- next action cụ thể là gì

### Khi có yêu cầu `commit push`

1. đọc `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. đọc file này

## Commit And Push Gate

Trước khi `commit` hoặc `push`, bắt buộc cập nhật trong `03_DELIVERY_STATUS_AND_ROADMAP.md`:

- `Đã làm`
- `Đang làm`
- `Vướng`
- `Phase hiện tại`
- `Todo`
- `Next 3 Actions`

Phải sync thêm nếu thay đổi có ảnh hưởng:

- `01_PRODUCT_AND_SCOPE.md` nếu đổi setup, deploy, mô tả sản phẩm hoặc kiến trúc tổng quan
- `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md` nếu đổi product direction, technical direction, architecture, roadmap hoặc deploy flow
- `04_DEPLOYMENT_AND_SECURITY.md` nếu đổi secret, public exposure, security hoặc hạ tầng demo/production

Không được push khi:

- docs/spec chưa phản ánh đúng system state
- roadmap đã đổi nhưng spec chưa sync
- current status chưa được cập nhật

Nếu task nhỏ và không đổi roadmap:

- vẫn phải note rõ vào `Đã làm`
- nếu có blocker thì phải ghi vào `Vướng`

## UTF-8 Verification Rule

Sau mỗi lệnh có thể tạo, sửa, ghi đè hoặc di chuyển file:

- phải re-check encoding của file vừa bị ảnh hưởng
- mặc định mọi file text dùng UTF-8
- đặc biệt kiểm tra file có tiếng Việt để tránh mojibake hoặc lỗi dấu
- nếu phát hiện lỗi encoding, phải dừng bước tiếp theo
- không coi task là hoàn tất nếu chưa verify xong

Checklist bắt buộc:

- file nào vừa thay đổi
- encoding hiện tại là gì
- có lỗi tiếng Việt không
- đã verify lại chưa

Ưu tiên mặc định:

- markdown, json, ts, cs, html, css, yml, xml, txt, csv và source code dùng UTF-8 không BOM nếu không có yêu cầu khác

## Behavioral Rules

- không đoán trạng thái dự án nếu chưa đọc status spec
- không `commit push` nếu chưa qua commit gate
- không thay đổi roadmap mà không phản ánh lại vào status spec
- không dùng file overview làm task board
- không dùng architecture spec để thay thế status spec
- nếu phát hiện file/spec bị chồng chéo vai trò, phải đề xuất refactor docs

## Review Standard

Khi review code hoặc thay đổi AI-generated:

- đo bằng business rules và workflow đã chốt
- không merge theo cảm tính
- không chấp nhận logic phá invariant chỉ vì code compile
- ưu tiên tìm behavioural regression, bug logic và missing tests trước
