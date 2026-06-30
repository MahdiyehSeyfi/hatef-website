import {
  buildEqFilter,
  getActiveSupabaseUserId,
  supabaseRestRequest,
} from "./supabaseRestSessionService";

function normalizeValue(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function normalizeMode(mode) {
  return mode === "targeted" ? "targeted" : "broadcast";
}

function normalizeActivityType(type) {
  return ["course", "event", "all"].includes(type) ? type : "all";
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

function normalizeTargetActivityIds(notice = {}) {
  if (Array.isArray(notice.targetActivityIds)) {
    return notice.targetActivityIds.map(String).filter(Boolean);
  }

  if (notice.activityId) {
    return [String(notice.activityId)];
  }

  return [];
}

function toSupabaseNotice(notice = {}, authenticatedUserId = "") {
  const mode = normalizeMode(notice.mode);
  const targetActivityIds = normalizeTargetActivityIds(notice);

  return removeUndefinedFields({
    local_notice_id: notice.id || notice.localNoticeId || "",
    sender_user_id: authenticatedUserId || undefined,
    mode,
    title: normalizeValue(notice.title, "اطلاعیه مدرس"),
    message: normalizeValue(notice.message || notice.body),
    target: notice.target || "شرکت‌کنندگان برنامه",
    recipients: Number(notice.recipients || 0),
    target_activity_ids: targetActivityIds,
    activity_id: notice.activityId || targetActivityIds[0] || "",
    activity_type: normalizeActivityType(notice.activityType),
    payload: {
      ...notice,
      senderUserId: authenticatedUserId || notice.senderUserId || "",
      targetActivityIds,
      mode,
    },
    sent_at: toIsoDateOrNow(notice.sentAt),
    updated_at: new Date().toISOString(),
  });
}

async function findNoticeRow(notice = {}) {
  const localNoticeId = notice.id || notice.localNoticeId || "";

  if (!localNoticeId) {
    return null;
  }

  const { data, error } = await supabaseRestRequest(
    "activity_participant_notices",
    {
      method: "GET",
      query: `?select=id&${buildEqFilter("local_notice_id", localNoticeId)}`,
      prefer: "",
    },
  );

  if (error) {
    console.warn("Supabase participant notice lookup failed:", error.message);
    return null;
  }

  return Array.isArray(data) ? data[0] || null : null;
}

export async function syncActivityParticipantNoticeToSupabase(notice = {}) {
  const authenticatedUserId = await getActiveSupabaseUserId();

  if (!authenticatedUserId) {
    console.warn(
      "Supabase participant notice insert skipped: auth token user id was not found.",
    );
    return null;
  }

  const payload = toSupabaseNotice(notice, authenticatedUserId);

  if (!payload.title || !payload.message) {
    return null;
  }

  const existingRow = await findNoticeRow(notice);

  if (existingRow?.id) {
    const { data, error } = await supabaseRestRequest(
      "activity_participant_notices",
      {
        method: "PATCH",
        query: `?${buildEqFilter("id", existingRow.id)}`,
        body: payload,
      },
    );

    if (error) {
      console.warn("Supabase participant notice update failed:", error.message);
      return null;
    }

    return Array.isArray(data) ? data[0]?.id || existingRow.id : existingRow.id;
  }

  const { data, error } = await supabaseRestRequest(
    "activity_participant_notices",
    {
      method: "POST",
      body: payload,
    },
  );

  if (error) {
    console.warn("Supabase participant notice insert failed:", error.message);
    return null;
  }

  return Array.isArray(data) ? data[0]?.id || true : true;
}
