import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

const ID_MAP_STORAGE_KEY = "hatef_supabase_id_map";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function readIdMap() {
  if (!canUseStorage()) {
    return {};
  }

  const storedValue = window.localStorage.getItem(ID_MAP_STORAGE_KEY);

  if (!storedValue) {
    return {};
  }

  const parsedValue = safeParseJson(storedValue, {});
  return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
}

function writeIdMap(idMap) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ID_MAP_STORAGE_KEY, JSON.stringify(idMap || {}));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function getMappedRequestId(localRequestId) {
  const rawId = String(localRequestId || "").trim();

  if (!rawId) {
    return "";
  }

  if (isUuid(rawId)) {
    return rawId;
  }

  const idMap = readIdMap();
  return idMap[`business-request:${rawId}`] || "";
}

function saveMappedRequestId(localRequestId, supabaseRequestId) {
  const rawLocalId = String(localRequestId || "").trim();
  const rawSupabaseId = String(supabaseRequestId || "").trim();

  if (!rawLocalId || !rawSupabaseId) {
    return;
  }

  const idMap = readIdMap();

  writeIdMap({
    ...idMap,
    [`business-request:${rawLocalId}`]: rawSupabaseId,
  });
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeRequestStatus(status) {
  const statusMap = {
    "در انتظار پیگیری": "در انتظار پیگیری",
    "در حال پیگیری": "در حال پیگیری",
    "نیازمند تکمیل اطلاعات": "نیازمند تکمیل اطلاعات",
    "پاسخ داده شده": "پاسخ داده شده",
    waiting: "در انتظار پیگیری",
    tracking: "در حال پیگیری",
    needs_info: "نیازمند تکمیل اطلاعات",
    needs_revision: "نیازمند تکمیل اطلاعات",
    answered: "پاسخ داده شده",
    final_answered: "پاسخ داده شده",
  };

  return statusMap[status] || "در انتظار پیگیری";
}

function toSupabaseBusinessRequest(request = {}) {
  const currentUser = getCurrentUser?.();

  return {
    local_request_id: request.id || "",
    partner_id: currentUser?.id || request.partnerId || null,
    partner_user_id: currentUser?.id || request.partnerUserId || null,
    opportunity_id: isUuid(request.opportunityId)
      ? request.opportunityId
      : null,
    title: request.title || "درخواست همکاری تجاری",
    opportunity_title: request.opportunityTitle || "",
    opportunity_field: request.opportunityField || "",
    collaboration_type: request.collaborationType || "همکاری تجاری",
    message: request.message || "",
    status: normalizeRequestStatus(request.status),
    support_reply: request.supportReply || "",
    revision_round: Number(request.revisionRound || 0),
    updated_at: new Date().toISOString(),
  };
}

function toSupabaseBusinessRequestUpdate(request = {}) {
  const hasReply = Boolean(normalizeText(request.supportReply));

  return {
    local_request_id: request.id || "",
    title: request.title || "درخواست همکاری تجاری",
    opportunity_title: request.opportunityTitle || "",
    opportunity_field: request.opportunityField || "",
    collaboration_type: request.collaborationType || "همکاری تجاری",
    message: request.message || "",
    status: normalizeRequestStatus(request.status),
    support_reply: request.supportReply || "",
    replied_at: hasReply ? new Date().toISOString() : null,
    revision_round: Number(request.revisionRound || 0),
    updated_at: new Date().toISOString(),
  };
}

async function updateById(id, payload, localRequestId = "") {
  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .update(payload)
    .eq("id", id)
    .select("*");

  if (error) {
    console.error(
      "Supabase business request update by id failed:",
      error.message,
    );
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    saveMappedRequestId(localRequestId, data[0].id);
    return data[0];
  }

  return null;
}

async function updateByLocalRequestId(localRequestId, payload) {
  if (!localRequestId) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .update(payload)
    .eq("local_request_id", localRequestId)
    .select("*");

  if (error) {
    console.error(
      "Supabase business request update by local id failed:",
      error.message,
    );
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    saveMappedRequestId(localRequestId, data[0].id);
    return data[0];
  }

  return null;
}

async function updateByOpportunityId(
  opportunityId,
  payload,
  localRequestId = "",
) {
  if (!isUuid(opportunityId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .update(payload)
    .eq("opportunity_id", opportunityId)
    .select("*");

  if (error) {
    console.error(
      "Supabase business request update by opportunity id failed:",
      error.message,
    );
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    saveMappedRequestId(localRequestId, data[0].id);
    return data[0];
  }

  return null;
}

async function updateByTitleAndOpportunityTitle(request, payload) {
  const title = normalizeText(request.title);
  const opportunityTitle = normalizeText(request.opportunityTitle);

  if (!title || !opportunityTitle) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .update(payload)
    .eq("title", title)
    .eq("opportunity_title", opportunityTitle)
    .select("*");

  if (error) {
    console.error(
      "Supabase business request update by title and opportunity failed:",
      error.message,
    );
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    saveMappedRequestId(request.id, data[0].id);
    return data[0];
  }

  return null;
}

async function updateByTitleOnly(request, payload) {
  const title = normalizeText(request.title);

  if (!title) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .update(payload)
    .eq("title", title)
    .select("*");

  if (error) {
    console.error(
      "Supabase business request update by title only failed:",
      error.message,
    );
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    saveMappedRequestId(request.id, data[0].id);
    return data[0];
  }

  return null;
}

export async function syncBusinessCollaborationRequestToSupabase(request = {}) {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id || !request?.opportunityId) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .insert(toSupabaseBusinessRequest(request))
    .select("*")
    .single();

  if (error) {
    console.error("Supabase business request sync failed:", error.message);
    return null;
  }

  saveMappedRequestId(request.id, data.id);

  return data;
}

export async function syncBusinessCollaborationRequestUpdateToSupabase(
  request = {},
) {
  if (!request?.id) {
    return null;
  }

  const payload = toSupabaseBusinessRequestUpdate(request);
  const mappedId = getMappedRequestId(request.id);

  if (mappedId) {
    const updatedByMappedId = await updateById(mappedId, payload, request.id);

    if (updatedByMappedId) {
      return updatedByMappedId;
    }
  }

  if (isUuid(request.id)) {
    const updatedById = await updateById(request.id, payload, request.id);

    if (updatedById) {
      return updatedById;
    }
  }

  const updatedByLocalId = await updateByLocalRequestId(request.id, payload);

  if (updatedByLocalId) {
    return updatedByLocalId;
  }

  const updatedByOpportunityId = await updateByOpportunityId(
    request.opportunityId,
    payload,
    request.id,
  );

  if (updatedByOpportunityId) {
    return updatedByOpportunityId;
  }

  const updatedByTitleAndOpportunity = await updateByTitleAndOpportunityTitle(
    request,
    payload,
  );

  if (updatedByTitleAndOpportunity) {
    return updatedByTitleAndOpportunity;
  }

  const updatedByTitle = await updateByTitleOnly(request, payload);

  if (updatedByTitle) {
    return updatedByTitle;
  }

  console.error(
    "Supabase business request update failed: no matching row",
    request,
  );

  return null;
}
