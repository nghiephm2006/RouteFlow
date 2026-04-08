# GitHub Actions + Vercel Deployment

Muc tieu: bo Azure de giam chi phi, van giu CI/CD ro rang cho ca frontend va backend.

## Kien truc khuyen nghi

- Frontend Angular: deploy len Vercel.
- Backend .NET API: deploy len provider co free/cheap tier (Render, Railway, Fly.io, v.v.).
- PostgreSQL: uu tien dich vu managed free/cheap (vi du Neon/Supabase/Render Postgres).
- CI/CD orchestration: GitHub Actions.

## Workflows da co trong repo

- `.github/workflows/ci.yml`
  - Build frontend Angular.
  - Build backend .NET 10.
- `.github/workflows/deploy-frontend-vercel.yml`
  - Deploy frontend len Vercel khi push `main` hoac chay manual.
- `.github/workflows/deploy-backend-hook.yml`
  - Trigger deploy backend qua webhook (deploy hook) khi backend thay doi.

## GitHub Secrets can cau hinh

### Cho frontend Vercel

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Cho backend

- `BACKEND_DEPLOY_HOOK_URL`

`BACKEND_DEPLOY_HOOK_URL` la webhook URL tu provider backend cua ban (Render/Railway/Fly/...).

## Cau hinh Vercel routing

File `shipper-route-optimization/vercel.json` da them:

- SPA fallback ve `index.html`.
- Rewrite `/api/*` va `/health` sang backend domain.

Ban bat buoc phai thay `https://YOUR_BACKEND_DOMAIN` bang domain backend thuc te.

## Backend provider setup toi thieu

Khi tao backend service, can set cac env quan trong:

- `ConnectionStrings__DefaultConnection`
- `Cors__AllowedOrigins__0` (frontend production domain)
- `Database__ApplyMigrationsOnStartup` (`true`/`false` theo chien luoc cua ban)
- `Features__EnableSwagger` (`false` cho production public)
- SMTP vars neu dung email notification

## Rollout an toan

1. Bat `ci.yml` truoc de dam bao build xanh.
2. Deploy backend len provider moi, xac nhan `/health`.
3. Cap nhat `YOUR_BACKEND_DOMAIN` trong `shipper-route-optimization/vercel.json`.
4. Bat deploy frontend workflow.
5. Test full flow `Order -> Route -> Deliver`.
