import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeParseJson(value, fallbackValue = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function findSessionInsideValue(value, depth = 0) {
  if (!value || typeof value !== "object" || depth > 6) {
    return null;
  }

  if (value.access_token && value.refresh_token && isUuid(value.user?.id)) {
    return value;
  }

  const knownContainers = [
    value.currentSession,
    value.session,
    value.data?.session,
    value.value,
  ];

  for (const candidate of knownContainers) {
    const session = findSessionInsideValue(candidate, depth + 1);

    if (session) {
      return session;
    }
  }

  for (const item of Object.values(value)) {
    if (item && typeof item === "object") {
      const session = findSessionInsideValue(item, depth + 1);

      if (session) {
        return session;
      }
    }
  }

  return null;
}

function getStoredSupabaseSession() {
  if (!canUseStorage()) {
    return null;
  }

  const storageKeys = Object.keys(window.localStorage).filter(
    (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
  );

  for (const key of storageKeys) {
    const parsedValue = safeParseJson(window.localStorage.getItem(key));
    const session = findSessionInsideValue(parsedValue);

    if (session) {
      return session;
    }
  }

  return null;
}

async function getAuthenticatedUserId() {
  const currentUser = getCurrentUser?.();

  if (isUuid(currentUser?.id)) {
    return currentUser.id;
  }

  if (isUuid(currentUser?.userId)) {
    return currentUser.userId;
  }

  const sessionResult = await supabase.auth.getSession();

  if (isUuid(sessionResult?.data?.session?.user?.id)) {
    return sessionResult.data.session.user.id;
  }

  const userResult = await supabase.auth.getUser();

  if (isUuid(userResult?.data?.user?.id)) {
    return userResult.data.user.id;
  }

  const storedSession = getStoredSupabaseSession();

  if (storedSession?.access_token && storedSession?.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: storedSession.access_token,
      refresh_token: storedSession.refresh_token,
    });

    if (error) {
      console.warn(
        "Supabase instructor session restore failed:",
        error.message,
      );
    }

    if (isUuid(data?.session?.user?.id)) {
      return data.session.user.id;
    }

    if (isUuid(storedSession?.user?.id)) {
      return storedSession.user.id;
    }
  }

  return "";
}

function normalizeActivityType(type) {
  return type === "event" ? "event" : "course";
}

function normalizeActivityStatus(status) {
  const statusMap = {
    pending: "در انتظار تایید",
    awaiting: "در انتظار تایید",
    waiting: "در انتظار تایید",
    "در انتظار بررسی": "در انتظار تایید",
    "در انتظار تایید": "در انتظار تایید",
    published: "منتشر شده",
    "منتشر شده": "منتشر شده",
    rejected: "رد شده",
    "رد شده": "رد شده",
    needsRevision: "نیازمند اصلاح",
    needs_revision: "نیازمند اصلاح",
    "نیازمند اصلاح": "نیازمند اصلاح",
  };

  return statusMap[status] || "در انتظار تایید";
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

function getInstructorId(activity = {}, authenticatedUserId = "") {
  if (isUuid(activity.instructorId)) {
    return activity.instructorId;
  }

  if (isUuid(activity.createdBy)) {
    return activity.createdBy;
  }

  return authenticatedUserId;
}

function toSupabaseActivity(
  activity = {},
  authenticatedUserId = "",
  options = {},
) {
  const instructorId = getInstructorId(activity, authenticatedUserId);
  const status = normalizeActivityStatus(activity.status);
  const activityType = normalizeActivityType(activity.type);

  const payload = {
    local_activity_id: activity.id || activity.localActivityId || "",
    instructor_id: instructorId || undefined,
    instructor_name: activity.instructorName || "مدرس هاتف",
    type: activityType,
    title:
      activity.title ||
      (activityType === "event" ? "رویداد آموزشی" : "دوره آموزشی"),
    summary: activity.summary || "",
    image: activity.image || "",
    status,
    secondary_status: activity.secondaryStatus || "",
    status_feedback: activity.statusFeedback || activity.feedback || "",
    reviewed_at: activity.reviewedAt
      ? toIsoDateOrNull(activity.reviewedAt)
      : null,
    published_at: activity.publishedAt
      ? toIsoDateOrNull(activity.publishedAt)
      : null,
    revision_round: Number(activity.revisionRound || 0),
    payload: {
      ...activity,
      instructorId,
      type: activityType,
      status,
    },
    updated_at: new Date().toISOString(),
  };

  if (options.forInsert) {
    payload.created_at =
      toIsoDateOrNull(activity.createdAt) || new Date().toISOString();
  }

  return removeUndefinedFields(payload);
}

async function findActivityRow(activity = {}) {
  const localActivityId = activity.id || activity.localActivityId || "";
  const supabaseId = activity.supabaseId || activity.supabase_id || "";

  if (isUuid(supabaseId)) {
    const { data, error } = await supabase
      .from("instructor_activities")
      .select("id")
      .eq("id", supabaseId)
      .maybeSingle();

    if (error) {
      console.warn(
        "Supabase instructor activity lookup failed:",
        error.message,
      );
      return null;
    }

    return data;
  }

  if (!localActivityId) {
    return null;
  }

  const { data, error } = await supabase
    .from("instructor_activities")
    .select("id")
    .eq("local_activity_id", localActivityId)
    .maybeSingle();

  if (error) {
    console.warn("Supabase instructor activity lookup failed:", error.message);
    return null;
  }

  return data;
}

export async function syncInstructorActivityToSupabase(activity = {}) {
  const authenticatedUserId = await getAuthenticatedUserId();

  if (!authenticatedUserId) {
    console.warn(
      "Supabase instructor activity insert skipped: authenticated user id was not found.",
    );
    return null;
  }

  const existingRow = await findActivityRow(activity);

  if (existingRow?.id) {
    const { error } = await supabase
      .from("instructor_activities")
      .update(toSupabaseActivity(activity, authenticatedUserId))
      .eq("id", existingRow.id);

    if (error) {
      console.warn(
        "Supabase instructor activity update failed:",
        error.message,
      );
      return null;
    }

    return existingRow.id;
  }

  const { data, error } = await supabase
    .from("instructor_activities")
    .insert(
      toSupabaseActivity(activity, authenticatedUserId, {
        forInsert: true,
      }),
    )
    .select("id")
    .single();

  if (error) {
    console.warn("Supabase instructor activity insert failed:", error.message);
    return null;
  }

  return data?.id || true;
}

export async function syncInstructorActivityUpdateToSupabase(activity = {}) {
  return syncInstructorActivityToSupabase(activity);
}

export async function deleteInstructorActivityFromSupabase(activityOrId = {}) {
  const authenticatedUserId = await getAuthenticatedUserId();

  if (!authenticatedUserId) {
    console.warn(
      "Supabase instructor activity delete skipped: authenticated user id was not found.",
    );
    return false;
  }

  const activity =
    typeof activityOrId === "string" ? { id: activityOrId } : activityOrId;

  const existingRow = await findActivityRow(activity);

  if (!existingRow?.id) {
    return false;
  }

  const { error } = await supabase
    .from("instructor_activities")
    .delete()
    .eq("id", existingRow.id);

  if (error) {
    console.warn("Supabase instructor activity delete failed:", error.message);
    return false;
  }

  return true;
}

export async function debugGetSupabaseInstructorAuthId() {
  return getAuthenticatedUserId();
}

export async function debugGetSupabaseInstructorAuthDetails() {
  const currentUser = getCurrentUser?.();
  const sessionResult = await supabase.auth.getSession();
  const userResult = await supabase.auth.getUser();
  const storedSession = getStoredSupabaseSession();

  return {
    currentUserId: currentUser?.id || "",
    currentUserEmail: currentUser?.email || "",
    sessionUserId: sessionResult?.data?.session?.user?.id || "",
    sessionEmail: sessionResult?.data?.session?.user?.email || "",
    authUserId: userResult?.data?.user?.id || "",
    authEmail: userResult?.data?.user?.email || "",
    storedSessionUserId: storedSession?.user?.id || "",
    storedSessionEmail: storedSession?.user?.email || "",
    resolvedUserId: await getAuthenticatedUserId(),
  };
}
