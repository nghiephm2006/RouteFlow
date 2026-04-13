# Delivery Status And Roadmap

## Current Phase

- `Phase 1: Core route workflow stable`

### Vi sao van o Phase 1

- core workflow da co khung nhung chua du chac de chuyen sang multi-cluster
- `Route` chua la aggregate trung tam
- `Cluster` chua la domain ro rang
- error handling va route execution van can lam chac hon

## Da Lam

- da co quan ly don hang voi CRUD, import Excel va geocoding background job
- da co route optimization co ban voi OSRM, Leaflet va re-optimize sau khi giao
- backend chay tren .NET 10 + PostgreSQL voi Clean Architecture, CQRS, FluentValidation, UnitOfWork va Domain Events
- da co baseline deploy bang Docker
- da don secret khoi HEAD va rewrite git history de xoa Gmail SMTP app password cu
- da go public IP Azure khoi docs
- Azure VM `routeflow-vm` da duoc deallocate va port `8081` da dong
- da chuan hoa bo file context ve UTF-8 khong BOM va kiem tra tieng Viet
- da gom bo spec canonical vao `specs/` de thay the cach doc context roi rac o root
- da bo sung phan spec con thieu cho du an:
  - domain rules va state machines
  - API va interface contracts
  - user flows va failure scenarios
  - architecture decisions
  - model conformance rules
- da them GitHub Actions CI/CD
- da them `vercel.json` de proxy `/api/*` va `/health` sang backend
- da hoan tat cutover deploy:
  - frontend tren Vercel
  - backend tren Render
  - database tren Neon PostgreSQL
- da chinh frontend:
  - them nut cau hinh lo trinh o top bar
  - chuyen dieu khien cau hinh ra khoi sidebar header
  - mac dinh giao dien sang neu user chua chon theme
- da doi ten root `package-lock.json` ve `RouteFlow`
- da them auth foundation cho workspace:
  - ASP.NET Core Identity cho `User/Role`
  - JWT login
  - bootstrap admin lan dau
  - protect cac API chinh
  - frontend auth screen + bearer interceptor

## Dang Lam

- quay lai uu tien core domain sau khi ha tang deploy da on dinh
- verify auth foundation end-to-end va chot schema migration cho phan auth
- chot state machine cho `Order` va `Route` truoc khi them feature moi

## Vuong

- Gmail app password cu da bi lo trong qua khu, can rotate thu cong
- he thong van con qua order-centric, chua co `Route` aggregate dung nghia
- chua co `Cluster` domain ro rang, chua nen day sang Phase 2
- mot so secret da tung duoc paste o moi truong chat, can rotate ngay truoc khi push production
- can decommission hoan toan phan Azure con sot neu van con resource tinh phi
- Docker CLI da co, nhung Docker daemon/Desktop service tren may hien tai dang o trang thai `stopped`, nen chua boot duoc local PostgreSQL de apply migration

## Todo

### Uu tien cao

- rotate ngay cac secret da lo:
  - `VERCEL_TOKEN`
  - Render deploy hook key
  - Neon database password
- xac nhan production on dinh:
  - UI tren Vercel
  - API tren Render
  - template download
  - route optimization flow co ban
- verify auth slice moi:
  - bootstrap admin
  - login/logout
  - `/api/auth/me`
  - bearer token cho frontend
- generate va apply migration/schema auth bang moi truong co .NET 10 SDK
- boot local PostgreSQL qua Docker va apply migration local
- chot state machine cho `Order` va `Route`
- tao `Route` aggregate o backend
- tach `Cluster` thanh domain/service ro rang
- lam reliability cho geocode/route
- them navigation deep link cho route execution

### Uu tien trung binh

- tao dispatcher view toi thieu cho mot batch route
- ghi log nghiep vu cho route/geocode/status change
- chuan bi data model cho proof of delivery ban nhe

### Uu tien thap

- ra lai chong cheo giua cac file docs cu va bo spec moi
- can nhac chuyen cac file root cu thanh thin entrypoint tro sang `specs/`
- decommission toan bo Azure resources khong con dung de tranh phat sinh chi phi

## Next 3 Actions

1. Boot local PostgreSQL qua Docker, chay `database update`, va verify login end-to-end.
2. Rotate toan bo secret da lo va cap nhat lai env/secrets production.
3. Chot state machine `Order` va `Route`.
