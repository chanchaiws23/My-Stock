import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Kanit, Sarabun } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "My Stock",
  description: "ระบบสต๊อกสินค้าและแจ้งเตือน LINE",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "สินค้า" },
  { href: "/movements", label: "เคลื่อนไหว" },
  { href: "/line", label: "LINE" },
  { href: "/settings", label: "ตั้งค่า" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} ${sarabun.variable}`}>
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <span className="brand-mark">MS</span>
              <div>
                <p className="brand-title">My Stock</p>
                <p className="brand-subtitle">Inventory + LINE Alert</p>
              </div>
            </div>

            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="sidebar-note">
              <p className="sidebar-note-title">Status</p>
              <p>คลังเดียว, หลายบทบาท, พร้อมต่อ PostgreSQL</p>
            </div>
          </aside>

          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
