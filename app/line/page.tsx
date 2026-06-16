import { LineWebhookTester } from "@/components/line-webhook-tester";
import type { User } from "@/lib/types";
import { getActiveAdminRecipients, getLineIntegration } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LinePage() {
  const integration = await getLineIntegration();
  const recipients = await getActiveAdminRecipients();

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="hero-badge">LINE Integration</span>
          <h1 className="page-title">Webhook, command parser, และ quick reply</h1>
          <p className="page-copy">
            ทดสอบการตีความคำสั่ง LINE และดู recipient ที่จะได้รับแจ้งเตือนในรอบแรก
          </p>
        </div>
      </header>

      <section className="grid two-col">
        <LineWebhookTester />

        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">สถานะ integration</h2>
              <p className="card-subtitle">ค่าพื้นฐานสำหรับการต่อ LINE OA</p>
            </div>
          </div>

          <div className="notification-item">
            <p className="notification-title">{integration.channelName}</p>
            <p className="notification-message">
              Webhook: {integration.webhookEnabled ? "enabled" : "disabled"}
            </p>
            <p className="notification-message">
              Auto approve: {integration.autoApproveStock ? "on" : "off"}
            </p>
          </div>

          <div className="notification-item">
            <p className="notification-title">Recipients หลัก</p>
            <p className="notification-message">
              {recipients.map((user: User) => user.name).join(", ") || "ยังไม่มี recipient"}
            </p>
          </div>

          <div className="notification-item">
            <p className="notification-title">ตัวอย่างคำสั่ง</p>
            <p className="notification-message">
              stock SKU-001 · add SKU-001 10 · out SKU-003 2 · approve MOV-123
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
