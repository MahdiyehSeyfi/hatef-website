import { supabase } from "../lib/supabaseClient";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function normalizeText(value, fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function normalizeStatus(status) {
  const statusMap = {
    جدید: "جدید",
    "در حال پیگیری": "در حال پیگیری",
    "پاسخ داده شده": "پاسخ داده شده",
    new: "جدید",
    tracking: "در حال پیگیری",
    answered: "پاسخ داده شده",
  };

  return statusMap[status] || "جدید";
}

function toIsoDateOrNull(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

function toSupabaseContactRequest(request = {}) {
  return {
    local_request_id: request.id || "",
    request_number: request.requestNumber || "",
    full_name: normalizeText(request.fullName || request.name, "کاربر سایت"),
    email: normalizeText(request.email),
    phone: normalizeText(request.phone || request.mobile),
    subject: normalizeText(request.subject, "درخواست تماس"),
    message: normalizeText(request.message),
    source_type: normalizeText(request.sourceType, "contact"),
    source_title: normalizeText(request.sourceTitle, "فرم تماس سایت"),
    related_id: normalizeText(request.relatedId),
    related_title: normalizeText(request.relatedTitle),
    page_url: normalizeText(request.pageUrl),
    page_path: normalizeText(request.pagePath),
    status: normalizeStatus(request.status),
    reply: normalizeText(request.reply),
    reply_by: normalizeText(request.replyBy),
    replied_at: toIsoDateOrNull(request.repliedAt),
    origin: normalizeText(request.origin, "guest-site-contact-form"),
    is_guest_request: request.isGuestRequest !== false,
    updated_at: new Date().toISOString(),
  };
}

function toSupabaseContactRequestUpdate(request = {}) {
  const hasReply = Boolean(normalizeText(request.reply));

  return {
    request_number: request.requestNumber || "",
    full_name: normalizeText(request.fullName || request.name, "کاربر سایت"),
    email: normalizeText(request.email),
    phone: normalizeText(request.phone || request.mobile),
    subject: normalizeText(request.subject, "درخواست تماس"),
    message: normalizeText(request.message),
    source_type: normalizeText(request.sourceType, "contact"),
    source_title: normalizeText(request.sourceTitle, "فرم تماس سایت"),
    related_id: normalizeText(request.relatedId),
    related_title: normalizeText(request.relatedTitle),
    page_url: normalizeText(request.pageUrl),
    page_path: normalizeText(request.pagePath),
    status: normalizeStatus(request.status),
    reply: normalizeText(request.reply),
    reply_by: normalizeText(request.replyBy),
    replied_at: hasReply ? new Date().toISOString() : null,
    origin: normalizeText(request.origin, "guest-site-contact-form"),
    is_guest_request: request.isGuestRequest !== false,
    updated_at: new Date().toISOString(),
  };
}

async function updateById(id, payload) {
  const { data, error } = await supabase
    .from("contact_requests")
    .update(payload)
    .eq("id", id)
    .select("*");

  if (error) {
    console.error(
      "Supabase contact request update by id failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) && data[0] ? data[0] : null;
}

async function updateByLocalRequestId(localRequestId, payload) {
  if (!localRequestId) {
    return null;
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .update(payload)
    .eq("local_request_id", localRequestId)
    .select("*");

  if (error) {
    console.error(
      "Supabase contact request update by local id failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) && data[0] ? data[0] : null;
}

async function updateByRequestNumber(requestNumber, payload) {
  if (!requestNumber) {
    return null;
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .update(payload)
    .eq("request_number", requestNumber)
    .select("*");

  if (error) {
    console.error(
      "Supabase contact request update by request number failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) && data[0] ? data[0] : null;
}

async function deleteByLocalRequestId(localRequestId) {
  if (!localRequestId) {
    return false;
  }

  const { error } = await supabase
    .from("contact_requests")
    .delete()
    .eq("local_request_id", localRequestId);

  if (error) {
    console.error(
      "Supabase contact request delete by local id failed:",
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

  const { error } = await supabase
    .from("contact_requests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Supabase contact request delete by id failed:",
      error.message,
    );
    return false;
  }

  return true;
}

export async function syncContactRequestToSupabase(request = {}) {
  if (!request?.id && !request?.message && !request?.subject) {
    return null;
  }

  const { error } = await supabase
    .from("contact_requests")
    .insert(toSupabaseContactRequest(request));

  if (error) {
    console.error("Supabase contact request sync failed:", error.message);
    return null;
  }

  return true;
}

export async function syncContactRequestUpdateToSupabase(request = {}) {
  if (!request?.id) {
    return null;
  }

  const payload = toSupabaseContactRequestUpdate(request);

  if (isUuid(request.id)) {
    const updatedById = await updateById(request.id, payload);

    if (updatedById) {
      return updatedById;
    }
  }

  const updatedByLocalId = await updateByLocalRequestId(request.id, payload);

  if (updatedByLocalId) {
    return updatedByLocalId;
  }

  const updatedByRequestNumber = await updateByRequestNumber(
    request.requestNumber,
    payload,
  );

  if (updatedByRequestNumber) {
    return updatedByRequestNumber;
  }

  console.error(
    "Supabase contact request update failed: no matching row",
    request,
  );

  return null;
}

export async function deleteContactRequestFromSupabase(request = {}) {
  const requestId =
    typeof request === "string" || typeof request === "number"
      ? String(request)
      : request?.id;

  if (!requestId) {
    return false;
  }

  if (isUuid(requestId)) {
    const deletedById = await deleteById(requestId);

    if (deletedById) {
      return true;
    }
  }

  return deleteByLocalRequestId(requestId);
}
