import { getCurrentUser } from "./authService";

const NOTIFICATIONS_STORAGE_KEY = "hatef_notifications";

let memoryNotifications = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "notification") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
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

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (
    value.includes("committee") ||
    value.includes("secretariat") ||
    value.includes("دبیرخانه") ||
    value.includes("کمیته")
  ) {
    return "committee";
  }

  if (value.includes("review") || value.includes("داور")) {
    return "reviewer";
  }

  if (
    value.includes("business") ||
    value.includes("commercial") ||
    value.includes("همکار") ||
    value.includes("تجاری")
  ) {
    return "business";
  }

  if (
    value.includes("instructor") ||
    value.includes("teacher") ||
    value.includes("event_organizer") ||
    value.includes("organizer") ||
    value.includes("مدرس") ||
    value.includes("برگزارکننده") ||
    value.includes("رویدادگر")
  ) {
    return "instructor";
  }

  if (value.includes("innovator") || value.includes("فناور")) {
    return "innovator";
  }

  return value || "user";
}

function normalizeNotification(notification) {
  const targetRole = normalizeRole(
    notification.targetRole || notification.role,
  );

  return {
    id: notification.id || makeId(),
    title: notification.title || "اعلان جدید",
    body: notification.body || notification.message || "",
    category: notification.category || "پیام سامانه",
    sentAt:
      notification.sentAt ||
      notification.createdAt ||
      getCurrentPersianDateTime(),
    targetUserId: notification.targetUserId || notification.userId || "",
    targetRole,
    sourceType: notification.sourceType || "system",
    sourceId: notification.sourceId || "",
    eventKey: notification.eventKey || "",
    isRead: Boolean(notification.isRead),
    isImportant: Boolean(notification.isImportant),
  };
}

function normalizeNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(Boolean).map(normalizeNotification);
}

function readNotifications() {
  if (!canUseStorage()) {
    return memoryNotifications;
  }

  const storedValue = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  return normalizeNotifications(safeParseJson(storedValue, []));
}

function writeNotifications(notifications) {
  const normalizedNotifications = normalizeNotifications(notifications);

  if (!canUseStorage()) {
    memoryNotifications = normalizedNotifications;
    return normalizedNotifications;
  }

  window.localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(normalizedNotifications),
  );

  return normalizedNotifications;
}

function sortNewest(notifications) {
  return [...notifications].sort((first, second) =>
    String(second.sentAt || "").localeCompare(String(first.sentAt || "")),
  );
}

function getCurrentUserInfo() {
  const user = getCurrentUser?.();

  return {
    id: user?.id || "",
    role: normalizeRole(user?.role),
  };
}

function matchesTarget(notification, userId, role) {
  const normalizedRole = normalizeRole(role);
  const notificationRole = normalizeRole(notification.targetRole);

  if (
    notification.targetUserId &&
    String(notification.targetUserId) === String(userId)
  ) {
    return true;
  }

  if (
    !notification.targetUserId &&
    notificationRole &&
    notificationRole === normalizedRole
  ) {
    return true;
  }

  return false;
}

function isSameNotification(firstNotification, secondNotification) {
  if (firstNotification.eventKey && secondNotification.eventKey) {
    return firstNotification.eventKey === secondNotification.eventKey;
  }

  return (
    firstNotification.sourceType === secondNotification.sourceType &&
    String(firstNotification.sourceId) ===
      String(secondNotification.sourceId) &&
    String(firstNotification.targetUserId || "") ===
      String(secondNotification.targetUserId || "") &&
    String(firstNotification.targetRole || "") ===
      String(secondNotification.targetRole || "") &&
    firstNotification.title === secondNotification.title
  );
}

export function getNotifications() {
  return sortNewest(readNotifications());
}

export function setNotifications(notifications) {
  return writeNotifications(notifications);
}

export function getNotificationsForUser(userId, role) {
  return getNotifications().filter((notification) =>
    matchesTarget(notification, userId, role),
  );
}

export function getNotificationsForCurrentUser() {
  const currentUser = getCurrentUserInfo();
  return getNotificationsForUser(currentUser.id, currentUser.role);
}

export function getCommitteeNotifications() {
  return getNotificationsForUser("committee", "committee");
}

export function addNotification(notificationData) {
  const notifications = getNotifications();
  const newNotification = normalizeNotification({
    ...notificationData,
    id: notificationData.id || makeId(),
    sentAt: notificationData.sentAt || getCurrentPersianDateTime(),
    isRead: false,
  });

  writeNotifications([newNotification, ...notifications]);

  return newNotification;
}

export function addNotificationOnce(notificationData) {
  const notifications = getNotifications();
  const newNotification = normalizeNotification({
    ...notificationData,
    id: notificationData.id || makeId(),
    sentAt: notificationData.sentAt || getCurrentPersianDateTime(),
    isRead: false,
  });

  const existingNotification = notifications.find((notification) =>
    isSameNotification(notification, newNotification),
  );

  if (existingNotification) {
    return existingNotification;
  }

  writeNotifications([newNotification, ...notifications]);
  return newNotification;
}

export function markNotificationAsRead(notificationId) {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((notification) =>
    String(notification.id) === String(notificationId)
      ? { ...notification, isRead: true }
      : notification,
  );

  writeNotifications(updatedNotifications);

  return updatedNotifications.find(
    (notification) => String(notification.id) === String(notificationId),
  );
}

export function markAllNotificationsAsReadForCurrentUser() {
  const currentUser = getCurrentUserInfo();
  const notifications = getNotifications();

  const updatedNotifications = notifications.map((notification) =>
    matchesTarget(notification, currentUser.id, currentUser.role)
      ? { ...notification, isRead: true }
      : notification,
  );

  writeNotifications(updatedNotifications);
  return getNotificationsForCurrentUser();
}

export function markAllCommitteeNotificationsAsRead() {
  const notifications = getNotifications();

  const updatedNotifications = notifications.map((notification) =>
    matchesTarget(notification, "committee", "committee")
      ? { ...notification, isRead: true }
      : notification,
  );

  writeNotifications(updatedNotifications);
  return getCommitteeNotifications();
}

export function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter(
    (notification) => String(notification.id) !== String(notificationId),
  );

  writeNotifications(updatedNotifications);
  return updatedNotifications;
}

export function deleteAllNotificationsForCurrentUser() {
  const currentUser = getCurrentUserInfo();
  const notifications = getNotifications();

  const updatedNotifications = notifications.filter(
    (notification) =>
      !matchesTarget(notification, currentUser.id, currentUser.role),
  );

  writeNotifications(updatedNotifications);
  return [];
}

export function deleteAllCommitteeNotifications() {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter(
    (notification) => !matchesTarget(notification, "committee", "committee"),
  );

  writeNotifications(updatedNotifications);
  return [];
}

export function clearNotifications() {
  writeNotifications([]);
  return [];
}

export { NOTIFICATIONS_STORAGE_KEY };
