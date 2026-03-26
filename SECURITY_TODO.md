# Security TODO

Muc tieu: khong quen cac viec can lam de tranh lo secret va ton Azure credit.

## P0

- Rotate ngay Gmail SMTP app password cu da tung bi commit trong git history.
- Purge secret khoi git history roi force-push neu remote van con cac commit cu.
- Neu tam ngung dung demo, stop/deallocate hoac xoa Azure VM/resource group de tranh ton credit.

## P1

- Ra lai Azure VM, NSG va container ports de chac PostgreSQL khong public.
- Can nhac go public IP khoi docs neu repo chuyen sang public hoac demo rong hon.

## Ghi chu

- Xoa secret khoi HEAD khong co nghia la secret da an toan; git history cu moi la diem rui ro that.
- Azure VM dang chay van co the ton credit ngay ca khi repo da sach hon.
