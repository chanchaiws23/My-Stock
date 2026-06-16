import { createSeedState } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getMovementLabel, getStockDelta, isLowStock } from "@/lib/stock";
import type {
  DashboardSummary,
  LineIntegration,
  MovementStatus,
  MovementType,
  Notification,
  NotificationKind,
  Product,
  Role,
  RoleKey,
  StockMovement,
  StoreState,
  User,
} from "@/lib/types";

const seedState = createSeedState();

const roleKeyMap: Record<RoleKey, "ADMIN" | "MANAGER" | "STAFF"> = {
  admin: "ADMIN",
  manager: "MANAGER",
  staff: "STAFF",
};

const reverseRoleKeyMap: Record<"ADMIN" | "MANAGER" | "STAFF", RoleKey> = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

function nowIso() {
  return new Date().toISOString();
}

function toDateIso(value: Date | string) {
  return typeof value === "string" ? new Date(value).toISOString() : value.toISOString();
}

function mapRole(row: {
  id: string;
  key: "ADMIN" | "MANAGER" | "STAFF";
  name: string;
  permissions: string[];
}): Role {
  return {
    id: row.id,
    key: reverseRoleKeyMap[row.key],
    name: row.name,
    permissions: row.permissions,
  };
}

function mapUser(row: {
  id: string;
  name: string;
  email: string | null;
  lineUserId: string | null;
  roleId: string;
  active: boolean;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    lineUserId: row.lineUserId,
    roleId: row.roleId,
    active: row.active,
  };
}

function mapProduct(row: {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  location: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unit: row.unit,
    location: row.location,
    currentStock: row.currentStock,
    lowStockThreshold: row.lowStockThreshold,
    reorderPoint: row.reorderPoint,
    active: row.active,
    createdAt: toDateIso(row.createdAt),
    updatedAt: toDateIso(row.updatedAt),
  };
}

function mapMovement(row: {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  stockAfter: number;
  note: string | null;
  reason: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED";
  createdById: string | null;
  approvedById: string | null;
  source: string;
  lineMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StockMovement {
  return {
    id: row.id,
    productId: row.productId,
    type: row.type,
    quantity: row.quantity,
    stockAfter: row.stockAfter,
    note: row.note,
    reason: row.reason,
    status: row.status.toLowerCase() as MovementStatus,
    createdById: row.createdById,
    approvedById: row.approvedById,
    source: row.source,
    lineMessageId: row.lineMessageId,
    createdAt: toDateIso(row.createdAt),
    updatedAt: toDateIso(row.updatedAt),
  };
}

function mapNotification(row: {
  id: string;
  kind: NotificationKind;
  status: "OPEN" | "SENT" | "RESOLVED";
  title: string;
  message: string;
  productId: string | null;
  recipientId: string | null;
  channel: string;
  dedupeKey: string | null;
  sentAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Notification {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status.toLowerCase() as Notification["status"],
    title: row.title,
    message: row.message,
    productId: row.productId,
    recipientId: row.recipientId,
    channel: row.channel,
    dedupeKey: row.dedupeKey,
    sentAt: row.sentAt ? toDateIso(row.sentAt) : null,
    resolvedAt: row.resolvedAt ? toDateIso(row.resolvedAt) : null,
    createdAt: toDateIso(row.createdAt),
    updatedAt: toDateIso(row.updatedAt),
  };
}

function mapLineIntegration(row: {
  id: string;
  channelName: string;
  webhookEnabled: boolean;
  autoApproveStock: boolean;
}): LineIntegration {
  return {
    id: row.id,
    channelName: row.channelName,
    webhookEnabled: row.webhookEnabled,
    autoApproveStock: row.autoApproveStock,
  };
}

function toPrismaMovementStatus(status: MovementStatus): "APPROVED" | "PENDING" | "REJECTED" {
  return status.toUpperCase() as "APPROVED" | "PENDING" | "REJECTED";
}

function toPrismaNotificationStatus(status: Notification["status"]): "OPEN" | "SENT" | "RESOLVED" {
  return status.toUpperCase() as "OPEN" | "SENT" | "RESOLVED";
}

function toPrismaRoleKey(roleKey: RoleKey) {
  return roleKeyMap[roleKey];
}

async function seedRolesUsersProductsAndRules() {
  await prisma.$transaction(async (tx) => {
    for (const role of seedState.roles) {
      await tx.role.upsert({
        where: { id: role.id },
        update: {
          key: toPrismaRoleKey(role.key),
          name: role.name,
          permissions: role.permissions,
        },
        create: {
          id: role.id,
          key: toPrismaRoleKey(role.key),
          name: role.name,
          permissions: role.permissions,
        },
      });
    }

    for (const user of seedState.users) {
      await tx.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          email: user.email,
          lineUserId: user.lineUserId,
          roleId: user.roleId,
          active: user.active,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          lineUserId: user.lineUserId,
          roleId: user.roleId,
          active: user.active,
        },
      });
    }

    for (const product of seedState.products) {
      await tx.product.upsert({
        where: { id: product.id },
        update: {
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          location: product.location,
          currentStock: product.currentStock,
          lowStockThreshold: product.lowStockThreshold,
          reorderPoint: product.reorderPoint,
          active: product.active,
        },
        create: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          location: product.location,
          currentStock: product.currentStock,
          lowStockThreshold: product.lowStockThreshold,
          reorderPoint: product.reorderPoint,
          active: product.active,
        },
      });

      await tx.lowStockRule.upsert({
        where: { id: `rule-${product.id}` },
        update: {
          productId: product.id,
          threshold: product.lowStockThreshold,
          repeatDaily: true,
          active: true,
        },
        create: {
          id: `rule-${product.id}`,
          productId: product.id,
          threshold: product.lowStockThreshold,
          repeatDaily: true,
          active: true,
        },
      });
    }

    const existingIntegration = await tx.lineIntegration.findFirst();
    if (!existingIntegration) {
      await tx.lineIntegration.create({
        data: {
          id: seedState.lineIntegration.id,
          channelName: seedState.lineIntegration.channelName,
          webhookEnabled: seedState.lineIntegration.webhookEnabled,
          autoApproveStock: seedState.lineIntegration.autoApproveStock,
        },
      });
    }
  });
}

async function seedMovementsAndNotifications() {
  await prisma.$transaction(async (tx) => {
    const movementCount = await tx.stockMovement.count();
    if (movementCount === 0) {
      await tx.stockMovement.createMany({
        data: seedState.movements.map((movement) => ({
          id: movement.id,
          productId: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          stockAfter: movement.stockAfter,
          note: movement.note ?? null,
          reason: movement.reason ?? null,
          status: toPrismaMovementStatus(movement.status),
          createdById: movement.createdById ?? null,
          approvedById: movement.approvedById ?? null,
          source: movement.source,
          lineMessageId: movement.lineMessageId ?? null,
          createdAt: new Date(movement.createdAt),
          updatedAt: new Date(movement.updatedAt),
        })),
      });
    }

    const notificationCount = await tx.notification.count();
    if (notificationCount === 0) {
      await tx.notification.createMany({
        data: seedState.notifications.map((notification) => ({
          id: notification.id,
          kind: notification.kind,
          status: toPrismaNotificationStatus(notification.status),
          title: notification.title,
          message: notification.message,
          productId: notification.productId ?? null,
          recipientId: notification.recipientId ?? null,
          channel: notification.channel,
          dedupeKey: notification.dedupeKey ?? null,
          sentAt: notification.sentAt ? new Date(notification.sentAt) : null,
          resolvedAt: notification.resolvedAt ? new Date(notification.resolvedAt) : null,
          createdAt: new Date(notification.createdAt),
          updatedAt: new Date(notification.updatedAt),
        })),
      });
    }
  });
}

async function ensureSeedData() {
  const productCount = await prisma.product.count();
  if (productCount > 0) {
    return;
  }

  await seedRolesUsersProductsAndRules();
  await seedMovementsAndNotifications();
}

async function resolveCurrentUser(createdById?: string) {
  if (!createdById) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: createdById },
    include: {
      role: true,
    },
  });
}

async function syncLowStockState(
  tx: Pick<typeof prisma, "notification">,
  product: { id: string; name: string; sku: string; currentStock: number; lowStockThreshold: number; unit: string },
  recipientId?: string | null
) {
  const lowStock = product.currentStock <= product.lowStockThreshold;

  if (lowStock) {
    const dedupeKey = `low-stock:${product.id}`;
    const existing = await tx.notification.findFirst({
      where: {
        dedupeKey,
        status: "OPEN",
      },
    });

    if (!existing) {
      await tx.notification.create({
        data: {
          kind: "LOW_STOCK",
          status: "OPEN",
          title: "สินค้าต่ำกว่าจุดแจ้งเตือน",
          message: `${product.name} เหลือ ${product.currentStock} ${product.unit} ต่ำกว่าค่า threshold ${product.lowStockThreshold} ${product.unit}`,
          productId: product.id,
          recipientId: recipientId ?? null,
          channel: "line",
          dedupeKey,
          sentAt: new Date(),
        },
      });
    }

    return;
  }

  await tx.notification.updateMany({
    where: {
      productId: product.id,
      kind: "LOW_STOCK",
      status: "OPEN",
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });
}

async function createLowStockReminderForProduct(product: {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
}) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const dedupeKey = `reminder:${product.id}:${dateKey}`;
  const existing = await prisma.notification.findUnique({
    where: {
      dedupeKey,
    },
  });

  if (existing) {
    return false;
  }

  await prisma.notification.create({
    data: {
      kind: "REMINDER",
      status: "SENT",
      title: "เตือนสต๊อกขั้นต่ำรายวัน",
      message: `${product.name} ยังต่ำกว่าจุดแจ้งเตือน เหลือ ${product.currentStock} ${product.unit}`,
      productId: product.id,
      channel: "line",
      dedupeKey,
      sentAt: new Date(),
    },
  });

  return true;
}

function getUserRoleKey(user: { role?: { key: "ADMIN" | "MANAGER" | "STAFF" } | null } | null) {
  return user?.role ? reverseRoleKeyMap[user.role.key] : undefined;
}

function requiresApproval(input: {
  type: MovementType;
  quantity: number;
  user?: { role?: { key: "ADMIN" | "MANAGER" | "STAFF" } | null } | null;
  forceApproval?: boolean;
}) {
  if (input.forceApproval) return true;
  const roleKey = getUserRoleKey(input.user ?? null);
  if (!roleKey) return true;
  if (roleKey === "admin") return false;
  if (roleKey === "manager" && input.type !== "ADJUST") return false;
  if (input.type === "OUT" && input.quantity > 50) return true;
  return roleKey === "staff" || input.type === "ADJUST";
}

export async function seedDatabase() {
  await ensureSeedData();
}

export async function getRoles(): Promise<Role[]> {
  await ensureSeedData();
  const rows = await prisma.role.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapRole);
}

export async function getUsers(): Promise<User[]> {
  await ensureSeedData();
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapUser);
}

export async function getProducts(): Promise<Product[]> {
  await ensureSeedData();
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapProduct);
}

export async function getMovements(): Promise<StockMovement[]> {
  await ensureSeedData();
  const rows = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapMovement);
}

export async function getNotifications(): Promise<Notification[]> {
  await ensureSeedData();
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapNotification);
}

export async function getLineIntegration(): Promise<LineIntegration> {
  await ensureSeedData();
  const row = await prisma.lineIntegration.findFirst();
  if (row) {
    return mapLineIntegration(row);
  }

  return {
    id: seedState.lineIntegration.id,
    channelName: seedState.lineIntegration.channelName,
    webhookEnabled: seedState.lineIntegration.webhookEnabled,
    autoApproveStock: seedState.lineIntegration.autoApproveStock,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await ensureSeedData();

  const [products, users, movements, notifications, lineIntegration] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.stockMovement.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lineIntegration.findFirst(),
  ]);

  const mappedProducts = products.map(mapProduct);
  const mappedMovements = movements.map(mapMovement);
  const mappedNotifications = notifications.map(mapNotification);
  const lowStockProducts = mappedProducts.filter(isLowStock);

  return {
    totalProducts: mappedProducts.length,
    activeUsers: users.filter((user) => user.active).length,
    lowStockCount: lowStockProducts.length,
    pendingApprovals: mappedMovements.filter((movement) => movement.status === "pending").length,
    recentMovements: mappedMovements.slice(0, 6),
    lowStockProducts,
    notifications: mappedNotifications.slice(0, 8),
    lineIntegration: lineIntegration
      ? mapLineIntegration(lineIntegration)
      : {
          id: seedState.lineIntegration.id,
          channelName: seedState.lineIntegration.channelName,
          webhookEnabled: seedState.lineIntegration.webhookEnabled,
          autoApproveStock: seedState.lineIntegration.autoApproveStock,
        },
  };
}

export async function addProduct(input: {
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  location?: string;
}) {
  await ensureSeedData();

  const existing = await prisma.product.findUnique({
    where: { sku: input.sku.toUpperCase() },
  });

  if (existing) {
    throw new Error("SKU นี้มีอยู่แล้ว");
  }

  const product = await prisma.product.create({
    data: {
      sku: input.sku.toUpperCase(),
      name: input.name,
      category: input.category,
      unit: input.unit,
      location: input.location || "Main Warehouse",
      currentStock: input.currentStock,
      lowStockThreshold: input.lowStockThreshold,
      reorderPoint: input.reorderPoint,
      active: true,
    },
  });

  await prisma.lowStockRule.create({
    data: {
      productId: product.id,
      threshold: product.lowStockThreshold,
      repeatDaily: true,
      active: true,
    },
  });

  await syncLowStockState(prisma, {
    id: product.id,
    name: product.name,
    sku: product.sku,
    currentStock: product.currentStock,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
  });

  return mapProduct(product);
}

export async function updateProductThreshold(
  productId: string,
  threshold: number,
  reorderPoint?: number
) {
  await ensureSeedData();

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      lowStockThreshold: threshold,
      ...(typeof reorderPoint === "number" ? { reorderPoint } : {}),
    },
  });

  await prisma.lowStockRule.upsert({
    where: { id: `rule-${product.id}` },
    update: {
      productId: product.id,
      threshold,
      repeatDaily: true,
      active: true,
    },
    create: {
      id: `rule-${product.id}`,
      productId: product.id,
      threshold,
      repeatDaily: true,
      active: true,
    },
  });

  await syncLowStockState(prisma, {
    id: product.id,
    name: product.name,
    sku: product.sku,
    currentStock: product.currentStock,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
  });

  return mapProduct(product);
}

export async function createMovement(input: {
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
  await ensureSeedData();

  const sku = input.sku.toUpperCase();
  const product = await prisma.product.findUnique({
    where: { sku },
  });

  if (!product) {
    throw new Error(`ไม่พบสินค้า SKU ${input.sku}`);
  }

  const createdBy = await resolveCurrentUser(input.createdById);
  const pending = requiresApproval({
    type: input.type,
    quantity: input.quantity,
    user: createdBy,
    forceApproval: input.forceApproval,
  });

  const stockDelta = getStockDelta(input.type, input.quantity);
  const stockAfter = pending ? product.currentStock : product.currentStock + stockDelta;

  const result = await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        productId: product.id,
        type: input.type,
        quantity: input.quantity,
        stockAfter,
        note: input.note ?? null,
        reason: input.reason ?? null,
        status: pending ? "PENDING" : "APPROVED",
        createdById: input.createdById ?? null,
        approvedById: pending ? null : input.approvedById || input.createdById || null,
        source: input.source || "dashboard",
        lineMessageId: input.lineMessageId ?? null,
      },
    });

    let latestProduct = product;

    if (!pending) {
      latestProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: stockAfter,
        },
      });
      await syncLowStockState(tx, latestProduct, input.createdById);
    } else {
      await tx.notification.create({
        data: {
          kind: "APPROVAL_REQUEST",
          status: "OPEN",
          title: "รออนุมัติรายการสต๊อก",
          message: `${getMovementLabel(input.type)} ${product.sku} จำนวน ${input.quantity} รออนุมัติ`,
          productId: product.id,
          recipientId: null,
          channel: "line",
          dedupeKey: `approval:${movement.id}`,
          sentAt: new Date(),
        },
      });
    }

    return { movement, product: latestProduct };
  });

  return {
    movement: mapMovement(result.movement),
    product: mapProduct(result.product),
    requiresApproval: pending,
  };
}

export async function approveMovementRequest(movementId: string, approvedById?: string) {
  await ensureSeedData();

  const movement = await prisma.stockMovement.findUnique({
    where: { id: movementId },
    include: { product: true },
  });

  if (!movement) {
    throw new Error("ไม่พบรายการที่รออนุมัติ");
  }
  if (movement.status !== "PENDING") {
    throw new Error("รายการนี้ไม่อยู่ในสถานะรออนุมัติ");
  }

  const result = await prisma.$transaction(async (tx) => {
    const delta = getStockDelta(movement.type, movement.quantity);
    const updatedProduct = await tx.product.update({
      where: { id: movement.productId },
      data: {
        currentStock: movement.product.currentStock + delta,
      },
    });

    const updatedMovement = await tx.stockMovement.update({
      where: { id: movement.id },
      data: {
        status: "APPROVED",
        approvedById: approvedById ?? null,
        stockAfter: updatedProduct.currentStock,
      },
    });

    await tx.notification.updateMany({
      where: {
        dedupeKey: `approval:${movement.id}`,
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    await syncLowStockState(tx, updatedProduct, approvedById);

    return { updatedMovement, updatedProduct };
  });

  return mapMovement(result.updatedMovement);
}

export async function rejectMovementRequest(movementId: string, rejectedById?: string) {
  await ensureSeedData();

  const movement = await prisma.stockMovement.findUnique({
    where: { id: movementId },
  });

  if (!movement) {
    throw new Error("ไม่พบรายการที่รออนุมัติ");
  }

  const updatedMovement = await prisma.stockMovement.update({
    where: { id: movement.id },
    data: {
      status: "REJECTED",
      approvedById: rejectedById ?? null,
    },
  });

  await prisma.notification.updateMany({
    where: {
      dedupeKey: `approval:${movement.id}`,
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  return mapMovement(updatedMovement);
}

export async function generateLowStockReminders() {
  await ensureSeedData();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  const lowStockProducts = products.filter((product) => isLowStock(mapProduct(product)));
  let generated = 0;

  for (const product of lowStockProducts) {
    const created = await createLowStockReminderForProduct({
      id: product.id,
      name: product.name,
      currentStock: product.currentStock,
      unit: product.unit,
    });

    if (created) {
      generated += 1;
    }
  }

  return generated;
}

export async function setLineIntegration(input: Partial<LineIntegration>) {
  await ensureSeedData();

  const existing = await prisma.lineIntegration.findFirst();
  if (!existing) {
    const created = await prisma.lineIntegration.create({
      data: {
        id: seedState.lineIntegration.id,
        channelName: input.channelName ?? seedState.lineIntegration.channelName,
        webhookEnabled: input.webhookEnabled ?? seedState.lineIntegration.webhookEnabled,
        autoApproveStock: input.autoApproveStock ?? seedState.lineIntegration.autoApproveStock,
      },
    });
    return mapLineIntegration(created);
  }

  const updated = await prisma.lineIntegration.update({
    where: { id: existing.id },
    data: {
      ...(typeof input.channelName === "string" ? { channelName: input.channelName } : {}),
      ...(typeof input.webhookEnabled === "boolean" ? { webhookEnabled: input.webhookEnabled } : {}),
      ...(typeof input.autoApproveStock === "boolean" ? { autoApproveStock: input.autoApproveStock } : {}),
    },
  });

  return mapLineIntegration(updated);
}

export async function findProductBySkuSafe(sku: string) {
  await ensureSeedData();

  const product = await prisma.product.findUnique({
    where: { sku: sku.toUpperCase() },
  });

  return product ? mapProduct(product) : undefined;
}

export async function findUserByLineUserId(lineUserId: string) {
  await ensureSeedData();

  const user = await prisma.user.findUnique({
    where: { lineUserId },
  });

  return user ? mapUser(user) : undefined;
}

export async function handleApprovalCommand(movementId: string, approvedById?: string) {
  return approveMovementRequest(movementId, approvedById);
}

export async function getRoleByKey(key: string) {
  await ensureSeedData();

  const role = await prisma.role.findFirst({
    where: {
      key: key.toUpperCase() as "ADMIN" | "MANAGER" | "STAFF",
    },
  });

  return role ? mapRole(role) : undefined;
}

export async function getActiveAdminRecipients() {
  await ensureSeedData();

  const users = await prisma.user.findMany({
    where: {
      active: true,
      role: {
        key: {
          in: ["ADMIN", "MANAGER"],
        },
      },
    },
  });

  return users.map(mapUser);
}

export async function getStateSnapshot(): Promise<StoreState> {
  await ensureSeedData();

  const [roles, users, products, movements, notifications, lineIntegration] = await Promise.all([
    getRoles(),
    getUsers(),
    getProducts(),
    getMovements(),
    getNotifications(),
    getLineIntegration(),
  ]);

  return {
    roles,
    users,
    products,
    movements,
    notifications,
    lineIntegration,
  };
}

export async function getPendingMovements() {
  const movements = await getMovements();
  return movements.filter((movement) => movement.status === "pending");
}
