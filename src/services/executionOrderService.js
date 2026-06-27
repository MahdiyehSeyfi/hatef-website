import { getCurrentUser } from "./authService";
import { addNotificationOnce } from "./notificationService";

const EXECUTION_ORDERS_STORAGE_KEY = "hatef_execution_orders";

let memoryOrders = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "execution-order") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function getCurrentPersianDateTime() {
  const now = new Date();

  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString();
  }
}

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "مدرس هاتف"
  );
}

function normalizeCommitteeStatus(status) {
  const value = normalizeValue(status);

  if (value === "جدید") {
    return "در انتظار پذیرش";
  }

  if (value === "accepted") {
    return "قبول شده";
  }

  if (value === "completed" || value === "archived") {
    return "تکمیل شده";
  }

  return value || "در انتظار پذیرش";
}

function normalizeInstructorStatus(status) {
  const value = normalizeCommitteeStatus(status);

  if (value === "در انتظار پذیرش") {
    return "جدید";
  }

  return value;
}

function normalizeOrder(order = {}) {
  const deadlineDate = normalizeValue(order.deadlineDate || order.deadline);
  const deadlineTime = normalizeValue(order.deadlineTime);
  const description = normalizeValue(order.description || order.summary);
  const summary = normalizeValue(order.summary || order.description);
  const subject = normalizeValue(order.subject, "سفارش اجرا");

  return {
    id: order.id || makeId(),
    title: normalizeValue(order.title, "سفارش اجرای دوره یا رویداد"),
    summary,
    description,
    subject,
    category: normalizeValue(order.category || order.subject, subject),
    deadlineDate,
    deadlineTime: deadlineTime || "--:--",
    deadline:
      normalizeValue(order.deadline) ||
      `${deadlineDate || "بدون تاریخ"}${deadlineTime ? ` - ساعت ${deadlineTime}` : ""}`,
    status: normalizeCommitteeStatus(order.status),
    acceptedBy: normalizeValue(order.acceptedBy),
    acceptedById: normalizeValue(order.acceptedById),
    acceptedAt: normalizeValue(order.acceptedAt),
    completedAt: normalizeValue(order.completedAt),
    createdAt: normalizeValue(order.createdAt, getCurrentPersianDateTime()),
    createdBy: normalizeValue(order.createdBy, "committee"),
    updatedAt: normalizeValue(order.updatedAt),
  };
}

function normalizeOrders(orders) {
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.filter(Boolean).map(normalizeOrder);
}

function mergeOrders(existingOrders = [], seedOrders = []) {
  const ordersById = new Map();

  normalizeOrders(seedOrders).forEach((order) => {
    ordersById.set(String(order.id), order);
  });

  normalizeOrders(existingOrders).forEach((order) => {
    ordersById.set(String(order.id), order);
  });

  return Array.from(ordersById.values());
}

function sortNewest(orders) {
  return [...orders].sort((first, second) =>
    String(second.createdAt || "").localeCompare(String(first.createdAt || "")),
  );
}

function readOrdersFromStorage() {
  if (!canUseStorage()) {
    return memoryOrders;
  }

  const storedValue = window.localStorage.getItem(EXECUTION_ORDERS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  return normalizeOrders(safeParseJson(storedValue, []));
}

function writeOrders(orders) {
  const normalizedOrders = sortNewest(normalizeOrders(orders));

  if (!canUseStorage()) {
    memoryOrders = normalizedOrders;
    return normalizedOrders;
  }

  window.localStorage.setItem(
    EXECUTION_ORDERS_STORAGE_KEY,
    JSON.stringify(normalizedOrders),
  );

  return normalizedOrders;
}

function readOrders(seedOrders = []) {
  const storedOrders = readOrdersFromStorage();
  const mergedOrders = mergeOrders(storedOrders, seedOrders);

  if (mergedOrders.length !== storedOrders.length) {
    writeOrders(mergedOrders);
  }

  if (!storedOrders.length && seedOrders.length) {
    writeOrders(mergedOrders);
  }

  return sortNewest(mergedOrders);
}

function toInstructorOrder(order) {
  return {
    ...order,
    status: normalizeInstructorStatus(order.status),
  };
}

function toCommitteeOrder(order) {
  return {
    ...order,
    status: normalizeCommitteeStatus(order.status),
  };
}

function notifyInstructorsNewOrder(order) {
  addNotificationOnce({
    targetRole: "instructor",
    title: "سفارش اجرای جدید ثبت شد",
    body: `یک سفارش جدید برای «${order.title}» در پنل شما ثبت شد.`,
    category: "سفارش‌های اجرا",
    sourceType: "execution-order",
    sourceId: order.id,
    eventKey: `execution-order-created-${order.id}`,
    isImportant: true,
  });
}

function notifyCommitteeOrderAccepted(order) {
  addNotificationOnce({
    targetRole: "committee",
    title: "سفارش اجرا پذیرفته شد",
    body: `${order.acceptedBy || "مدرس"} سفارش «${order.title}» را قبول کرد.`,
    category: "سفارش‌های اجرا",
    sourceType: "execution-order",
    sourceId: order.id,
    eventKey: `execution-order-accepted-${order.id}`,
    isImportant: true,
  });
}

export function getExecutionOrders(seedOrders = []) {
  return readOrders(seedOrders);
}

export function getCommitteeExecutionOrders(seedOrders = []) {
  return readOrders(seedOrders).map(toCommitteeOrder);
}

export function getInstructorExecutionOrders(seedOrders = []) {
  return readOrders(seedOrders).map(toInstructorOrder);
}

export function createExecutionOrder(orderData = {}) {
  const currentUser = getCurrentUser?.();
  const order = normalizeOrder({
    ...orderData,
    id: orderData.id || makeId(),
    status: "در انتظار پذیرش",
    createdAt: orderData.createdAt || getCurrentPersianDateTime(),
    createdBy: currentUser?.id || "committee",
  });

  writeOrders([order, ...readOrders()]);
  notifyInstructorsNewOrder(order);

  return toCommitteeOrder(order);
}

export function acceptExecutionOrder(orderId) {
  const currentUser = getCurrentUser?.();
  const acceptedBy = getUserDisplayName(currentUser);
  let acceptedOrder = null;

  const updatedOrders = readOrders().map((order) => {
    if (String(order.id) !== String(orderId)) {
      return order;
    }

    acceptedOrder = normalizeOrder({
      ...order,
      status: "قبول شده",
      acceptedBy,
      acceptedById: currentUser?.id || "",
      acceptedAt: getCurrentPersianDateTime(),
      updatedAt: getCurrentPersianDateTime(),
    });

    return acceptedOrder;
  });

  writeOrders(updatedOrders);

  if (acceptedOrder) {
    notifyCommitteeOrderAccepted(acceptedOrder);
  }

  return acceptedOrder ? toInstructorOrder(acceptedOrder) : null;
}

export function getExecutionOrderStats(seedOrders = []) {
  const orders = readOrders(seedOrders);

  return {
    total: orders.length,
    waiting: orders.filter(
      (order) => normalizeCommitteeStatus(order.status) === "در انتظار پذیرش",
    ).length,
    accepted: orders.filter(
      (order) => normalizeCommitteeStatus(order.status) === "قبول شده",
    ).length,
    completed: orders.filter(
      (order) => normalizeCommitteeStatus(order.status) === "تکمیل شده",
    ).length,
  };
}

export function clearExecutionOrders() {
  return writeOrders([]);
}

export { EXECUTION_ORDERS_STORAGE_KEY };
