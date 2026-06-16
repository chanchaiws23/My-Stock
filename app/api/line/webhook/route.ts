import { handleLineIncomingPayload } from "@/lib/line";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = handleLineIncomingPayload(payload);
  return NextResponse.json(result);
}
