import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

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
    "در انتظار پیگیری": "در انتظار پیگیری",
    "در حال پیگیری": "در حال پیگیری",
    "پاسخ داده شده": "پاسخ داده شده",
    waiting: "در انتظار پیگیری",
    tracking: "در حال پیگیری",
    answered: "پاسخ داده شده",
  };

  return statusMap[status] || "در انتظار پیگیری";
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

function toSupabaseSupportTicket(ticket = {}) {
  const currentUser = getCurrentUser?.();

  return {
    local_ticket_id: ticket.id || "",
    user_id: isUuid(ticket.userId) ? ticket.userId : currentUser?.id || null,
    user_name: normalizeText(ticket.userName, "کاربر سامانه"),
    user_role: normalizeText(ticket.userRole, "فناور"),
    user_level: normalizeText(ticket.userLevel || ticket.userRole, "فناور"),
    title: normalizeText(ticket.title, "درخواست پشتیبانی"),
    message: normalizeText(ticket.message),
    sent_at: new Date().toISOString(),
    status: normalizeStatus(ticket.status),
    seen_by_support: Boolean(ticket.seenBySupport),
    support_reply: normalizeText(ticket.supportReply || ticket.reply),
    reply: normalizeText(ticket.reply || ticket.supportReply),
    replied_at: ticket.repliedAt ? toIsoDateOrNow(ticket.repliedAt) : null,
    source_type: normalizeText(ticket.sourceType, "support-ticket"),
    source_title: normalizeText(ticket.sourceTitle),
    related_id: normalizeText(ticket.relatedId),
    related_title: normalizeText(ticket.relatedTitle),
    origin: normalizeText(ticket.origin, "dashboard-support"),
    updated_at: new Date().toISOString(),
  };
}

function toSupabaseSupportTicketUpdate(ticket = {}) {
  const hasReply = Boolean(normalizeText(ticket.supportReply || ticket.reply));

  return {
    user_name: normalizeText(ticket.userName, "کاربر سامانه"),
    user_role: normalizeText(ticket.userRole, "فناور"),
    user_level: normalizeText(ticket.userLevel || ticket.userRole, "فناور"),
    title: normalizeText(ticket.title, "درخواست پشتیبانی"),
    message: normalizeText(ticket.message),
    status: normalizeStatus(ticket.status),
    seen_by_support: Boolean(ticket.seenBySupport),
    support_reply: normalizeText(ticket.supportReply || ticket.reply),
    reply: normalizeText(ticket.reply || ticket.supportReply),
    replied_at: hasReply ? new Date().toISOString() : null,
    source_type: normalizeText(ticket.sourceType, "support-ticket"),
    source_title: normalizeText(ticket.sourceTitle),
    related_id: normalizeText(ticket.relatedId),
    related_title: normalizeText(ticket.relatedTitle),
    origin: normalizeText(ticket.origin, "dashboard-support"),
    updated_at: new Date().toISOString(),
  };
}

async function updateById(id, payload) {
  const { data, error } = await supabase
    .from("support_tickets")
    .update(payload)
    .eq("id", id)
    .select("*");

  if (error) {
    console.error(
      "Supabase support ticket update by id failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) && data[0] ? data[0] : null;
}

async function updateByLocalTicketId(localTicketId, payload) {
  if (!localTicketId) {
    return null;
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update(payload)
    .eq("local_ticket_id", localTicketId)
    .select("*");

  if (error) {
    console.error(
      "Supabase support ticket update by local id failed:",
      error.message,
    );
    return null;
  }

  return Array.isArray(data) && data[0] ? data[0] : null;
}

async function deleteById(id) {
  if (!isUuid(id)) {
    return false;
  }

  const { error } = await supabase
    .from("support_tickets")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Supabase support ticket delete by id failed:",
      error.message,
    );
    return false;
  }

  return true;
}

async function deleteByLocalTicketId(localTicketId) {
  if (!localTicketId) {
    return false;
  }

  const { error } = await supabase
    .from("support_tickets")
    .delete()
    .eq("local_ticket_id", localTicketId);

  if (error) {
    console.error(
      "Supabase support ticket delete by local id failed:",
      error.message,
    );
    return false;
  }

  return true;
}

export async function syncSupportTicketToSupabase(ticket = {}) {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id || !ticket?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert(toSupabaseSupportTicket(ticket))
    .select("*")
    .single();

  if (error) {
    console.error("Supabase support ticket sync failed:", error.message);
    return null;
  }

  return data;
}

export async function syncSupportTicketUpdateToSupabase(ticket = {}) {
  if (!ticket?.id) {
    return null;
  }

  const payload = toSupabaseSupportTicketUpdate(ticket);

  if (isUuid(ticket.id)) {
    const updatedById = await updateById(ticket.id, payload);

    if (updatedById) {
      return updatedById;
    }
  }

  const updatedByLocalId = await updateByLocalTicketId(ticket.id, payload);

  if (updatedByLocalId) {
    return updatedByLocalId;
  }

  console.error(
    "Supabase support ticket update failed: no matching row",
    ticket,
  );

  return null;
}

export async function deleteSupportTicketFromSupabase(ticket = {}) {
  const ticketId =
    typeof ticket === "string" || typeof ticket === "number"
      ? String(ticket)
      : ticket?.id;

  if (!ticketId) {
    return false;
  }

  if (isUuid(ticketId)) {
    const deletedById = await deleteById(ticketId);

    if (deletedById) {
      return true;
    }
  }

  return deleteByLocalTicketId(ticketId);
}
