import { updateProductThreshold } from "@/lib/store";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  reorderPoint: z.coerce.number().int().nonnegative().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await updateProductThreshold(
      id,
      parsed.data.lowStockThreshold,
      parsed.data.reorderPoint
    );
    return NextResponse.json({
      message: `อัปเดต threshold ของ ${product.name} แล้ว`,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "อัปเดตไม่สำเร็จ" },
      { status: 400 }
    );
  }
}
