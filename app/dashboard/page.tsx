import { MetricCard } from "@/components/metric-card";
import { getDashboardSummary } from "@/lib/store";
import { formatThaiDateTime, formatNumber } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="hero-badge">Dashboard</span>
          <h1 className="page-title">ภาพรวมสต๊อกและ LINE alert</h1>
          <p className="page-copy">
            ดูสุขภาพสต๊อก, รายการคงเหลือต่ำ, งานที่รออนุมัติ, และสถานะการแจ้งเตือนจากศูนย์กลางเดียว
          </p>
        </div>
      </header>

      <section className="grid metrics">
        <MetricCard
          label="สินค้า"
          value={formatNumber(summary.totalProducts)}
          note="จำนวน SKU ที่ active"
        />
        <MetricCard
          label="ผู้ใช้งาน active"
          value={formatNumber(summary.activeUsers)}
          note="หลายบทบาทในระบบ"
        />
        <MetricCard
          label="สินค้าใกล้หมด"
          value={formatNumber(summary.lowStockCount)}
          note="ชน threshold แล้ว"
        />
        <MetricCard
          label="รออนุมัติ"
          value={formatNumber(summary.pendingApprovals)}
          note="รายการที่ต้อง review"
        />
      </section>

      <section className="grid two-col section-spacing">
        <article className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">สินค้าใกล้ต่ำสุด</h2>
              <p className="card-subtitle">รายการที่ต้องเติมสต๊อกก่อนเกิดการขาด</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>สินค้า</th>
                  <th>คงเหลือ</th>
                  <th>ขั้นต่ำ</th>
                </tr>
              </thead>
              <tbody>
                {summary.lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>
                      <span className="badge low">
                        {formatNumber(product.currentStock)} {product.unit}
                      </span>
                    </td>
                    <td>{formatNumber(product.lowStockThreshold)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">สถานะการแจ้งเตือน</h2>
              <p className="card-subtitle">แจ้งเตือนผ่าน LINE และระบบ approval</p>
            </div>
          </div>

          <div className="notification-list">
            {summary.notifications.map((notification) => (
              <div className="notification-item" key={notification.id}>
                <p className="notification-title">{notification.title}</p>
                <p className="notification-message">{notification.message}</p>
                <div className="pill-row section-spacing">
                  <span className={`badge ${notification.status === "open" ? "warn" : "ok"}`}>
                    {notification.status}
                  </span>
                  <span className="badge">{formatThaiDateTime(notification.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid two-col section-spacing">
        <article className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">ประวัติการเคลื่อนไหวล่าสุด</h2>
              <p className="card-subtitle">รับเข้า, จ่ายออก, ปรับยอด, และคืนสินค้า</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ประเภท</th>
                  <th>จำนวน</th>
                  <th>หลังรายการ</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{formatThaiDateTime(movement.createdAt)}</td>
                    <td>{movement.type}</td>
                    <td>{formatNumber(movement.quantity)}</td>
                    <td>{formatNumber(movement.stockAfter)}</td>
                    <td>
                      <span className={`badge ${movement.status === "pending" ? "warn" : "ok"}`}>
                        {movement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">LINE integration</h2>
              <p className="card-subtitle">Webhook และการอัปเดตสต๊อกจาก chat</p>
            </div>
          </div>

          <div className="stack">
            <div className="notification-item">
              <p className="notification-title">{summary.lineIntegration.channelName}</p>
              <p className="notification-message">
                Webhook: {summary.lineIntegration.webhookEnabled ? "enabled" : "disabled"}
              </p>
            </div>
            <div className="notification-item">
              <p className="notification-title">กติกาการประมวลผล</p>
              <p className="notification-message">
                คำสั่งจากผู้มีสิทธิ์เพียงพอจะอัปเดตทันที ส่วนคำสั่งที่เสี่ยงจะถูกส่งเข้าคิวอนุมัติ
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
