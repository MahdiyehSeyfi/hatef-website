import {
  buildEqFilter,
  getActiveSupabaseUserId,
  supabaseRestRequest,
} from "./supabaseRestSessionService";

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function normalizeActivityType(type) {
  return type === "event" ? "event" : "course";
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

function removeUndefinedFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

function toSupabaseRegistration(registration = {}, authenticatedUserId = "") {
  const activityId = normalizeValue(registration.activityId);
  const activityType = normalizeActivityType(registration.activityType);

  return removeUndefinedFields({
    local_registration_id:
      registration.id || registration.localRegistrationId || "",
    activity_id: activityId,
    activity_type: activityType,
    activity_title: registration.activityTitle || "برنامه آموزشی",
    instructor_id: registration.instructorId || "",
    user_id: authenticatedUserId || undefined,
    role: registration.role || "guest",
    role_label: registration.roleLabel || "",
    full_name: registration.fullName || registration.name || "",
    email: registration.email || "",
    mobile: registration.mobile || registration.phone || "",
    organization: registration.organization || "",
    note: registration.note || "",
    registered_at: toIsoDateOrNow(registration.registeredAt),
    payload: {
      ...registration,
      userId: authenticatedUserId || registration.userId || "",
      activityId,
      activityType,
    },
    updated_at: new Date().toISOString(),
  });
}

async function findRegistrationRow(registration = {}) {
  const localRegistrationId =
    registration.id || registration.localRegistrationId || "";

  if (!localRegistrationId) {
    return null;
  }

  const { data, error } = await supabaseRestRequest("activity_registrations", {
    method: "GET",
    query: `?select=id&${buildEqFilter(
      "local_registration_id",
      localRegistrationId,
    )}`,
    prefer: "",
  });

  if (error) {
    console.warn(
      "Supabase activity registration lookup failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) ? data[0] || null : null;
}

export async function syncActivityRegistrationToSupabase(registration = {}) {
  const authenticatedUserId = await getActiveSupabaseUserId();

  if (!authenticatedUserId) {
    console.warn(
      "Supabase activity registration insert skipped: auth token user id was not found.",
    );
    return null;
  }

  const payload = toSupabaseRegistration(registration, authenticatedUserId);

  if (!payload.activity_id) {
    return null;
  }

  const existingRow = await findRegistrationRow(registration);

  if (existingRow?.id) {
    const { data, error } = await supabaseRestRequest(
      "activity_registrations",
      {
        method: "PATCH",
        query: `?${buildEqFilter("id", existingRow.id)}`,
        body: payload,
      },
    );

    if (error) {
      console.warn(
        "Supabase activity registration update failed:",
        error.message,
      );
      return null;
    }

    return Array.isArray(data) ? data[0]?.id || existingRow.id : existingRow.id;
  }

  const { data, error } = await supabaseRestRequest("activity_registrations", {
    method: "POST",
    body: payload,
  });

  if (error) {
    console.warn(
      "Supabase activity registration insert failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) ? data[0]?.id || true : true;
}
