"use client";

import { useState, useTransition } from "react";

export function ReminderTrigger() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setMessage("");
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "generate-reminders" }),
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    setMessage(response.ok ? payload.message || "สร้าง reminder แล้ว" : payload.error || "ผิดพลาด");
    startTransition(() => {});
  }

  return (
    <div className="actions">
      <button className="button secondary" type="button" disabled={isPending} onClick={handleClick}>
        สร้าง reminder รายวัน
      </button>
      {message ? <span className="subtle">{message}</span> : null}
    </div>
  );
}
