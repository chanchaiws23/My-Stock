import { rejectMovementRequest } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const movement = rejectMovementRequest(id);
    return NextResponse.json({
      message: `ปฏิเสธรายการ ${movement.id} แล้ว`,
      movement,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ปฏิเสธไม่สำเร็จ" },
      { status: 400 }
    );
  }
}
