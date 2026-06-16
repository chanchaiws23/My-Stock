"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

type Result = {
  ok?: boolean;
  message?: string;
  results?: Array<{ ok: boolean; kind: string; message: string }>;
  error?: string;
};

export function LineWebhookTester() {
  const [mode, setMode] = useState<"text" | "postback">("text");
  const [userId, setUserId] = useState("U-staff");
  const [command, setCommand] = useState("stock SKU-001");
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const payload =
      mode === "postback"
        ? {
            events: [
              {
                type: "postback",
                source: { userId },
                postback: {
                  data: JSON.stringify({
                    action: "movement",
                    sku: "SKU-001",
                    type: "IN",
                    quantity: 10,
                    note: "quick reply",
                  }),
                },
              },
            ],
          }
        : {
            events: [
              {
                type: "message",
                source: { userId },
                message: { type: "text", text: command },
              },
            ],
          };

    const response = await fetch("/api/line/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as Result;
    setResult(json);
    startTransition(() => {});
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <h2 className="card-title">ทดสอบ LINE webhook</h2>
          <p className="card-subtitle">จำลองคำสั่งจาก LINE OA / quick reply</p>
        </div>
      </div>

      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="userId">LINE userId</label>
          <input
            id="userId"
            className="input"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="mode">โหมด</label>
          <select
            id="mode"
            className="select"
            value={mode}
            onChange={(event) => setMode(event.target.value as "text" | "postback")}
          >
            <option value="text">ข้อความ</option>
            <option value="postback">Quick reply / postback</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="command">คำสั่ง</label>
        <input
          id="command"
          className="input"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="เช่น add SKU-001 10"
          disabled={mode === "postback"}
        />
      </div>

      <div className="actions">
        <button className="button" type="submit" disabled={isPending}>
          {isPending ? "กำลังส่ง..." : "ส่งเข้า webhook"}
        </button>
      </div>

      {result ? (
        <pre className="notification-item" style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </form>
  );
}
