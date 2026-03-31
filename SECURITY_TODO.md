# TODO Bảo Mật

Mục tiêu: không quên các việc cần làm để tránh lộ secret và tránh tốn Azure credit không cần thiết.

## P0

- Rotate ngay Gmail SMTP app password cũ đã từng bị commit trong git history.
- Nếu tạm ngừng dùng demo, stop hoặc deallocate hoặc xóa Azure VM hay resource group để tránh tốn credit.

## P1

- Rà lại Azure VM, NSG và container ports để chắc PostgreSQL không public.
- Cân nhắc gỡ public IP khỏi docs nếu repo chuyển sang public hoặc demo rộng hơn.

## Ghi chú

- Xóa secret khỏi HEAD không có nghĩa là secret đã an toàn; git history cũ mới là điểm rủi ro thật.
- Azure VM đang chạy vẫn có thể tốn credit ngay cả khi repo đã sạch hơn.
