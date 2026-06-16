"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Product, StockMovement } from "@/lib/types";

type Props = {
  movements: StockMovement[];
  products: Product[];
};

export function PendingApprovals({ movements, products }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function updateMovement(id: string, action: "approve" | "reject") {
    setMessage("");
    const response = await fetch(`/api/movements/${id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error || "ดำเนินการไม่สำเร็จ");
      return;
    }

    setMessage(payload.message || "ดำเนินการสำเร็จ");
    startTransition(() => router.refresh());
  }

  if (movements.length === 0) {
    return <p className="muted">ไม่มีรายการรออนุมัติ</p>;
  }

  return (
    <div className="stack">
      {movements.map((movement) => {
        const product = products.find((item) => item.id === movement.productId);

        return (
          <div className="notification-item" key={movement.id}>
            <p className="notification-title">
              {product?.name ?? movement.productId} - {movement.type}
            </p>
            <p className="notification-message">
              จำนวน {movement.quantity} | สถานะ {movement.status}
            </p>
            <div className="actions section-spacing">
              <button
                className="button"
                type="button"
                disabled={isPending}
                onClick={() => updateMovement(movement.id, "approve")}
              >
                อนุมัติ
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={isPending}
                onClick={() => updateMovement(movement.id, "reject")}
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        );
      })}

      {message ? <p className="helper">{message}</p> : null}
    </div>
  );
}
