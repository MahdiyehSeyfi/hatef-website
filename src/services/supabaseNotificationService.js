import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function hasLoggedInUser() {
  const currentUser = getCurrentUser?.();
  return isUuid(currentUser?.id);
}

function normalizeText(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
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

  return value || "";
}

function toIsoDateOrNow(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
}

function toSupabaseNotification(notification = {}) {
  const targetUserId = notification.targetUserId || notification.userId || "";
  const targetRole = normalizeRole(
    notification.targetRole || notification.role,
  );

  return {
    local_notification_id: notification.id || "",
    title: normalizeText(notification.title, "اعلان جدید"),
    body: normalizeText(notification.body || notification.message),
    category: normalizeText(notification.category, "پیام سامانه"),
    sent_at: toIsoDateOrNow(notification.sentAt || notification.createdAt),
    target_user_id: isUuid(targetUserId) ? targetUserId : null,
    target_role: targetRole || null,
    source_type: normalizeText(notification.sourceType, "system"),
    source_id: normalizeText(notification.sourceId),
    event_key: normalizeText(notification.eventKey),
    is_read: Boolean(notification.isRead),
    is_important: Boolean(notification.isImportant),
    updated_at: new Date().toISOString(),
  };
}

function toSupabaseNotificationUpdate(notification = {}) {
  const targetUserId = notification.targetUserId || notification.userId || "";
  const targetRole = normalizeRole(
    notification.targetRole || notification.role,
  );

  return {
    title: normalizeText(notification.title, "اعلان جدید"),
    body: normalizeText(notification.body || notification.message),
    category: normalizeText(notification.category, "پیام سامانه"),
    target_user_id: isUuid(targetUserId) ? targetUserId : null,
    target_role: targetRole || null,
    source_type: normalizeText(notification.sourceType, "system"),
    source_id: normalizeText(notification.sourceId),
    event_key: normalizeText(notification.eventKey),
    is_read: Boolean(notification.isRead),
    is_important: Boolean(notification.isImportant),
    updated_at: new Date().toISOString(),
  };
}

async function updateById(id, payload) {
  const { error } = await supabase
    .from("notifications")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Supabase notification update by id failed:", error.message);
    return false;
  }

  return true;
}

async function updateByLocalNotificationId(localNotificationId, payload) {
  if (!localNotificationId) {
    return false;
  }

  const { error } = await supabase
    .from("notifications")
    .update(payload)
    .eq("local_notification_id", localNotificationId);

  if (error) {
    console.error(
      "Supabase notification update by local id failed:",
      error.message,
    );
    return false;
  }

  return true;
}

async function deleteById(id) {
  if (!isUuid(id)) {
    return false;
  }

  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) {
    console.error("Supabase notification delete by id failed:", error.message);
    return false;
  }

  return true;
}

async function deleteByLocalNotificationId(localNotificationId) {
  if (!localNotificationId) {
    return false;
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("local_notification_id", localNotificationId);

  if (error) {
    console.error(
      "Supabase notification delete by local id failed:",
      error.message,
    );
    return false;
  }

  return true;
}

export async function syncNotificationToSupabase(notification = {}) {
  if (!hasLoggedInUser()) {
    return null;
  }

  if (!notification?.id && !notification?.title && !notification?.body) {
    return null;
  }

  const { error } = await supabase
    .from("notifications")
    .insert(toSupabaseNotification(notification));

  if (error) {
    console.error("Supabase notification sync failed:", error.message);
    return null;
  }

  return true;
}

export async function syncNotificationUpdateToSupabase(notification = {}) {
  if (!hasLoggedInUser()) {
    return false;
  }

  if (!notification?.id) {
    return false;
  }

  const payload = toSupabaseNotificationUpdate(notification);

  if (isUuid(notification.id)) {
    const updatedById = await updateById(notification.id, payload);

    if (updatedById) {
      return true;
    }
  }

  return updateByLocalNotificationId(notification.id, payload);
}

export async function deleteNotificationFromSupabase(notification = {}) {
  if (!hasLoggedInUser()) {
    return false;
  }

  const notificationId =
    typeof notification === "string" || typeof notification === "number"
      ? String(notification)
      : notification?.id;

  if (!notificationId) {
    return false;
  }

  if (isUuid(notificationId)) {
    const deletedById = await deleteById(notificationId);

    if (deletedById) {
      return true;
    }
  }

  return deleteByLocalNotificationId(notificationId);
}
