import { getLineIntegration, setLineIntegration } from "@/lib/store";
import { NextResponse } from "next/server";
import { z } from "zod";

const integrationSchema = z.object({
  webhookEnabled: z.boolean().optional(),
  autoApproveStock: z.boolean().optional(),
  channelName: z.string().min(1).optional(),
});

export async function GET() {
  return NextResponse.json(await getLineIntegration());
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = integrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูล integration ไม่ถูกต้อง" }, { status: 400 });
  }

  return NextResponse.json({
    message: "อัปเดต LINE integration แล้ว",
    integration: await setLineIntegration(parsed.data),
  });
}
