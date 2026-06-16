import { ProductForm } from "@/components/product-form";
import { getProducts } from "@/lib/store";
import { formatNumber } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="hero-badge">Stock Master</span>
          <h1 className="page-title">จัดการสินค้าและจุดแจ้งเตือนขั้นต่ำ</h1>
          <p className="page-copy">
            เพิ่มสินค้าใหม่, กำหนด threshold, และดู stock ปัจจุบันในมุมเดียว
          </p>
        </div>
      </header>

      <section className="grid two-col">
        <ProductForm />

        <article className="card stack">
          <div className="card-header">
            <div>
              <h2 className="card-title">สินค้าปัจจุบัน</h2>
              <p className="card-subtitle">ข้อมูลพร้อมใช้สำหรับ dashboard และ LINE command</p>
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="subtle">{product.category}</div>
                    </td>
                    <td>{formatNumber(product.currentStock)} {product.unit}</td>
                    <td>{formatNumber(product.lowStockThreshold)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
