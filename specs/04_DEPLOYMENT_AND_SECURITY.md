# Deployment And Security

## Current Deployment Topology

### Production

- frontend: Vercel
- backend: Render
- database: Neon PostgreSQL
- orchestration: GitHub Actions

### Local

- frontend: `npm run start` tai `http://localhost:4200`
- backend: `dotnet run` tai `https://localhost:7141`
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

- Vercel chi deploy frontend.
- Backend .NET phai chay tren provider phu hop va duoc goi qua deploy hook hoac workflow tuong duong.

## Configuration Rules

- `ConnectionStrings__DefaultConnection` phai lay tu environment variables hoac user secrets
- `appsettings.json` chi chua placeholder, khong chua secret that
- auth JWT phai cau hinh qua:
  - `Auth__Jwt__Issuer`
  - `Auth__Jwt__Audience`
  - `Auth__Jwt__SigningKey`
  - `Auth__Jwt__AccessTokenMinutes`
- bootstrap admin co the cau hinh qua:
  - `Auth__BootstrapAdmin__Email`
  - `Auth__BootstrapAdmin__Password`
  - `Auth__BootstrapAdmin__FullName`
  - `Auth__BootstrapAdmin__UserName`
- neu dung SMTP, cau hinh:
  - `SmtpSettings__Host`
  - `SmtpSettings__Port`
  - `SmtpSettings__Username`
  - `SmtpSettings__Password`
  - `SmtpSettings__FromEmail`

## Security Checklist

### P0

- rotate ngay Gmail SMTP app password cu neu chua rotate
- rotate ngay `VERCEL_TOKEN` neu da tung lo o chat/screen share
- regenerate Render deploy hook key cu va cap nhat lai `BACKEND_DEPLOY_HOOK_URL`
- rotate ngay Neon database password neu da tung lo
- sau khi rotate, cap nhat lai toan bo secrets tuong ung tren GitHub Actions
- neu ha tang Azure khong con dung, stop/delete de tranh ton credit
- khong dung JWT signing key placeholder tren production

### P1

- ra lai Azure VM, NSG va container ports de chac PostgreSQL khong public
- can nhac go public IP khoi docs neu repo public hoa hoac demo rong hon
- kiem tra CORS production chi cho phep frontend domain chinh thuc
- tat Swagger public tren production (`Features__EnableSwagger=false`) neu khong can
- bootstrap admin endpoint chi nen usable khi he thong chua co user dau tien

## Security Notes

- xoa secret khoi HEAD khong co nghia la secret da an toan; git history cu moi la diem rui ro that
- secret paste trong chat hoac screen share phai duoc coi nhu da lo
- deploy thanh cong khong dong nghia cau hinh production da an toan
