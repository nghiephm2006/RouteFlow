# RouteFlow Specs

## Mục tiêu

Thư mục `specs/` là bộ spec canonical để đọc nhanh, giữ đúng ngữ cảnh dự án và giảm chồng chéo giữa các file context cũ.

Mục tiêu của bộ spec này:

- gom product, architecture, status, deployment, security và workflow về một chỗ
- giữ nguyên các rule bắt buộc đã có của dự án
- giúp người mới, AI và owner đọc theo đúng thứ tự mà không bị tản mát context

## Cấu trúc

- `01_PRODUCT_AND_SCOPE.md`
  - định vị sản phẩm
  - phạm vi làm và không làm
  - core business flow
- `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`
  - kiến trúc hệ thống
  - tech stack
  - nguyên tắc thiết kế
  - technical gaps hiện tại
- `03_DELIVERY_STATUS_AND_ROADMAP.md`
  - trạng thái hiện tại
  - phase
  - todo
  - next actions
- `04_DEPLOYMENT_AND_SECURITY.md`
  - local/dev/prod deployment
  - CI/CD
  - env/config
  - security checklist
- `05_WORKFLOW_AND_QUALITY_GATES.md`
  - startup procedure
  - commit/push rules
  - UTF-8 verification rule
  - AI/user workflow rules
- `06_DOMAIN_RULES_AND_STATE_MACHINES.md`
  - business rules bất biến
  - current state machine đang có trong code
  - target state machine cần implement tiếp
- `07_API_AND_INTERFACE_CONTRACTS.md`
  - API contract hiện tại
  - request/response shape
  - error shape
  - contract drift giữa frontend và backend
- `08_USER_FLOWS_AND_FAILURE_SCENARIOS.md`
  - happy path
  - async/background flow
  - failure path và recovery expectation
- `09_ARCHITECTURE_DECISIONS.md`
  - các quyết định kiến trúc quan trọng
  - context, decision, consequence
- `10_MODEL_CONFORMANCE_RULES.md`
  - rule cưỡng chế để model không bị lệch spec
  - mandatory reading theo từng loại task
  - response format bắt buộc
  - forbidden behaviors và conflict handling

## Thứ tự đọc khuyến nghị

### Khi bắt đầu session mới

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`
3. `05_WORKFLOW_AND_QUALITY_GATES.md`

### Khi làm domain, business rule hoặc state transition

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`
3. `06_DOMAIN_RULES_AND_STATE_MACHINES.md`

### Khi sửa API, DTO, integration hoặc frontend/backend contract

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `07_API_AND_INTERFACE_CONTRACTS.md`
3. `08_USER_FLOWS_AND_FAILURE_SCENARIOS.md`

### Khi cần hiểu sản phẩm hoặc setup

1. `01_PRODUCT_AND_SCOPE.md`
2. `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`
3. `04_DEPLOYMENT_AND_SECURITY.md`

### Khi chuẩn bị commit hoặc push

1. `03_DELIVERY_STATUS_AND_ROADMAP.md`
2. `05_WORKFLOW_AND_QUALITY_GATES.md`
3. `04_DEPLOYMENT_AND_SECURITY.md` nếu thay đổi có đụng deploy hoặc secret

## Mapping từ bộ file cũ

- `README.md` -> `01_PRODUCT_AND_SCOPE.md`, `04_DEPLOYMENT_AND_SECURITY.md`
- `AI_CONTEXT.md` -> `02_ARCHITECTURE_AND_TECHNICAL_DIRECTION.md`
- `PROJECT_STATUS.md` -> `03_DELIVERY_STATUS_AND_ROADMAP.md`
- `SECURITY_TODO.md` -> `04_DEPLOYMENT_AND_SECURITY.md`
- `COMMIT_PUSH_CONTEXT.md` -> `05_WORKFLOW_AND_QUALITY_GATES.md`
- `WORKFLOW_RULES.md` -> `05_WORKFLOW_AND_QUALITY_GATES.md`

## Canonical Rule

- Muốn biết việc tiếp theo cần làm là gì: đọc `03_DELIVERY_STATUS_AND_ROADMAP.md` trước.
- Muốn biết business rule và state transition nào là đúng: đọc `06_DOMAIN_RULES_AND_STATE_MACHINES.md`.
- Muốn sửa API hoặc đồng bộ frontend/backend: đọc `07_API_AND_INTERFACE_CONTRACTS.md`.
- Muốn hiểu async flow, failure path và retry expectation: đọc `08_USER_FLOWS_AND_FAILURE_SCENARIOS.md`.
- Muốn biết vì sao hệ thống đang được thiết kế như hiện tại: đọc `09_ARCHITECTURE_DECISIONS.md`.
- Muốn tránh model trả lời lệch khỏi spec: đọc `10_MODEL_CONFORMANCE_RULES.md`.

## Quy ước vận hành

- Bộ spec trong `specs/` là nơi đọc tổng hợp chuẩn nhất.
- Các file context cũ ở root hiện vẫn được giữ để tương thích workflow hiện tại.
- Khi update docs về product, roadmap, deploy, security hoặc workflow, ưu tiên sync `specs/` trước rồi mới sync các file root nếu vẫn còn dùng.
