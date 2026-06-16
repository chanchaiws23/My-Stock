import { createSeedState } from "@/lib/mock-data";
import { getMovementLabel, getStockDelta, isLowStock } from "@/lib/stock";
import type {
  DashboardSummary,
  LineIntegration,
  MovementStatus,
  MovementType,
  Notification,
  NotificationKind,
  NotificationStatus,
  Product,
  Role,
  StockMovement,
  StoreState,
  User,
} from "@/lib/types";

const state: StoreState = createSeedState();

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findProductBySku(sku: string) {
  return state.products.find((product) => product.sku.toUpperCase() === sku.toUpperCase());
}

function findProduct(productId: string) {
  return state.products.find((product) => product.id === productId);
}

function findUser(userId: string | undefined | null) {
  if (!userId) return undefined;
  return state.users.find((user) => user.id === userId);
}

function findRole(roleId: string) {
  return state.roles.find((role) => role.id === roleId);
}

function hasPermission(user: User | undefined, permission: string) {
  if (!user) return false;
  const role = findRole(user.roleId);
  if (!role) return false;
  if (role.key === "admin") return true;
  return role.permissions.includes(permission);
}

function toMovementRecord(input: Omit<StockMovement, "createdAt" | "updatedAt">): StockMovement {
  const createdAt = nowIso();
  return {
    ...input,
    createdAt,
    updatedAt: createdAt,
  };
}

function toNotificationRecord(
  input: Omit<Notification, "createdAt" | "updatedAt">
): Notification {
  const createdAt = nowIso();
  return {
    ...input,
    createdAt,
    updatedAt: createdAt,
  };
}

function closeOpenLowStockNotification(productId: string) {
  state.notifications
    .filter((notification) => notification.productId === productId && notification.kind === "LOW_STOCK" && notification.status === "open")
    .forEach((notification) => {
      notification.status = "resolved";
      notification.resolvedAt = nowIso();
      notification.updatedAt = notification.resolvedAt;
    });
}

function createLowStockAlert(productId: string, recipientId?: string) {
  const product = findProduct(productId);
  if (!product || !isLowStock(product)) return;

  const dedupeKey = `low-stock:${product.id}`;
  const existing = state.notifications.find((notification) => notification.dedupeKey === dedupeKey && notification.status === "open");
  if (existing) return;

  state.notifications.unshift(
    toNotificationRecord({
      id: createId("noti"),
      kind: "LOW_STOCK",
      status: "open",
      title: "สินค้าต่ำกว่าจุดแจ้งเตือน",
      message: `${product.name} เหลือ ${product.currentStock} ${product.unit} ต่ำกว่าค่า threshold ${product.lowStockThreshold} ${product.unit}`,
      productId,
      recipientId,
      channel: "line",
      dedupeKey,
      sentAt: nowIso(),
    })
  );
}

function createReminder(product: Product) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const dedupeKey = `reminder:${product.id}:${dateKey}`;
  const existing = state.notifications.find((notification) => notification.dedupeKey === dedupeKey);
  if (existing) return;

  state.notifications.unshift(
    toNotificationRecord({
      id: createId("noti"),
      kind: "REMINDER",
      status: "sent",
      title: "เตือนสต๊อกขั้นต่ำรายวัน",
      message: `${product.name} ยังต่ำกว่าจุดแจ้งเตือน เหลือ ${product.currentStock} ${product.unit}`,
      productId: product.id,
      channel: "line",
      dedupeKey,
      sentAt: nowIso(),
    })
  );
}

export function getRoles(): Role[] {
  return state.roles.map((item) => ({ ...item }));
}

export function getUsers(): User[] {
  return state.users.map((item) => ({ ...item }));
}

export function getProducts(): Product[] {
  return state.products.map((item) => ({ ...item }));
}

export function getMovements(): StockMovement[] {
  return [...state.movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getNotifications(): Notification[] {
  return [...state.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLineIntegration(): LineIntegration {
  return { ...state.lineIntegration };
}

export function getDashboardSummary(): DashboardSummary {
  const lowStockProducts = state.products.filter(isLowStock);
  const pendingApprovals = state.movements.filter((movement) => movement.status === "pending").length;

  return {
    totalProducts: state.products.length,
    activeUsers: state.users.filter((user) => user.active).length,
    lowStockCount: lowStockProducts.length,
    pendingApprovals,
    recentMovements: getMovements().slice(0, 6),
    lowStockProducts,
    notifications: getNotifications().slice(0, 8),
    lineIntegration: getLineIntegration(),
  };
}

export function addProduct(input: {
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  location?: string;
}) {
  if (findProductBySku(input.sku)) {
    throw new Error("SKU นี้มีอยู่แล้ว");
  }

  const product: Product = {
    id: createId("prd"),
    sku: input.sku.toUpperCase(),
    name: input.name,
    category: input.category,
    unit: input.unit,
    location: input.location || "Main Warehouse",
    currentStock: input.currentStock,
    lowStockThreshold: input.lowStockThreshold,
    reorderPoint: input.reorderPoint,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.products.unshift(product);
  if (isLowStock(product)) {
    createLowStockAlert(product.id);
  }

  return product;
}

export function updateProductThreshold(productId: string, threshold: number, reorderPoint?: number) {
  const product = findProduct(productId);
  if (!product) {
    throw new Error("ไม่พบสินค้า");
  }

  product.lowStockThreshold = threshold;
  if (typeof reorderPoint === "number") {
    product.reorderPoint = reorderPoint;
  }

  if (isLowStock(product)) {
    createLowStockAlert(product.id);
  } else {
    closeOpenLowStockNotification(product.id);
  }

  return { ...product };
}

function getUserRoleKey(user: User | undefined) {
  if (!user) return undefined;
  const role = findRole(user.roleId);
  return role?.key;
}

function requiresApproval(input: {
  type: MovementType;
  quantity: number;
  user?: User;
  forceApproval?: boolean;
}) {
  if (input.forceApproval) return true;
  const roleKey = getUserRoleKey(input.user);
  if (!roleKey) return true;
  if (roleKey === "admin") return false;
  if (roleKey === "manager" && input.type !== "ADJUST") return false;
  if (input.type === "OUT" && input.quantity > 50) return true;
  return roleKey === "staff" || input.type === "ADJUST";
}

export function createMovement(input: {
  sku: string;
  type: MovementType;
  quantity: number;
  note?: string;
  reason?: string;
  createdById?: string;
  approvedById?: string;
  source?: string;
  lineMessageId?: string;
  forceApproval?: boolean;
}) {
  const product = findProductBySku(input.sku);
  if (!product) {
    throw new Error(`ไม่พบสินค้า SKU ${input.sku}`);
  }

  const createdBy = findUser(input.createdById);
  const pending = requiresApproval({
    type: input.type,
    quantity: input.quantity,
    user: createdBy,
    forceApproval: input.forceApproval,
  });

  const stockDelta = getStockDelta(input.type, input.quantity);
  const stockAfter = pending ? product.currentStock : product.currentStock + stockDelta;
  const movement = toMovementRecord({
    id: createId("mov"),
    productId: product.id,
    type: input.type,
    quantity: input.quantity,
    stockAfter,
    note: input.note,
    reason: input.reason,
    status: pending ? "pending" : "approved",
    createdById: input.createdById,
    approvedById: pending ? undefined : input.approvedById || input.createdById,
    source: input.source || "dashboard",
    lineMessageId: input.lineMessageId,
  });

  state.movements.unshift(movement);

  if (!pending) {
    product.currentStock = stockAfter;
    product.updatedAt = nowIso();
    if (isLowStock(product)) {
      createLowStockAlert(product.id, input.createdById);
    } else {
      closeOpenLowStockNotification(product.id);
    }
  } else {
    state.notifications.unshift(
      toNotificationRecord({
        id: createId("noti"),
        kind: "APPROVAL_REQUEST",
        status: "open",
        title: "รออนุมัติรายการสต๊อก",
        message: `${getMovementLabel(input.type)} ${product.sku} จำนวน ${input.quantity} รออนุมัติ`,
        productId: product.id,
        recipientId: undefined,
        channel: "line",
        dedupeKey: `approval:${movement.id}`,
        sentAt: nowIso(),
      })
    );
  }

  return {
    movement,
    product: { ...product },
    requiresApproval: pending,
  };
}

export function approveMovementRequest(movementId: string, approvedById?: string) {
  const movement = state.movements.find((item) => item.id === movementId);
  if (!movement) {
    throw new Error("ไม่พบรายการที่รออนุมัติ");
  }
  if (movement.status !== "pending") {
    throw new Error("รายการนี้ไม่อยู่ในสถานะรออนุมัติ");
  }

  const product = findProduct(movement.productId);
  if (!product) {
    throw new Error("ไม่พบสินค้า");
  }

  const delta = getStockDelta(movement.type, movement.quantity);
  product.currentStock += delta;
  product.updatedAt = nowIso();

  movement.status = "approved";
  movement.approvedById = approvedById;
  movement.stockAfter = product.currentStock;
  movement.updatedAt = nowIso();

  closeOpenLowStockNotification(product.id);
  if (isLowStock(product)) {
    createLowStockAlert(product.id, approvedById);
  }

  const approvalNotification = state.notifications.find((notification) => notification.dedupeKey === `approval:${movement.id}`);
  if (approvalNotification) {
    approvalNotification.status = "resolved";
    approvalNotification.resolvedAt = nowIso();
    approvalNotification.updatedAt = approvalNotification.resolvedAt;
  }

  return { ...movement };
}

export function rejectMovementRequest(movementId: string, rejectedById?: string) {
  const movement = state.movements.find((item) => item.id === movementId);
  if (!movement) {
    throw new Error("ไม่พบรายการที่รออนุมัติ");
  }
  movement.status = "rejected";
  movement.approvedById = rejectedById;
  movement.updatedAt = nowIso();

  const approvalNotification = state.notifications.find((notification) => notification.dedupeKey === `approval:${movement.id}`);
  if (approvalNotification) {
    approvalNotification.status = "resolved";
    approvalNotification.resolvedAt = nowIso();
    approvalNotification.updatedAt = approvalNotification.resolvedAt;
  }

  return { ...movement };
}

export function generateLowStockReminders() {
  const lowStockProducts = state.products.filter(isLowStock);
  lowStockProducts.forEach((product) => createReminder(product));
  return lowStockProducts.length;
}

export function setLineIntegration(input: Partial<LineIntegration>) {
  state.lineIntegration = {
    ...state.lineIntegration,
    ...input,
  };
  return { ...state.lineIntegration };
}

export function findProductBySkuSafe(sku: string) {
  const product = findProductBySku(sku);
  return product ? { ...product } : undefined;
}

export function findUserByLineUserId(lineUserId: string) {
  const user = state.users.find((item) => item.lineUserId === lineUserId);
  return user ? { ...user } : undefined;
}

export function handleApprovalCommand(movementId: string, approvedById?: string) {
  return approveMovementRequest(movementId, approvedById);
}

export function getRoleByKey(key: string) {
  return state.roles.find((role) => role.key === key.toLowerCase());
}

export function getActiveAdminRecipients() {
  return state.users.filter((user) => {
    const role = findRole(user.roleId);
    return user.active && (role?.key === "admin" || role?.key === "manager");
  });
}

export function getStateSnapshot() {
  return {
    roles: getRoles(),
    users: getUsers(),
    products: getProducts(),
    movements: getMovements(),
    notifications: getNotifications(),
    lineIntegration: getLineIntegration(),
  };
}

export function getPendingMovements() {
  return getMovements().filter((movement) => movement.status === "pending");
}
