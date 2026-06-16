"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import type { Product, User } from "@/lib/types";

type Props = {
  products: Product[];
  users: User[];
};

export function MovementForm({ products, users }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    sku: products[0]?.sku ?? "",
    type: "IN",
    quantity: "1",
    note: "",
    createdById: users[0]?.id ?? "",
    forceApproval: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
      }),
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error || "ไม่สามารถบันทึกรายการได้");
      return;
    }

    setMessage(payload.message || "บันทึกรายการแล้ว");
    startTransition(() => router.refresh());
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h2 className="card-title">ทำรายการสต๊อก</h2>
          <p className="card-subtitle">รับเข้า, จ่ายออก, ปรับยอด, และคืนสินค้า</p>
        </div>
      </div>

      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="sku">สินค้า</label>
          <select
            id="sku"
            className="select"
            value={form.sku}
            onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
          >
            {products.map((product) => (
              <option key={product.id} value={product.sku}>
                {product.sku} - {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="type">ประเภท</label>
          <select
            id="type"
            className="select"
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
          >
            <option value="IN">รับเข้า</option>
            <option value="OUT">จ่ายออก</option>
            <option value="ADJUST">ปรับยอด</option>
            <option value="RETURN">คืนสินค้า</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="quantity">จำนวน</label>
          <input
            id="quantity"
            className="input"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="createdById">ผู้ทำรายการ</label>
          <select
            id="createdById"
            className="select"
            value={form.createdById}
            onChange={(event) =>
              setForm((current) => ({ ...current, createdById: event.target.value }))
            }
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="note">หมายเหตุ</label>
        <textarea
          id="note"
          className="textarea"
          value={form.note}
          onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          placeholder="เช่น รับเข้าออเดอร์วันที่..."
        />
      </div>

      <label className="pill-row">
        <input
          type="checkbox"
          checked={form.forceApproval}
          onChange={(event) =>
            setForm((current) => ({ ...current, forceApproval: event.target.checked }))
          }
        />
        บังคับให้เข้าคิวอนุมัติ
      </label>

      <div className="actions">
        <button className="button" type="submit" disabled={isPending}>
          {isPending ? "กำลังบันทึก..." : "บันทึกรายการ"}
        </button>
      </div>

      {message ? <p className="helper">{message}</p> : null}
    </form>
  );
}
