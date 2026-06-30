import {
  buildEqFilter,
  getActiveSupabaseUserId,
  supabaseRestRequest,
} from "./supabaseRestSessionService";
import { getCurrentUser } from "./authService";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
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

function toIsoDateOrNull(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  return new Date().toISOString();
}

function removeUndefinedFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

function getUserDisplayName(user = {}) {
  return (
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.name ||
    "مدرس هاتف"
  );
}

async function getAuthenticatedUserId() {
  const activeUserId = await getActiveSupabaseUserId();

  if (isUuid(activeUserId)) {
    return activeUserId;
  }

  const currentUser = getCurrentUser?.();

  if (isUuid(currentUser?.id)) {
    return currentUser.id;
  }

  if (isUuid(currentUser?.userId)) {
    return currentUser.userId;
  }

  return "";
}

function toSupabaseOrder(order = {}, authenticatedUserId = "", options = {}) {
  const currentUser = getCurrentUser?.();
  const status = normalizeCommitteeStatus(order.status);

  const acceptedById = isUuid(order.acceptedById)
    ? order.acceptedById
    : status === "قبول شده"
      ? authenticatedUserId
      : null;

  const payload = {
    local_order_id: order.id || order.localOrderId || "",
    title: order.title || "سفارش اجرای دوره یا رویداد",
    summary: order.summary || "",
    description: order.description || order.summary || "",
    subject: order.subject || "",
    category: order.category || order.subject || "",
    deadline_date: order.deadlineDate || "",
    deadline_time: order.deadlineTime || "",
    deadline: order.deadline || "",
    status,
    accepted_by_id: acceptedById || null,
    accepted_by_name:
      order.acceptedBy ||
      order.acceptedByName ||
      (status === "قبول شده" ? getUserDisplayName(currentUser) : ""),
    accepted_at: order.acceptedAt ? toIsoDateOrNull(order.acceptedAt) : null,
    completed_at: order.completedAt ? toIsoDateOrNull(order.completedAt) : null,
    payload: {
      ...order,
      status,
      acceptedById: acceptedById || order.acceptedById || "",
    },
    updated_at: new Date().toISOString(),
  };

  if (options.forInsert) {
    payload.created_by = isUuid(order.createdBy)
      ? order.createdBy
      : authenticatedUserId || null;
    payload.created_at =
      toIsoDateOrNull(order.createdAt) || new Date().toISOString();
  } else if (isUuid(order.createdBy)) {
    payload.created_by = order.createdBy;
  }

  return removeUndefinedFields(payload);
}

async function findOrderRow(order = {}) {
  const localOrderId = order.id || order.localOrderId || "";
  const supabaseId = order.supabaseId || order.supabase_id || "";

  if (isUuid(supabaseId)) {
    const { data, error } = await supabaseRestRequest("execution_orders", {
      method: "GET",
      query: `?select=id&${buildEqFilter("id", supabaseId)}`,
      prefer: "",
    });

    if (error) {
      console.warn("Supabase execution order lookup failed:", error.message);
      return null;
    }

    return Array.isArray(data) ? data[0] || null : null;
  }

  if (!localOrderId) {
    return null;
  }

  const { data, error } = await supabaseRestRequest("execution_orders", {
    method: "GET",
    query: `?select=id&${buildEqFilter("local_order_id", localOrderId)}`,
    prefer: "",
  });

  if (error) {
    console.warn("Supabase execution order lookup failed:", error.message);
    return null;
  }

  return Array.isArray(data) ? data[0] || null : null;
}

export async function syncExecutionOrderToSupabase(order = {}) {
  const authenticatedUserId = await getAuthenticatedUserId();

  if (!authenticatedUserId) {
    console.warn(
      "Supabase execution order sync skipped: authenticated user id was not found.",
    );
    return null;
  }

  if (!order?.id || !order?.title) {
    return null;
  }

  const existingRow = await findOrderRow(order);

  if (existingRow?.id) {
    const { error } = await supabaseRestRequest("execution_orders", {
      method: "PATCH",
      query: `?${buildEqFilter("id", existingRow.id)}`,
      body: toSupabaseOrder(order, authenticatedUserId),
      prefer: "return=minimal",
    });

    if (error) {
      console.warn("Supabase execution order update failed:", error.message);
      return null;
    }

    return existingRow.id;
  }

  const { error } = await supabaseRestRequest("execution_orders", {
    method: "POST",
    body: toSupabaseOrder(order, authenticatedUserId, { forInsert: true }),
    prefer: "return=minimal",
  });

  if (error) {
    console.warn("Supabase execution order insert failed:", error.message);
    return null;
  }

  return true;
}

export async function syncExecutionOrderUpdateToSupabase(order = {}) {
  return syncExecutionOrderToSupabase(order);
}

export async function debugGetSupabaseExecutionOrderAuthId() {
  return getAuthenticatedUserId();
}
