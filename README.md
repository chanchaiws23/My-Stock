# My Stock

ระบบเว็บสต๊อกสินค้าแบบคลังเดียวสำหรับผู้ใช้หลายบทบาท พร้อม dashboard, แจ้งเตือนสต๊อกขั้นต่ำ, และ LINE workflow สำหรับรับคำสั่งและเตือนสินค้าใกล้หมด

## สิ่งที่ทำได้แล้ว

- Dashboard สรุปยอดสินค้า, สินค้าใกล้หมด, และรายการที่รออนุมัติ
- หน้าจัดการสินค้าและการทำ stock movement
- คิวอนุมัติสำหรับรายการที่เสี่ยงหรือมาจากสิทธิ์ต่ำ
- หน้า LINE webhook simulator สำหรับทดสอบคำสั่ง text และ quick reply
- หน้าตั้งค่าผู้ใช้, บทบาท, และตัวกระตุ้น reminder รายวัน
- API routes สำหรับ dashboard, products, movements, notifications, และ LINE integration
- Prisma schema สำหรับ PostgreSQL พร้อม migration แรก

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL ผ่าน Prisma 7
- LINE Messaging API skeleton

## โครงสร้างโปรเจกต์

- `app/` - หน้าเว็บและ API routes
- `components/` - ฟอร์มและส่วน UI ที่ใช้ซ้ำ
- `lib/` - business logic, Prisma repository, LINE parser, และ stock utilities
- `prisma/schema.prisma` - schema สำหรับ PostgreSQL
- `prisma/migrations/` - migration SQL แรกของโปรเจกต์

## การรันโปรเจกต์

1. ติดตั้ง dependencies

```bash
npm install
```

2. ตั้งค่า environment

```bash
cp .env.example .env
```

3. สร้าง client และ migration

```bash
npm run db:generate
npm run db:migrate:dev -- --name init
npm run db:seed
```

4. เริ่ม development server

```bash
npm run dev
```

5. เปิดใช้งานที่ `http://localhost:3000`

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_stock"
LINE_CHANNEL_ACCESS_TOKEN=""
LINE_CHANNEL_SECRET=""
APP_URL="http://localhost:3000"
```

## Prisma 7 Notes

- `DATABASE_URL` ถูกอ่านจาก [prisma.config.ts](C:\Users\Acer\Documents\My-Stock\prisma.config.ts) ไม่ได้ใส่ใน `schema.prisma` แล้ว
- `db:generate` ใช้สร้าง Prisma Client
- `db:migrate:dev` ใช้สร้างและ apply migration ในเครื่อง
- `db:migrate:deploy` ใช้ apply migration บน Railway/production
- `db:seed` ใช้เติมข้อมูลตั้งต้นลงฐานข้อมูล

## LINE Command Examples

- `stock SKU-001`
- `add SKU-001 10 รับเข้าออเดอร์`
- `out SKU-003 2 ใช้หน้าร้าน`
- `adjust SKU-002 5 แก้ยอด`
- `approve MOV-123`

## API Endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET|POST /api/products`
- `PATCH /api/products/:id`
- `GET|POST /api/movements`
- `POST /api/movements/:id/approve`
- `POST /api/movements/:id/reject`
- `GET|POST /api/notifications`
- `POST /api/line/webhook`
- `GET|PATCH /api/line/integration`

## หมายเหตุการทำงาน

- backend ตอนนี้อ่าน/เขียนผ่าน Prisma และ PostgreSQL จริงแล้ว
- `prisma/seed.ts` ใช้เติมข้อมูลเริ่มต้นสำหรับ dev หรือฐานข้อมูลใหม่
- ถ้า Railway ยังไม่มี database ให้สร้าง Postgres service ก่อน แล้วค่อยใส่ `DATABASE_URL`

## Roadmap ถัดไป

- เพิ่ม authentication และ session management
- ทำ background scheduler สำหรับ reminder รายวัน
- เพิ่ม audit/approval dashboard แบบละเอียดขึ้น
- เชื่อม LINE OA webhook จริงด้วย signature verification
