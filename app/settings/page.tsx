import { ReminderTrigger } from "@/components/reminder-trigger";
import { getLineIntegration, getRoles, getUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const roles = await getRoles();
  const users = await getUsers();
  const lineIntegration = await getLineIntegration();

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="hero-badge">Settings</span>
          <h1 className="page-title">ผู้ใช้, สิทธิ์, และการแจ้งเตือน</h1>
          <p className="page-copy">
            วางโครงสำหรับ multi-role control, approvals, และ reminder workflow
          </p>
        </div>
      </header>

      <section className="grid two-col">
        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">บทบาทผู้ใช้</h2>
              <p className="card-subtitle">Admin, Manager, Staff</p>
            </div>
          </div>

          <div className="notification-list">
            {roles.map((role) => (
              <div className="notification-item" key={role.id}>
                <p className="notification-title">{role.name}</p>
                <p className="notification-message">{role.permissions.join(" · ")}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">ผู้ใช้งานในระบบ</h2>
              <p className="card-subtitle">พร้อมเชื่อมกับ LINE userId</p>
            </div>
          </div>

          <div className="notification-list">
            {users.map((user) => (
              <div className="notification-item" key={user.id}>
                <p className="notification-title">{user.name}</p>
                <p className="notification-message">{user.email || "ไม่มี email"}</p>
                <p className="notification-message">
                  roleId: {user.roleId} · lineUserId: {user.lineUserId || "-"}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid two-col section-spacing">
        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">LINE configuration</h2>
              <p className="card-subtitle">โครงตั้งต้นสำหรับ webhook และการอนุมัติ</p>
            </div>
          </div>

          <div className="notification-item">
            <p className="notification-title">{lineIntegration.channelName}</p>
            <p className="notification-message">
              Webhook: {lineIntegration.webhookEnabled ? "enabled" : "disabled"}
            </p>
            <p className="notification-message">
              Auto approve stock: {lineIntegration.autoApproveStock ? "enabled" : "disabled"}
            </p>
          </div>
        </article>

        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">Reminder tool</h2>
              <p className="card-subtitle">สร้าง reminder รายวันสำหรับสินค้าที่ต่ำกว่าจุดแจ้งเตือน</p>
            </div>
          </div>

          <ReminderTrigger />
        </article>
      </section>
    </div>
  );
}
