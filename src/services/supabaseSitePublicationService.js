import { supabase } from "../lib/supabaseClient";

const SITE_PUBLICATION_TABLE = "site_publication_requests";

const PERSIAN_STATUS = {
  waiting_for_innovator: "در انتظار تکمیل فناور",
  submitted_to_committee: "ارسال شده برای بررسی کمیته",
  needs_revision: "نیازمند اصلاح",
  published: "منتشر شده در سایت",
  cancelled: "لغو شده",
};

const DB_STATUS = {
  "در انتظار تکمیل فناور": "waiting_for_innovator",
  "ارسال شده برای بررسی کمیته": "submitted_to_committee",
  "نیازمند اصلاح": "needs_revision",
  "منتشر شده در سایت": "published",
  "لغو شده": "cancelled",
  waiting_for_innovator: "waiting_for_innovator",
  submitted_to_committee: "submitted_to_committee",
  needs_revision: "needs_revision",
  published: "published",
  cancelled: "cancelled",
};

const PERSIAN_DESTINATION = {
  business_opportunity: "فرصت‌های همکاری",
  successful_project: "پروژه‌ها و دستاوردهای موفق",
};

const DB_DESTINATION = {
  "فرصت‌های همکاری": "business_opportunity",
  "موقعیت‌های تجاری": "business_opportunity",
  business_opportunity: "business_opportunity",
  opportunities: "business_opportunity",
  "پروژه‌ها و دستاوردهای موفق": "successful_project",
  "پروژه موفق": "successful_project",
  successful_project: "successful_project",
  successful_projects: "successful_project",
};

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function normalizeValue(value, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[،,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeObject(value) {
  return isPlainObject(value) ? value : {};
}

function toTimestamp(value) {
  const numericValue = Number(value || 0);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  const parsedValue = Date.parse(value || "");
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toDbStatus(status) {
  return DB_STATUS[normalizeValue(status)] || "waiting_for_innovator";
}

function fromDbStatus(status) {
  return PERSIAN_STATUS[normalizeValue(status)] || normalizeValue(status);
}

function toDbDestination(destination) {
  return DB_DESTINATION[normalizeValue(destination)] || "successful_project";
}

function fromDbDestination(destination) {
  return (
    PERSIAN_DESTINATION[normalizeValue(destination)] ||
    normalizeValue(destination, PERSIAN_DESTINATION.successful_project)
  );
}

function getDraft(request = {}) {
  return normalizeObject(request.draft);
}

function getPublishedPayload(request = {}) {
  return normalizeObject(request.publishedPayload || request.published_payload);
}

function getDisplayGroups(request = {}) {
  return normalizeArray(request.displayGroups || request.display_groups);
}

function getRequestId(request = {}) {
  return normalizeValue(
    request.supabaseId || request.supabase_id || request.id,
  );
}

function buildMetadata(request = {}) {
  return {
    localId: isUuid(request.id) ? "" : normalizeValue(request.id),
    planTitle: normalizeValue(request.planTitle || request.title),
    field: normalizeValue(request.field),
    callTitle: normalizeValue(request.callTitle || request.call),
    finalStatus: normalizeValue(request.finalStatus),
    committeeNote: normalizeValue(request.committeeNote),
    innovatorName: normalizeValue(request.innovatorName),
    innovatorOrganization: normalizeValue(request.innovatorOrganization),
    notificationSent: Boolean(request.notificationSent),
    isVisibleToInnovator: request.isVisibleToInnovator !== false,
    isSitePublicationCandidate: request.isSitePublicationCandidate !== false,
    createdAt: normalizeValue(request.createdAt),
    updatedAt: normalizeValue(request.updatedAt),
    publishedAt: normalizeValue(request.publishedAt),
    createdAtTimestamp: Number(request.createdAtTimestamp || 0),
    updatedAtTimestamp: Number(request.updatedAtTimestamp || 0),
    publishedAtTimestamp: Number(request.publishedAtTimestamp || 0),
  };
}

function removeUndefinedValues(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.warn(
      "Supabase site publication profile lookup failed:",
      profileError.message,
    );
    return { id: user.id, role: "" };
  }

  return profile || { id: user.id, role: "" };
}

function isCommitteeRole(role) {
  return ["committee", "committee_secretariat", "admin", "support"].includes(
    String(role || "").trim(),
  );
}

function buildDbPayload(request = {}, action = "upsert", currentUserId = "") {
  const planId = normalizeValue(request.planId || request.plan_id);
  const innovatorId = normalizeValue(
    request.innovatorId || request.innovator_id,
  );

  if (!isUuid(planId) || !isUuid(innovatorId)) {
    return null;
  }

  const draft = getDraft(request);
  const status = toDbStatus(request.status);
  const destination = toDbDestination(request.destination);
  const publishedPayload =
    status === "published"
      ? {
          ...getPublishedPayload(request),
          draft,
          displayGroups: getDisplayGroups(request),
        }
      : getPublishedPayload(request);

  const nowIso = new Date().toISOString();
  const requestId = getRequestId(request);
  const canUseRequestId = isUuid(requestId);

  const payload = {
    plan_id: planId,
    innovator_id: innovatorId,
    destination,
    publication_type: normalizeValue(
      request.publicationType || request.publication_type,
    ),
    status,
    title: normalizeValue(
      request.planTitle || request.title || draft.title,
      "طرح فناورانه",
    ),
    summary: normalizeValue(
      draft.summary || request.summary || request.committeeNote,
    ),
    tracking_code: normalizeValue(
      request.trackingCode || request.tracking_code,
    ),
    draft,
    published_payload: publishedPayload,
    display_groups: getDisplayGroups(request),
    committee_feedback: normalizeValue(
      request.committeeFeedback || request.committee_feedback,
    ),
    metadata: buildMetadata(request),
  };

  if (canUseRequestId) {
    payload.id = requestId;
  }

  if (isUuid(currentUserId) && action === "upsertCandidate") {
    payload.created_by = currentUserId;
  }

  if (isUuid(currentUserId) && action === "submit") {
    payload.submitted_by = currentUserId;
    payload.submitted_at = nowIso;
  }

  if (isUuid(currentUserId) && ["return", "publish"].includes(action)) {
    payload.reviewed_by = currentUserId;
    payload.reviewed_at = nowIso;
  }

  if (status === "submitted_to_committee" && !request.submittedAt) {
    payload.submitted_at = payload.submitted_at || nowIso;
  }

  if (status === "needs_revision") {
    payload.returned_at = nowIso;
  }

  if (status === "published") {
    payload.published_at =
      request.publishedAtIso || request.published_at || nowIso;
  }

  return removeUndefinedValues(payload);
}

export function mapSitePublicationRowToLocalRequest(row = {}) {
  const metadata = normalizeObject(row.metadata);
  const draft = normalizeObject(row.draft);
  const publishedPayload = normalizeObject(row.published_payload);
  const destination = fromDbDestination(row.destination);
  const status = fromDbStatus(row.status);

  return {
    id: row.id,
    supabaseId: row.id,
    planId: row.plan_id || "",
    trackingCode: row.tracking_code || metadata.trackingCode || "",
    planTitle: row.title || metadata.planTitle || "طرح فناورانه",
    title: row.title || metadata.planTitle || "طرح فناورانه",
    field: draft.field || metadata.field || "",
    callTitle: metadata.callTitle || "",
    finalStatus: metadata.finalStatus || "",
    committeeNote: metadata.committeeNote || row.summary || "",
    innovatorId: row.innovator_id || "",
    innovatorName: metadata.innovatorName || "فناور طرح",
    innovatorOrganization: metadata.innovatorOrganization || "",
    status,
    destination,
    publicationType: row.publication_type || metadata.publicationType || "",
    displayGroups: normalizeArray(
      row.display_groups || publishedPayload.displayGroups,
    ),
    draft,
    publishedPayload,
    committeeFeedback: row.committee_feedback || "",
    publishedAt: metadata.publishedAt || row.published_at || "",
    publishedAtTimestamp:
      Number(metadata.publishedAtTimestamp || 0) ||
      toTimestamp(row.published_at),
    createdAt: metadata.createdAt || row.created_at || "",
    createdAtTimestamp:
      Number(metadata.createdAtTimestamp || 0) || toTimestamp(row.created_at),
    updatedAt: metadata.updatedAt || row.updated_at || "",
    updatedAtTimestamp:
      Number(metadata.updatedAtTimestamp || 0) || toTimestamp(row.updated_at),
    submittedAt: row.submitted_at || "",
    reviewedAt: row.reviewed_at || "",
    returnedAt: row.returned_at || "",
    notificationSent: Boolean(metadata.notificationSent),
    isVisibleToInnovator: metadata.isVisibleToInnovator !== false,
    isSitePublicationCandidate: metadata.isSitePublicationCandidate !== false,
  };
}

export async function fetchSitePublicationRequestsFromSupabase() {
  const { data, error } = await supabase
    .from(SITE_PUBLICATION_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Supabase site publication fetch failed:", error.message);
    return [];
  }

  return Array.isArray(data)
    ? data.map(mapSitePublicationRowToLocalRequest)
    : [];
}

export async function syncSitePublicationRequestToSupabase(
  request = {},
  action = "upsert",
) {
  const currentProfile = await getCurrentProfile();
  const payload = buildDbPayload(request, action, currentProfile?.id || "");

  if (!payload) {
    return null;
  }

  const shouldUpsert =
    action === "upsertCandidate" || isCommitteeRole(currentProfile?.role);

  if (shouldUpsert) {
    const { data, error } = await supabase
      .from(SITE_PUBLICATION_TABLE)
      .upsert(payload, { onConflict: "plan_id,destination" })
      .select("*")
      .maybeSingle();

    if (error) {
      console.warn("Supabase site publication upsert failed:", error.message);
      return null;
    }

    return data ? mapSitePublicationRowToLocalRequest(data) : null;
  }

  const requestId = getRequestId(request);
  let query = supabase.from(SITE_PUBLICATION_TABLE).update(payload);

  if (isUuid(requestId)) {
    query = query.eq("id", requestId);
  } else {
    query = query
      .eq("plan_id", payload.plan_id)
      .eq("destination", payload.destination);
  }

  const { data, error } = await query.select("*").maybeSingle();

  if (error) {
    console.warn("Supabase site publication update failed:", error.message);
    return null;
  }

  return data ? mapSitePublicationRowToLocalRequest(data) : null;
}

export async function deleteSitePublicationRequestFromSupabase(request = {}) {
  const currentProfile = await getCurrentProfile();

  if (!isCommitteeRole(currentProfile?.role)) {
    return false;
  }

  const requestId = getRequestId(request);
  const planId = normalizeValue(request.planId || request.plan_id);
  const destination = toDbDestination(request.destination);

  let query = supabase.from(SITE_PUBLICATION_TABLE).delete();

  if (isUuid(requestId)) {
    query = query.eq("id", requestId);
  } else if (isUuid(planId)) {
    query = query.eq("plan_id", planId).eq("destination", destination);
  } else {
    return false;
  }

  const { error } = await query;

  if (error) {
    console.warn("Supabase site publication delete failed:", error.message);
    return false;
  }

  return true;
}
