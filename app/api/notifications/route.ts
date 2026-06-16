import { generateLowStockReminders, getNotifications } from "@/lib/store";
import { NextResponse } from "next/server";
import { z } from "zod";

const notificationActionSchema = z.object({
  action: z.enum(["generate-reminders"]),
});

export async function GET() {
  return NextResponse.json({ items: await getNotifications() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = notificationActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }

  const generated = await generateLowStockReminders();
  return NextResponse.json({
    message: `สร้าง reminder สำหรับสินค้าใกล้หมด ${generated} รายการ`,
  });
}
