import type { MovementType, Product } from "@/lib/types";

export function getStockDelta(type: MovementType, quantity: number) {
  switch (type) {
    case "IN":
    case "RETURN":
      return Math.abs(quantity);
    case "OUT":
      return -Math.abs(quantity);
    case "ADJUST":
      return quantity;
  }
}

export function isLowStock(product: Product) {
  return product.currentStock <= product.lowStockThreshold;
}

export function getMovementLabel(type: MovementType) {
  switch (type) {
    case "IN":
      return "รับเข้า";
    case "OUT":
      return "จ่ายออก";
    case "ADJUST":
      return "ปรับยอด";
    case "RETURN":
      return "คืนสินค้า";
  }
}

export function formatThaiDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 1,
  }).format(value);
}
