# Model Conformance Rules

## Mục tiêu

Mọi model làm việc trên RouteFlow phải bám `specs/` làm source of truth.

Không được:

- suy diễn theo trí nhớ
- suy diễn theo pattern chung của dự án khác
- trả lời theo current code mà bỏ qua target spec
- trả lời theo target spec mà giả vờ current code đã đúng

## Canonical Source Of Truth

Khi có xung đột, thứ tự ưu tiên là:

1. `05_WORKFLOW_AND_QUALITY_GATES.md`
2. `03_DELIVERY_STATUS_AND_ROADMAP.md`
3. `06_DOMAIN_RULES_AND_STATE_MACHINES.md`
4. `07_API_AND_INTERFACE_CONTRACTS.md`
5. `09_ARCHITECTURE_DECISIONS.md`
6. code hiện tại trong repo

Rule:

- nếu code hiện tại lệch spec, model phải nêu rõ `current reality` và `target spec`
- không được im lặng chọn một bên rồi trả lời như thể không có conflict

## Mandatory Reading Rules

### Khi user hỏi "việc tiếp theo cần làm là gì"

Bắt buộc đọc:

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`

### Khi làm domain, business logic hoặc state transition

Bắt buộc đọc:

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `06_DOMAIN_RULES_AND_STATE_MACHINES.md`
3. `09_ARCHITECTURE_DECISIONS.md`

### Khi làm API, DTO hoặc frontend/backend integration

Bắt buộc đọc:

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `07_API_AND_INTERFACE_CONTRACTS.md`
3. `08_USER_FLOWS_AND_FAILURE_SCENARIOS.md`

### Khi làm deploy, env, security hoặc hạ tầng runtime

Bắt buộc đọc:

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `04_DEPLOYMENT_AND_SECURITY.md`
3. `09_ARCHITECTURE_DECISIONS.md`

### Khi commit hoặc push

Bắt buộc đọc:

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `05_WORKFLOW_AND_QUALITY_GATES.md`

## Mandatory Response Format

Trước khi phân tích hoặc thực hiện thay đổi đáng kể, model phải trả lời ngắn theo format:

- `Source spec used: ...`
- `Current reality: ...`
- `Target rule: ...`
- `Next action: ...`

Nếu task có lệch giữa code và spec, phải thêm:

- `Spec drift: ...`

Nếu task là commit/push, phải thêm:

- `Commit gate: passed` hoặc `Commit gate: blocked`

## Forbidden Behaviors

Model không được:

- đề xuất roadmap mới nếu chưa đọc `03_DELIVERY_STATUS_AND_ROADMAP.md`
- sửa business rule nếu chưa đọc `06_DOMAIN_RULES_AND_STATE_MACHINES.md`
- sửa API contract nếu chưa đọc `07_API_AND_INTERFACE_CONTRACTS.md`
- commit/push nếu chưa qua quality gate trong `05_WORKFLOW_AND_QUALITY_GATES.md`
- mô tả project state theo trí nhớ
- coi frontend là source of truth cho business state
- coi implementation hiện tại là canonical spec nếu spec nói khác
- bỏ qua contract drift giữa frontend và backend
- nói chung chung mà không chỉ ra đang bám file spec nào

## Commit And Push Gate

Trước `commit` hoặc `push`, model bắt buộc xác nhận rõ:

- đã đọc `03_DELIVERY_STATUS_AND_ROADMAP.md`
- đã đọc `05_WORKFLOW_AND_QUALITY_GATES.md`
- đã cập nhật status spec nếu task làm thay đổi current system state
- đã sync spec liên quan nếu task đổi domain, API, deploy, security hoặc roadmap
- đã verify UTF-8 cho các file vừa sửa
- không push nếu spec chưa phản ánh đúng current state

## UTF-8 Rule

Sau mỗi lần tạo, sửa, ghi đè hoặc di chuyển file text:

- phải verify UTF-8
- ưu tiên UTF-8 không BOM
- nếu file có tiếng Việt, phải kiểm tra không bị mojibake
- nếu chưa verify encoding thì chưa được coi là hoàn tất task

## Conflict Handling Rule

Nếu có mâu thuẫn giữa code và spec, model phải nói rõ:

- `Current reality`
- `Target spec`
- `Recommended action`

Không được:

- tự ý im lặng theo code
- tự ý im lặng theo spec
- mô tả target như thể đã implemented

## Success Criteria

Một model được coi là bám spec đúng khi:

- dùng đúng file spec theo loại task
- phân biệt rõ current reality và target spec
- không đề xuất giải pháp trái ADR
- không bỏ qua workflow gate
- không tạo thêm drift giữa docs, code và contract

## Recommended Prompt Template

Khi bắt đầu conversation mới, nên dùng prompt mở đầu dạng:

```text
Đọc specs/README.md và follow đúng reading order cho task này.
Bạn phải tuân thủ Model Conformance Rules của repo.
Trước khi trả lời, ghi rõ:
- Source spec used
- Current reality
- Target rule
- Next action
Nếu có spec drift, phải nêu rõ.
```
