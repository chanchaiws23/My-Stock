import { addProduct, getProducts } from "@/lib/store";
import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  currentStock: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  reorderPoint: z.coerce.number().int().nonnegative(),
  location: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ items: await getProducts() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ข้อมูลสินค้าไม่ถูกต้อง", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await addProduct(parsed.data);
    return NextResponse.json({
      message: `เพิ่มสินค้า ${product.name} เรียบร้อย`,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ไม่สามารถเพิ่มสินค้าได้" },
      { status: 400 }
    );
  }
}
