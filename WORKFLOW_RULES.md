# WORKFLOW RULES

## 1. Mục tiêu của hệ thống context file

Các file context tồn tại để:

- giữ một nguồn sự thật thống nhất cho trạng thái dự án
- tránh lệch roadmap giữa code, docs và quyết định sản phẩm
- tránh mất ngữ cảnh khi đổi máy, đổi session hoặc quay lại task cũ
- giúp AI và người dùng cùng bám đúng trạng thái hiện tại của RouteFlow

## 2. Trách nhiệm của từng file

### `PROJECT_STATUS.md`

- là single source of truth cho current system state
- dùng để biết phase hiện tại, đã làm, đang làm, blocker, todo, next 3 actions
- là file phải đọc đầu tiên khi cần biết “bây giờ nên làm gì”

### `AI_CONTEXT.md`

- là file handover cho AI
- dùng để hiểu product direction, technical direction, tech stack, nguyên tắc kiến trúc, giới hạn và ưu tiên
- không dùng làm task board chính nếu `PROJECT_STATUS.md` đã có

### `README.md`

- là file giới thiệu repo
- dùng để mô tả sản phẩm, setup, kiến trúc tổng quan, cách chạy local và Docker
- không dùng để quản lý task hằng ngày

### `COMMIT_PUSH_CONTEXT.md`

- là file quy tắc bắt buộc trước khi `commit push`
- dùng để kiểm tra trước khi push phải cập nhật gì

### `SECURITY_TODO.md`

- là file theo dõi việc bảo mật và hạ tầng dễ bị quên
- dùng để theo dõi rotate secret, Azure cost, public exposure và hạ tầng demo

## 3. Thứ tự đọc file chuẩn theo từng nhu cầu

### Khi cần nắm trạng thái hiện tại

Đọc theo thứ tự:

1. `PROJECT_STATUS.md`
2. `AI_CONTEXT.md`

### Khi cần hiểu repo hoặc setup

Đọc theo thứ tự:

1. `README.md`
2. `AI_CONTEXT.md`

### Khi chuẩn bị `commit push`

Đọc theo thứ tự:

1. `PROJECT_STATUS.md`
2. `COMMIT_PUSH_CONTEXT.md`

Sync thêm nếu thay đổi lớn:

- `README.md` nếu thay đổi ảnh hưởng đến setup, kiến trúc tổng quan, deploy hoặc mô tả sản phẩm
- `AI_CONTEXT.md` nếu thay đổi ảnh hưởng đến product direction, technical direction, architecture, roadmap hoặc deploy flow
- `SECURITY_TODO.md` nếu thay đổi ảnh hưởng đến secret, public exposure, Azure cost hoặc hạ tầng demo

## 4. Rule: Khi đổi máy hoặc bắt đầu session mới

Case này là:

- mở dự án trên máy mới
- mở lại sau khi mất context
- bắt đầu một session hoàn toàn mới

Điều đầu tiên bắt buộc phải làm:

1. đọc `PROJECT_STATUS.md`

Điều thứ hai bắt buộc phải làm:

2. đọc `AI_CONTEXT.md`

Mục tiêu của việc đọc file:

- biết current phase
- biết current task state
- biết roadmap đang ưu tiên gì
- biết giới hạn kiến trúc và product direction

Không được làm trước khi đọc xong:

- không đề xuất roadmap mới
- không bắt đầu code
- không nói trạng thái dự án theo trí nhớ
- không `commit push`

Sau khi đọc xong phải tóm tắt:

- phase hiện tại
- đã làm
- đang làm
- vướng
- next action gần nhất

## 5. Rule: Khi tiếp tục công việc đang làm

Case này là:

- quay lại task đang làm dở
- tiếp tục một nhánh công việc đã có từ trước
- mở lại session trong ngày hoặc sau một khoảng nghỉ

Điều đầu tiên bắt buộc phải làm:

1. đọc lại `PROJECT_STATUS.md`

Khi nào phải đọc thêm `AI_CONTEXT.md`:

- khi task có đụng đến product direction
- khi task có đụng đến architecture
- khi không chắc giới hạn hoặc ưu tiên hiện tại
- khi thấy có nguy cơ làm lệch roadmap

Mục tiêu của bước xác nhận lại context:

- tránh tiếp tục code theo trí nhớ
- tránh làm sai phase
- tránh thêm feature không phục vụ flow chính

Không được làm:

- không tiếp tục code theo trí nhớ nếu chưa check lại status
- không tự giả định task cũ vẫn còn đúng ưu tiên

Sau khi đọc xong phải tóm tắt:

- current task là gì
- current blocker là gì nếu có
- next action cụ thể là gì

## 6. Rule: Khi có yêu cầu `commit push`

Điều đầu tiên bắt buộc phải làm:

1. đọc `PROJECT_STATUS.md`
2. đọc `COMMIT_PUSH_CONTEXT.md`

Phải cập nhật các mục sau trong `PROJECT_STATUS.md`:

- `Đã làm`
- `Đang làm`
- `Vướng`
- `Phase hiện tại`
- `Todo`
- `Next 3 Actions`

Phải sync thêm file khác khi:

- cập nhật `README.md` nếu thay đổi liên quan đến setup, deploy, mô tả sản phẩm hoặc kiến trúc tổng quan
- cập nhật `AI_CONTEXT.md` nếu thay đổi liên quan đến product direction, technical direction, architecture, roadmap hoặc deploy flow
- cập nhật `SECURITY_TODO.md` nếu thay đổi liên quan đến secret, Azure cost, public exposure hoặc hạ tầng demo

Không được push khi:

- docs chưa phản ánh đúng system state
- `PROJECT_STATUS.md` chưa được cập nhật
- roadmap đã đổi nhưng context chưa sync

## 7. Rule: Encoding verification sau mỗi lệnh có tác động file

Rule bắt buộc:

- sau mỗi lệnh có thể tạo, sửa, ghi đè hoặc di chuyển file, phải re-check encoding của file vừa bị ảnh hưởng
- mặc định mọi file text dùng UTF-8
- đặc biệt kiểm tra file có tiếng Việt để tránh mojibake, lỗi dấu hoặc encoding không nhất quán
- nếu phát hiện lỗi encoding, phải dừng các bước tiếp theo
- phải sửa file về UTF-8 rồi verify lại nội dung
- không được coi task là hoàn tất nếu chưa verify encoding

Checklist bắt buộc:

- file nào vừa thay đổi?
- encoding hiện tại là gì?
- có lỗi tiếng Việt không?
- đã verify lại chưa?

Ưu tiên mặc định:

- markdown, json, ts, cs, html, css, yml, xml, txt, csv và source code bất kỳ dùng UTF-8 không BOM nếu không có yêu cầu khác

## 8. Rule hành vi bắt buộc cho AI

- không đoán trạng thái dự án nếu chưa đọc `PROJECT_STATUS.md`
- không `commit push` nếu chưa kiểm tra `COMMIT_PUSH_CONTEXT.md`
- không thay đổi roadmap mà không phản ánh lại vào `PROJECT_STATUS.md`
- nếu phát hiện file bị chồng chéo vai trò thì phải đề xuất refactor docs
- không dùng `README.md` làm task board
- không dùng `AI_CONTEXT.md` để thay thế `PROJECT_STATUS.md` cho current system state

## 9. Default startup procedure

Trước khi làm gì trên RouteFlow:

1. xác định đây là case nào:
   - session mới hoặc đổi máy
   - tiếp tục việc đang làm
   - `commit push`
2. đọc đúng file theo case đó
3. tóm tắt current state
4. chỉ sau đó mới được đề xuất hoặc thực hiện thay đổi
