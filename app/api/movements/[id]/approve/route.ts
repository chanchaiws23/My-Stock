import { approveMovementRequest } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const movement = approveMovementRequest(id);
    return NextResponse.json({
      message: `อนุมัติรายการ ${movement.id} เรียบร้อย`,
      movement,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "อนุมัติไม่สำเร็จ" },
      { status: 400 }
    );
  }
}
