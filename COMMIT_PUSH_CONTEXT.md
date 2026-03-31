# Quy Tắc Commit Push

Mục tiêu: mỗi lần có lệnh commit push, context phải được cập nhật đúng theo trạng thái mới nhất của hệ thống.

## Bắt buộc cập nhật trước khi push

File chính để cập nhật: PROJECT_STATUS.md

- Đã làm:
- Đang làm:
- Vướng:

## Sau phần cập nhật trên, phải cập nhật tiếp

- Phase hiện tại:
  - Phase 1: Core route workflow stable
  - Phase 2: Multi-cluster + dispatcher
  - Phase 3: Field execution (shipper)
- Todo list theo ưu tiên mới nhất
- Next 3 actions cụ thể

## Nguyên tắc

- Không commit push nếu context chưa phản ánh đúng system state.
- Không commit push nếu PROJECT_STATUS.md chưa được cập nhật.
- Nếu roadmap thay đổi, phải update phase, todo và next actions trước khi push.
- Nếu task vừa làm nhỏ và không đổi roadmap, vẫn phải note rõ vào mục Đã làm.
- Nếu có blocker, phải ghi vào mục Vướng, không được bỏ qua.
- Việc cập nhật này là bắt buộc cùng lúc với README.md và AI_CONTEXT.md nếu thay đổi ảnh hưởng đến product, architecture, deploy, security hoặc roadmap.
