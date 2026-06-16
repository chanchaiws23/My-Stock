# My Stock

เว็บสต๊อกสินค้าแบบคลังเดียวสำหรับผู้ใช้หลายบทบาท พร้อม dashboard, แจ้งเตือนสต๊อกขั้นต่ำ, และ LINE workflow สำหรับรับคำสั่งและเตือนสินค้าใกล้หมด

## สิ่งที่ทำได้แล้ว

- Dashboard สรุปยอดสินค้า, สินค้าใกล้หมด, และรายการที่รออนุมัติ
- หน้าจัดการสินค้าและการทำ stock movement
- คิวอนุมัติสำหรับรายการที่เสี่ยงหรือมาจากสิทธิ์ต่ำ
- หน้า LINE webhook simulator สำหรับทดสอบคำสั่ง text และ quick reply
- หน้าตั้งค่าผู้ใช้, บทบาท, และตัวกระตุ้น reminder รายวัน
- API routes สำหรับ dashboard, products, movements, notifications, และ LINE integration
- Prisma schema สำหรับ PostgreSQL พร้อมโครง entity ตามสเปก

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL schema ผ่าน Prisma
- LINE Messaging API skeleton

## โครงสร้างโปรเจกต์

- `app/` - หน้าเว็บและ API routes
- `components/` - ฟอร์มและส่วน UI ที่ใช้ซ้ำ
- `lib/` - business logic, mock store, LINE parser, และ stock utilities
- `prisma/schema.prisma` - schema สำหรับ PostgreSQL

## การรันโปรเจกต์

1. ติดตั้ง dependencies

```bash
npm install
```

2. ตั้งค่า environment

```bash
cp .env.example .env
```

3. เริ่ม development server

```bash
npm run dev
```

4. เปิดใช้งานที่ `http://localhost:3000`

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_stock"
LINE_CHANNEL_ACCESS_TOKEN=""
LINE_CHANNEL_SECRET=""
APP_URL="http://localhost:3000"
```

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

- ปัจจุบัน runtime ใช้ in-memory demo store เพื่อให้ทดลอง UI และ flow ได้ทันที
- โครง PostgreSQL ถูกเตรียมไว้ใน Prisma schema แล้ว
- เมื่อเชื่อมต่อฐานข้อมูลจริง สามารถย้าย data layer ไปใช้ Prisma client ต่อได้โดยตรง

## Roadmap ถัดไป

- เชื่อม Prisma client กับ PostgreSQL จริง
- เพิ่ม authentication และ session management
- ทำ background scheduler สำหรับ reminder รายวัน
- เพิ่ม audit/approval dashboard แบบละเอียดขึ้น
- เชื่อม LINE OA webhook จริงด้วย signature verification
