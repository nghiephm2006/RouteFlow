# Deployment And Security

## Current Deployment Topology

### Production

- frontend: Vercel
- backend: Render
- database: Neon PostgreSQL
- orchestration: GitHub Actions

### Local

- frontend: `npm run start` tại `http://localhost:4200`
- backend: `dotnet run` tại `https://localhost:7141`
- docker compose:
  - frontend: `http://localhost:8080`
  - backend: `http://localhost:8081`
  - health: `http://localhost:8081/health`
  - postgres: `localhost:5432`

## CI/CD

- CI frontend + backend: `.github/workflows/ci.yml`
- CD frontend Vercel: `.github/workflows/deploy-frontend-vercel.yml`
- CD backend deploy hook: `.github/workflows/deploy-backend-hook.yml`

Rule:

- Vercel chỉ deploy frontend.
- Backend .NET phải chạy trên provider phù hợp và được gọi qua deploy hook hoặc workflow tương đương.

## Configuration Rules

- `ConnectionStrings__DefaultConnection` phải lấy từ environment variables hoặc user secrets
- `appsettings.json` chỉ chứa placeholder, không chứa secret thật
- nếu dùng SMTP, cấu hình:
  - `SmtpSettings__Host`
  - `SmtpSettings__Port`
  - `SmtpSettings__Username`
  - `SmtpSettings__Password`
  - `SmtpSettings__FromEmail`

## Security Checklist

### P0

- rotate ngay Gmail SMTP app password cũ nếu chưa rotate
- rotate ngay `VERCEL_TOKEN` nếu đã từng lộ ở chat/screen share
- regenerate Render deploy hook key cũ và cập nhật lại `BACKEND_DEPLOY_HOOK_URL`
- rotate ngay Neon database password nếu đã từng lộ
- sau khi rotate, cập nhật lại toàn bộ secrets tương ứng trên GitHub Actions
- nếu hạ tầng Azure không còn dùng, stop/delete để tránh tốn credit

### P1

- rà lại Azure VM, NSG và container ports để chắc PostgreSQL không public
- cân nhắc gỡ public IP khỏi docs nếu repo public hoặc demo rộng hơn
- kiểm tra CORS production chỉ cho phép frontend domain chính thức
- tắt Swagger public trên production (`Features__EnableSwagger=false`) nếu không cần

## Security Notes

- Xóa secret khỏi HEAD không có nghĩa là secret đã an toàn; git history cũ mới là điểm rủi ro thật.
- Secret paste trong chat hoặc screen share phải được coi như đã lộ.
- Deploy thành công không đồng nghĩa cấu hình production đã an toàn.
