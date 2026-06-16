export type RoleKey = "admin" | "manager" | "staff";

export type MovementType = "IN" | "OUT" | "ADJUST" | "RETURN";
export type MovementStatus = "approved" | "pending" | "rejected";

export type NotificationKind =
  | "LOW_STOCK"
  | "REMINDER"
  | "APPROVAL_REQUEST"
  | "SYSTEM";

export type NotificationStatus = "open" | "sent" | "resolved";

export type DashboardSummary = {
  totalProducts: number;
  activeUsers: number;
  lowStockCount: number;
  pendingApprovals: number;
  recentMovements: StockMovement[];
  lowStockProducts: Product[];
  notifications: Notification[];
  lineIntegration: LineIntegration;
};

export type Role = {
  id: string;
  key: RoleKey;
  name: string;
  permissions: string[];
};

export type User = {
  id: string;
  name: string;
  email?: string | null;
  lineUserId?: string | null;
  roleId: string;
  active: boolean;
};

export type Product = {
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
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  stockAfter: number;
  note?: string | null;
  reason?: string | null;
  status: MovementStatus;
  createdById?: string | null;
  approvedById?: string | null;
  source: string;
  lineMessageId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  kind: NotificationKind;
  status: NotificationStatus;
  title: string;
  message: string;
  productId?: string | null;
  recipientId?: string | null;
  channel: string;
  dedupeKey?: string | null;
  sentAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LineIntegration = {
  id: string;
  channelName: string;
  webhookEnabled: boolean;
  autoApproveStock: boolean;
};

export type StoreState = {
  roles: Role[];
  users: User[];
  products: Product[];
  movements: StockMovement[];
  notifications: Notification[];
  lineIntegration: LineIntegration;
};
