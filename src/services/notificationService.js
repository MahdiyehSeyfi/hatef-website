import { getCurrentUser } from "./authService";
import {
  buildEqFilter,
  supabaseRestRequest,
} from "./supabaseRestSessionService";

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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
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

function safeSetStorageItem(key, value) {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage:`, error);
    return false;
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

function toIsoDateOrNow(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  return new Date().toISOString();
}

function normalizeNotification(notification = {}) {
  const targetRole = normalizeRole(
    notification.targetRole || notification.role,
  );

  return {
    id:
      notification.id ||
      notification.localNotificationId ||
      notification.local_notification_id ||
      makeId(),
    title: notification.title || "اعلان جدید",
    body: notification.body || notification.message || "",
    category: notification.category || "پیام سامانه",
    sentAt:
      notification.sentAt ||
      notification.createdAt ||
      notification.created_at ||
      getCurrentPersianDateTime(),
    targetUserId:
      notification.targetUserId ||
      notification.target_user_id ||
      notification.userId ||
      "",
    targetRole,
    sourceType: notification.sourceType || notification.source_type || "system",
    sourceId: notification.sourceId || notification.source_id || "",
    eventKey: notification.eventKey || notification.event_key || "",
    isRead: Boolean(notification.isRead || notification.is_read),
    isImportant: Boolean(notification.isImportant || notification.is_important),
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

  safeSetStorageItem(
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

function toSupabaseNotification(notification = {}) {
  const normalizedNotification = normalizeNotification(notification);
  const targetUserId = isUuid(normalizedNotification.targetUserId)
    ? normalizedNotification.targetUserId
    : null;

  return {
    local_notification_id: normalizedNotification.id,
    title: normalizedNotification.title,
    body: normalizedNotification.body,
    category: normalizedNotification.category,
    sent_at: toIsoDateOrNow(normalizedNotification.sentAt),
    target_user_id: targetUserId,
    target_role: normalizedNotification.targetRole || null,
    source_type: normalizedNotification.sourceType || "system",
    source_id: normalizedNotification.sourceId || "",
    event_key: normalizedNotification.eventKey || "",
    is_read: Boolean(normalizedNotification.isRead),
    is_important: Boolean(normalizedNotification.isImportant),
    updated_at: new Date().toISOString(),
  };
}

async function findSupabaseNotificationRow(notification = {}) {
  const normalizedNotification = normalizeNotification(notification);

  if (!normalizedNotification.id) {
    return null;
  }

  const { data, error } = await supabaseRestRequest("notifications", {
    method: "GET",
    query: `?select=id&${buildEqFilter(
      "local_notification_id",
      normalizedNotification.id,
    )}`,
    prefer: "",
  });

  if (error) {
    console.warn("Supabase notification lookup failed:", error.message);
    return null;
  }

  return Array.isArray(data) ? data[0] || null : null;
}

async function syncNotificationToSupabase(notification = {}) {
  const payload = toSupabaseNotification(notification);

  if (!payload.title) {
    return null;
  }

  const existingRow = await findSupabaseNotificationRow(notification);

  if (existingRow?.id) {
    const { data, error } = await supabaseRestRequest("notifications", {
      method: "PATCH",
      query: `?${buildEqFilter("id", existingRow.id)}`,
      body: payload,
    });

    if (error) {
      console.warn("Supabase notification update failed:", error.message);
      return null;
    }

    return Array.isArray(data) ? data[0]?.id || existingRow.id : existingRow.id;
  }

  const { error } = await supabaseRestRequest("notifications", {
    method: "POST",
    body: {
      ...payload,
      created_at: new Date().toISOString(),
    },
    prefer: "return=minimal",
  });

  if (error) {
    console.warn("Supabase notification insert failed:", error.message);
    return null;
  }

  return true;
}

async function deleteNotificationFromSupabase(notification = {}) {
  const normalizedNotification = normalizeNotification(notification);

  if (!normalizedNotification.id) {
    return false;
  }

  const { error } = await supabaseRestRequest("notifications", {
    method: "DELETE",
    query: `?${buildEqFilter("local_notification_id", normalizedNotification.id)}`,
    prefer: "",
  });

  if (error) {
    console.warn("Supabase notification delete failed:", error.message);
    return false;
  }

  return true;
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

export function addNotification(notificationData = {}) {
  const notifications = getNotifications();
  const newNotification = normalizeNotification({
    ...notificationData,
    id: notificationData.id || makeId(),
    sentAt: notificationData.sentAt || getCurrentPersianDateTime(),
    isRead: false,
  });

  writeNotifications([newNotification, ...notifications]);
  syncNotificationToSupabase(newNotification);

  return newNotification;
}

export function addNotificationOnce(notificationData = {}) {
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
    syncNotificationToSupabase(existingNotification);
    return existingNotification;
  }

  writeNotifications([newNotification, ...notifications]);
  syncNotificationToSupabase(newNotification);

  return newNotification;
}

export function markNotificationAsRead(notificationId) {
  const notifications = getNotifications();
  let updatedNotification = null;

  const updatedNotifications = notifications.map((notification) => {
    if (String(notification.id) !== String(notificationId)) {
      return notification;
    }

    updatedNotification = {
      ...notification,
      isRead: true,
    };

    return updatedNotification;
  });

  writeNotifications(updatedNotifications);

  if (updatedNotification) {
    syncNotificationToSupabase(updatedNotification);
  }

  return updatedNotification;
}

export function markAllNotificationsAsReadForCurrentUser() {
  const currentUser = getCurrentUserInfo();
  const notifications = getNotifications();
  const changedNotifications = [];

  const updatedNotifications = notifications.map((notification) => {
    if (!matchesTarget(notification, currentUser.id, currentUser.role)) {
      return notification;
    }

    const updatedNotification = {
      ...notification,
      isRead: true,
    };

    changedNotifications.push(updatedNotification);
    return updatedNotification;
  });

  writeNotifications(updatedNotifications);

  changedNotifications.forEach((notification) => {
    syncNotificationToSupabase(notification);
  });

  return getNotificationsForCurrentUser();
}

export function markAllCommitteeNotificationsAsRead() {
  const notifications = getNotifications();
  const changedNotifications = [];

  const updatedNotifications = notifications.map((notification) => {
    if (!matchesTarget(notification, "committee", "committee")) {
      return notification;
    }

    const updatedNotification = {
      ...notification,
      isRead: true,
    };

    changedNotifications.push(updatedNotification);
    return updatedNotification;
  });

  writeNotifications(updatedNotifications);

  changedNotifications.forEach((notification) => {
    syncNotificationToSupabase(notification);
  });

  return getCommitteeNotifications();
}

export function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const targetNotification = notifications.find(
    (notification) => String(notification.id) === String(notificationId),
  );

  const updatedNotifications = notifications.filter(
    (notification) => String(notification.id) !== String(notificationId),
  );

  writeNotifications(updatedNotifications);

  if (targetNotification) {
    deleteNotificationFromSupabase(targetNotification);
  }

  return updatedNotifications;
}

export function deleteAllNotificationsForCurrentUser() {
  const currentUser = getCurrentUserInfo();
  const notifications = getNotifications();
  const deletedNotifications = notifications.filter((notification) =>
    matchesTarget(notification, currentUser.id, currentUser.role),
  );

  const updatedNotifications = notifications.filter(
    (notification) =>
      !matchesTarget(notification, currentUser.id, currentUser.role),
  );

  writeNotifications(updatedNotifications);

  deletedNotifications.forEach((notification) => {
    deleteNotificationFromSupabase(notification);
  });

  return [];
}

export function deleteAllCommitteeNotifications() {
  const notifications = getNotifications();
  const deletedNotifications = notifications.filter((notification) =>
    matchesTarget(notification, "committee", "committee"),
  );

  const updatedNotifications = notifications.filter(
    (notification) => !matchesTarget(notification, "committee", "committee"),
  );

  writeNotifications(updatedNotifications);

  deletedNotifications.forEach((notification) => {
    deleteNotificationFromSupabase(notification);
  });

  return [];
}

export function clearNotifications() {
  writeNotifications([]);
  return [];
}

export { NOTIFICATIONS_STORAGE_KEY };
