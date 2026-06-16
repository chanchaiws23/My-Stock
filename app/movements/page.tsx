import { MovementForm } from "@/components/movement-form";
import { PendingApprovals } from "@/components/pending-approvals";
import { getMovements, getPendingMovements, getProducts, getUsers } from "@/lib/store";
import { formatThaiDateTime, formatNumber } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const products = await getProducts();
  const users = await getUsers();
  const movements = await getMovements();
  const pendingMovements = await getPendingMovements();

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="hero-badge">Movement Center</span>
          <h1 className="page-title">รับเข้า, จ่ายออก, ปรับยอด</h1>
          <p className="page-copy">
            บันทึกรายการเคลื่อนไหวและจัดการคิวอนุมัติจากมุมมองเดียว
          </p>
        </div>
      </header>

      <section className="grid two-col">
        <MovementForm products={products} users={users} />

        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">คิวอนุมัติ</h2>
              <p className="card-subtitle">รายการที่ถูกส่งจาก LINE หรือผู้ใช้สิทธิ์ต่ำกว่า</p>
            </div>
          </div>

          <PendingApprovals movements={pendingMovements} products={products} />
        </article>
      </section>

      <section className="card section-spacing">
        <div className="card-header">
          <div>
            <h2 className="card-title">ประวัติทั้งหมด</h2>
            <p className="card-subtitle">Audit trail ของทุก movement</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เวลา</th>
                <th>SKU</th>
                <th>ประเภท</th>
                <th>จำนวน</th>
                <th>หลังรายการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const product = products.find((item) => item.id === movement.productId);

                return (
                  <tr key={movement.id}>
                    <td>{formatThaiDateTime(movement.createdAt)}</td>
                    <td>{product?.sku ?? movement.productId}</td>
                    <td>{movement.type}</td>
                    <td>{formatNumber(movement.quantity)}</td>
                    <td>{formatNumber(movement.stockAfter)}</td>
                    <td>
                      <span className={`badge ${movement.status === "pending" ? "warn" : "ok"}`}>
                        {movement.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
