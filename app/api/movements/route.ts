import { createMovement, getMovements } from "@/lib/store";
import { NextResponse } from "next/server";
import { z } from "zod";

const movementSchema = z.object({
  sku: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUST", "RETURN"]),
  quantity: z.coerce.number().int().positive(),
  note: z.string().optional(),
  reason: z.string().optional(),
  createdById: z.string().optional(),
  forceApproval: z.coerce.boolean().optional(),
});

export async function GET() {
  return NextResponse.json({ items: getMovements() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = movementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ข้อมูล movement ไม่ถูกต้อง", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = createMovement({
      ...parsed.data,
      source: "dashboard",
    });

    return NextResponse.json({
      message: result.requiresApproval
        ? `ส่งรายการ ${result.movement.id} เข้าคิวอนุมัติ`
        : `บันทึก movement ${result.movement.id} เรียบร้อย`,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "บันทึก movement ไม่สำเร็จ" },
      { status: 400 }
    );
  }
}
