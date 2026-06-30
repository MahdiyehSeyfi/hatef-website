import { getCurrentUser } from "./authService";
import { addNotification } from "./notificationService";
import {
  deleteSupportTicketFromSupabase,
  syncSupportTicketToSupabase,
  syncSupportTicketUpdateToSupabase,
} from "./supabaseSupportTicketService";

const SUPPORT_TICKETS_STORAGE_KEY = "hatef_support_tickets";
const SUPPORT_TICKETS_UPDATED_EVENT = "hatef-support-tickets-updated";
const LEGACY_SUPPORT_TICKET_KEYS = [
  "support_requests",
  "support_tickets",
  "business-dashboard-support-tickets",
  "innovator-dashboard-support-requests",
  "reviewer-dashboard-support-tickets",
];

let memoryTickets = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "support") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
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

function notifySupportTicketsUpdated() {
  if (typeof window === "undefined" || !window.dispatchEvent) {
    return;
  }

  window.dispatchEvent(new CustomEvent(SUPPORT_TICKETS_UPDATED_EVENT));
}

function normalizeTimestamp(value, fallbackValue = 0) {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallbackValue;
}

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "کاربر سامانه"
  );
}

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();

  if (value.includes("review") || value.includes("داور")) {
    return "داور";
  }

  if (
    value.includes("business") ||
    value.includes("commercial") ||
    value.includes("همکار") ||
    value.includes("تجاری")
  ) {
    return "همکار تجاری";
  }

  if (
    value.includes("committee") ||
    value.includes("کمیته") ||
    value.includes("دبیرخانه")
  ) {
    return "کمیته";
  }

  return "فناور";
}

function getCurrentUserProfile(defaultRole = "فناور") {
  const currentUser = getCurrentUser?.();
  const role = normalizeRole(currentUser?.role || defaultRole);

  return {
    id: currentUser?.id || `user-${role}`,
    name: getUserDisplayName(currentUser),
    role,
    email: currentUser?.email || "",
  };
}

function normalizeTicket(ticket = {}) {
  const supportReply = ticket.supportReply || ticket.reply || "";
  const userRole = normalizeRole(
    ticket.userRole || ticket.userLevel || ticket.role,
  );
  const nowTimestamp = Date.now();
  const createdAtTimestamp = normalizeTimestamp(
    ticket.createdAtTimestamp || ticket.sentAtTimestamp || ticket.createdAtMs,
    nowTimestamp,
  );

  return {
    id: ticket.id || makeId(),
    supabaseId: ticket.supabaseId || "",
    userId: ticket.userId || ticket.ownerId || ticket.senderId || "",
    userName: ticket.userName || ticket.senderName || "کاربر سامانه",
    userRole,
    userLevel: ticket.userLevel || userRole,
    title: ticket.title || "درخواست پشتیبانی",
    message: ticket.message || ticket.description || "",
    sentAt: ticket.sentAt || ticket.createdAt || getCurrentPersianDateTime(),
    sentAtTimestamp: normalizeTimestamp(
      ticket.sentAtTimestamp || ticket.createdAtTimestamp || ticket.createdAtMs,
      createdAtTimestamp,
    ),
    createdAtTimestamp,
    status: ticket.status || "در انتظار پیگیری",
    seenBySupport: Boolean(ticket.seenBySupport),
    supportReply,
    reply: supportReply,
    repliedAt: ticket.repliedAt || "",
    sourceType: ticket.sourceType || "support-ticket",
    sourceTitle: ticket.sourceTitle || "",
    relatedId: ticket.relatedId || "",
    relatedTitle: ticket.relatedTitle || "",
    origin: ticket.origin || "dashboard-support",
  };
}

function normalizeTickets(tickets) {
  if (!Array.isArray(tickets)) {
    return [];
  }

  return tickets.filter(Boolean).map(normalizeTicket);
}

function readTicketsFromStorageKey(key) {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [];
  }

  return normalizeTickets(safeParseJson(storedValue, []));
}

function writeTickets(tickets) {
  const normalizedTickets = normalizeTickets(tickets);

  if (!canUseStorage()) {
    memoryTickets = normalizedTickets;
    notifySupportTicketsUpdated();
    return normalizedTickets;
  }

  window.localStorage.setItem(
    SUPPORT_TICKETS_STORAGE_KEY,
    JSON.stringify(normalizedTickets),
  );

  notifySupportTicketsUpdated();
  return normalizedTickets;
}

function readTickets() {
  if (!canUseStorage()) {
    return memoryTickets;
  }

  const mainTickets = readTicketsFromStorageKey(SUPPORT_TICKETS_STORAGE_KEY);

  if (mainTickets.length) {
    return mainTickets;
  }

  for (const legacyKey of LEGACY_SUPPORT_TICKET_KEYS) {
    const legacyTickets = readTicketsFromStorageKey(legacyKey);

    if (legacyTickets.length) {
      writeTickets(legacyTickets);
      return legacyTickets;
    }
  }

  return [];
}

function sortNewest(tickets) {
  return [...tickets].sort(
    (first, second) =>
      Number(second.sentAtTimestamp || second.createdAtTimestamp || 0) -
      Number(first.sentAtTimestamp || first.createdAtTimestamp || 0),
  );
}

export function getSupportTickets() {
  return sortNewest(readTickets());
}

export function setSupportTickets(tickets) {
  return writeTickets(tickets);
}

export function getSupportTicketsByUserId(userId) {
  return getSupportTickets().filter(
    (ticket) => String(ticket.userId) === String(userId),
  );
}

export function getCurrentUserSupportTickets(defaultRole = "فناور") {
  const user = getCurrentUserProfile(defaultRole);

  return getSupportTickets().filter(
    (ticket) => String(ticket.userId) === String(user.id),
  );
}

export function addSupportTicket(ticketData = {}, defaultRole = "فناور") {
  const user = getCurrentUserProfile(defaultRole);
  const tickets = getSupportTickets();
  const nowTimestamp = Date.now();

  const newTicket = normalizeTicket({
    ...ticketData,
    id: ticketData.id || makeId(),
    userId: ticketData.userId || user.id,
    userName: ticketData.userName || user.name,
    userRole: ticketData.userRole || user.role,
    userLevel: ticketData.userLevel || user.role,
    sentAt: ticketData.sentAt || getCurrentPersianDateTime(),
    sentAtTimestamp: ticketData.sentAtTimestamp || nowTimestamp,
    createdAtTimestamp: ticketData.createdAtTimestamp || nowTimestamp,
    status: "در انتظار پیگیری",
    seenBySupport: false,
    supportReply: "",
    reply: "",
    repliedAt: "",
    origin: ticketData.origin || "dashboard-support",
  });

  writeTickets([newTicket, ...tickets]);

  addNotification({
    targetRole: "committee",
    title:
      newTicket.sourceType === "site-contact-form"
        ? "درخواست جدید از فرم تماس سایت"
        : "درخواست پشتیبانی جدید",
    body: `${newTicket.sourceTitle || newTicket.userLevel}: ${newTicket.title}`,
    category: "درخواست‌ها",
    sourceType: "support-ticket",
    sourceId: newTicket.id,
    isImportant: true,
  });

  syncSupportTicketToSupabase(newTicket);
  notifySupportTicketsUpdated();

  return newTicket;
}

export function markSupportTicketSeen(ticketId) {
  const tickets = getSupportTickets();
  let updatedTicket = null;

  const updatedTickets = tickets.map((ticket) => {
    if (String(ticket.id) !== String(ticketId)) {
      return ticket;
    }

    updatedTicket = normalizeTicket({
      ...ticket,
      status:
        ticket.status === "در انتظار پیگیری" ? "در حال پیگیری" : ticket.status,
      seenBySupport: true,
    });

    return updatedTicket;
  });

  writeTickets(updatedTickets);

  if (updatedTicket) {
    syncSupportTicketUpdateToSupabase(updatedTicket);
  }

  return updatedTicket;
}

export function saveSupportTicketReply(ticketId, replyText) {
  const tickets = getSupportTickets();
  let updatedTicket = null;

  const updatedTickets = tickets.map((ticket) => {
    if (String(ticket.id) !== String(ticketId)) {
      return ticket;
    }

    updatedTicket = normalizeTicket({
      ...ticket,
      status: "پاسخ داده شده",
      seenBySupport: true,
      supportReply: replyText,
      reply: replyText,
      repliedAt: getCurrentPersianDateTime(),
    });

    return updatedTicket;
  });

  writeTickets(updatedTickets);

  if (updatedTicket) {
    syncSupportTicketUpdateToSupabase(updatedTicket);

    addNotification({
      targetUserId: updatedTicket.userId,
      title: "پاسخ پشتیبانی ثبت شد",
      body: `برای درخواست «${updatedTicket.title}» پاسخ دبیرخانه ثبت شد.`,
      category: "پشتیبانی",
      sourceType: "support-ticket",
      sourceId: updatedTicket.id,
      isImportant: true,
    });
  }

  return updatedTicket;
}

export function deleteSupportTicket(ticketId) {
  const tickets = getSupportTickets();
  const targetTicket = tickets.find(
    (ticket) => String(ticket.id) === String(ticketId),
  );

  if (targetTicket?.seenBySupport) {
    return tickets;
  }

  const updatedTickets = tickets.filter(
    (ticket) => String(ticket.id) !== String(ticketId),
  );

  writeTickets(updatedTickets);

  if (targetTicket) {
    deleteSupportTicketFromSupabase(targetTicket);
  } else {
    deleteSupportTicketFromSupabase(ticketId);
  }

  return updatedTickets;
}

export function clearSupportTickets() {
  const tickets = getSupportTickets();

  tickets.forEach((ticket) => {
    deleteSupportTicketFromSupabase(ticket);
  });

  writeTickets([]);
  return [];
}

export { SUPPORT_TICKETS_STORAGE_KEY, SUPPORT_TICKETS_UPDATED_EVENT };
