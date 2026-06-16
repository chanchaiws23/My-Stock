"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

export function ProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    unit: "",
    currentStock: "0",
    lowStockThreshold: "0",
    reorderPoint: "0",
    location: "Main Warehouse",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        currentStock: Number(form.currentStock),
        lowStockThreshold: Number(form.lowStockThreshold),
        reorderPoint: Number(form.reorderPoint),
      }),
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error || "ไม่สามารถเพิ่มสินค้าได้");
      return;
    }

    setMessage(payload.message || "เพิ่มสินค้าเรียบร้อย");
    setForm({
      sku: "",
      name: "",
      category: "",
      unit: "",
      currentStock: "0",
      lowStockThreshold: "0",
      reorderPoint: "0",
      location: "Main Warehouse",
    });

    startTransition(() => router.refresh());
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h2 className="card-title">เพิ่มสินค้าใหม่</h2>
          <p className="card-subtitle">ใช้ฟอร์มนี้เพื่อสร้างสินค้าและกำหนดจุดแจ้งเตือนขั้นต่ำ</p>
        </div>
      </div>

      <div className="form-grid cols-2">
        {[
          ["sku", "SKU"],
          ["name", "ชื่อสินค้า"],
          ["category", "หมวดหมู่"],
          ["unit", "หน่วย"],
          ["location", "คลัง/ตำแหน่ง"],
          ["currentStock", "สต๊อกเริ่มต้น"],
          ["lowStockThreshold", "ขั้นต่ำแจ้งเตือน"],
          ["reorderPoint", "จุดสั่งซื้อ"],
        ].map(([field, label]) => (
          <div className="field" key={field}>
            <label htmlFor={field}>{label}</label>
            <input
              id={field}
              className="input"
              value={form[field as keyof typeof form]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field]: event.target.value }))
              }
              inputMode={field.includes("Stock") || field.includes("Point") ? "numeric" : "text"}
              required
            />
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="button" type="submit" disabled={isPending}>
          {isPending ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </div>

      {message ? <p className="helper">{message}</p> : null}
    </form>
  );
}
