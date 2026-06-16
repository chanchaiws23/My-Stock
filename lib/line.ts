import {
  createMovement,
  findProductBySkuSafe,
  findUserByLineUserId,
  getPendingMovements,
  getProducts,
  handleApprovalCommand,
} from "@/lib/store";
import type { MovementType } from "@/lib/types";
import { z } from "zod";

export type ParsedLineCommand =
  | {
      kind: "stock";
      sku: string;
    }
  | {
      kind: "movement";
      type: MovementType;
      sku: string;
      quantity: number;
      note?: string;
    }
  | {
      kind: "approve";
      movementId: string;
    }
  | {
      kind: "help";
    };

const movementPattern = /^(เพิ่ม|รับเข้า|add|in|out|จ่ายออก|ปรับ|adjust|return)\s+([A-Za-z0-9\-_]+)\s+(\d+)(?:\s+(.+))?$/i;
const stockPattern = /^(สต๊อก|stock|status)\s+([A-Za-z0-9\-_]+)$/i;
const approvePattern = /^(approve|อนุมัติ)\s+([A-Za-z0-9\-_]+)$/i;

export function parseLineCommand(text: string): ParsedLineCommand {
  const trimmed = text.trim();

  const stockMatch = trimmed.match(stockPattern);
  if (stockMatch) {
    return {
      kind: "stock",
      sku: stockMatch[2].toUpperCase(),
    };
  }

  const approveMatch = trimmed.match(approvePattern);
  if (approveMatch) {
    return {
      kind: "approve",
      movementId: approveMatch[2],
    };
  }

  const movementMatch = trimmed.match(movementPattern);
  if (movementMatch) {
    const rawType = movementMatch[1].toLowerCase();
    const typeMap: Record<string, MovementType> = {
      เพิ่ม: "IN",
      รับเข้า: "IN",
      add: "IN",
      in: "IN",
      out: "OUT",
      จ่ายออก: "OUT",
      ปรับ: "ADJUST",
      adjust: "ADJUST",
      return: "RETURN",
    };

    return {
      kind: "movement",
      type: typeMap[rawType] ?? "IN",
      sku: movementMatch[2].toUpperCase(),
      quantity: Number(movementMatch[3]),
      note: movementMatch[4]?.trim() || undefined,
    };
  }

  return { kind: "help" };
}

const quickReplySchema = z.object({
  action: z.enum(["stock", "movement", "approve"]),
  sku: z.string().optional(),
  movementId: z.string().optional(),
  type: z.enum(["IN", "OUT", "ADJUST", "RETURN"]).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  note: z.string().optional(),
});

export function parseQuickReplyPayload(data: string): ParsedLineCommand {
  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(data);
  } catch {
    return { kind: "help" };
  }

  const parsed = quickReplySchema.safeParse(parsedPayload);
  if (!parsed.success) {
    return { kind: "help" };
  }

  if (parsed.data.action === "stock" && parsed.data.sku) {
    return {
      kind: "stock",
      sku: parsed.data.sku.toUpperCase(),
    };
  }

  if (parsed.data.action === "approve" && parsed.data.movementId) {
    return {
      kind: "approve",
      movementId: parsed.data.movementId,
    };
  }

  if (parsed.data.action === "movement" && parsed.data.sku && parsed.data.quantity && parsed.data.type) {
    return {
      kind: "movement",
      sku: parsed.data.sku.toUpperCase(),
      quantity: parsed.data.quantity,
      type: parsed.data.type,
      note: parsed.data.note,
    };
  }

  return { kind: "help" };
}

type LineIncomingEvent = {
  type?: string;
  source?: {
    userId?: string;
  };
  message?: {
    type?: string;
    text?: string;
  };
  postback?: {
    data?: string;
  };
  replyToken?: string;
};

function buildHelpText() {
  return [
    "คำสั่ง LINE ที่รองรับ:",
    "- stock SKU-001",
    "- add SKU-001 10 หมายเหตุ",
    "- out SKU-001 5 ใช้หน้าร้าน",
    "- adjust SKU-001 2 แก้ยอด",
    "- approve MOV-123",
  ].join("\n");
}

export function handleLineIncomingPayload(payload: unknown) {
  const events = Array.isArray(payload)
    ? (payload as LineIncomingEvent[])
    : Array.isArray((payload as { events?: LineIncomingEvent[] }).events)
      ? ((payload as { events: LineIncomingEvent[] }).events ?? [])
      : [];

  const results = events.map((event) => {
    const userId = event.source?.userId;
    const user = userId ? findUserByLineUserId(userId) : undefined;
    const text = event.type === "postback" ? event.postback?.data ?? "" : event.message?.text ?? "";
    const command =
      event.type === "postback" ? parseQuickReplyPayload(text) : parseLineCommand(text);

    if (command.kind === "help") {
      return {
        ok: true,
        kind: "help" as const,
        message: buildHelpText(),
      };
    }

    if (command.kind === "stock") {
      const product = findProductBySkuSafe(command.sku);
      if (!product) {
        return {
          ok: false,
          kind: "not-found" as const,
          message: `ไม่พบสินค้า SKU ${command.sku}`,
        };
      }

      return {
        ok: true,
        kind: "stock" as const,
        message: `${product.name} คงเหลือ ${product.currentStock} ${product.unit} (ขั้นต่ำ ${product.lowStockThreshold} ${product.unit})`,
      };
    }

    if (command.kind === "approve") {
      const approval = handleApprovalCommand(command.movementId, user?.id);
      return {
        ok: true,
        kind: "approve" as const,
        message: `อนุมัติรายการ ${approval.id} เรียบร้อยแล้ว`,
        movementId: approval.id,
      };
    }

    const created = createMovement({
      sku: command.sku,
      type: command.type,
      quantity: command.quantity,
      note: command.note,
      source: "line",
      createdById: user?.id,
      forceApproval: user?.roleId === "role-staff" && command.type !== "IN",
    });

    return {
      ok: true,
      kind: "movement" as const,
      message: created.requiresApproval
        ? `${command.sku} ถูกส่งเข้าคิวอนุมัติ`
        : `${getProducts().find((item) => item.sku === command.sku)?.name ?? command.sku} อัปเดตสต๊อกแล้ว`,
      movementId: created.movement.id,
      requiresApproval: created.requiresApproval,
      pendingCount: getPendingMovements().length,
    };
  });

  return {
    ok: true,
    results,
  };
}
