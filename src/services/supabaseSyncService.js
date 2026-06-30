import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

const CALLS_STORAGE_KEY = "hatef_calls";
const PLANS_STORAGE_KEY = "hatef_plans";
const REVIEWS_STORAGE_KEY = "hatef_reviews";
const TASKS_STORAGE_KEY = "hatef_tasks";
const BUSINESS_REQUESTS_STORAGE_KEY = "hatef_business_collaboration_requests";
const CONTACT_REQUESTS_STORAGE_KEY = "hatef_contact_requests";
const SUPPORT_TICKETS_STORAGE_KEY = "hatef_support_tickets";
const NOTIFICATIONS_STORAGE_KEY = "hatef_notifications";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function writeStorageKey(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value || []));
}

function isManagerRole(user) {
  return ["committee", "admin", "support"].includes(user?.role);
}

function timestampFromValue(value) {
  if (!value) {
    return Date.now();
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function formatPersianDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(
      "fa-IR-u-ca-persian",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );
  } catch {
    return String(value);
  }
}

function formatPersianDateTime(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function normalizeTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
}

function normalizeSupportRole(role) {
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

function normalizeNotificationRole(role) {
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

  return value || "user";
}

function mapCallFromSupabase(call = {}) {
  return {
    id: call.id,
    title: call.title || "",
    subtitle: call.subtitle || "",
    field: call.field || "",
    description: call.description || "",
    moreDescription: call.more_description || "",
    deadlineDate: formatPersianDate(call.deadline_date),
    deadlineTime: normalizeTime(call.deadline_time),
    status: call.status || "draft",
    pdfFileUrl: call.pdf_file_url || "",
    image: call.image || call.banner_preview || "",
    bannerPreview: call.banner_preview || call.image || "",
    bannerImage: call.banner_preview || call.image || "",
    createdBy: call.created_by || "",
    createdAt: formatPersianDateTime(call.created_at),
    publishedAt: formatPersianDateTime(call.published_at),
    updatedAt: formatPersianDateTime(call.updated_at),
  };
}

function mapPlanFromSupabase(plan = {}) {
  return {
    id: plan.id,
    trackingCode: plan.tracking_code || "",
    title: plan.title || "",
    summary: plan.summary || "",
    field: plan.field || "",
    callId: plan.call_id || "",
    innovatorId: plan.innovator_id || "",
    status: plan.status || "submitted",
    currentReviewStatus: plan.current_review_status || "pending",
    finalStatus: plan.final_status || "none",
    submittedAt: formatPersianDateTime(plan.submitted_at),
    updatedAt: formatPersianDateTime(plan.updated_at),
    proposalFileUrl: plan.proposal_file_url || "",
    committeeFeedback: plan.committee_feedback || "",
    committeeReviewRecommendation: "",
    committeeReviewScore: "",
    finalDecisionNote: plan.final_decision_note || "",
    finalStatusDate: formatPersianDateTime(plan.updated_at),
    revisionRound: 0,
    publishForBusiness: Boolean(plan.publish_for_business),
    businessIntroducedAt: "",
    businessOpportunityPublished: Boolean(plan.business_opportunity_published),
    businessPublishedAt: formatPersianDateTime(plan.business_published_at),
    businessOpportunityDetails:
      plan.business_opportunity_details &&
      typeof plan.business_opportunity_details === "object"
        ? plan.business_opportunity_details
        : {},
    resultsPublished: Boolean(plan.results_published),
  };
}

function mapReviewFromSupabase(review = {}) {
  return {
    id: review.id,
    planId: review.plan_id || "",
    reviewerId: review.reviewer_id || "",
    score: Number(review.score || 0),
    recommendation: review.recommendation || "needs_revision",
    feedbackText: review.feedback_text || "",
    createdAt: formatPersianDateTime(review.created_at),
    updatedAt: formatPersianDateTime(review.updated_at),
  };
}

function mapTaskFromSupabase(task = {}) {
  return {
    id: task.id,
    planId: task.plan_id || "",
    title: task.title || "",
    deadlineDate: formatPersianDate(task.deadline_date),
    deadlineTime: normalizeTime(task.deadline_time),
    managerMessage: task.manager_message || "",
    innovatorResponseText: task.innovator_response_text || "",
    innovatorFileUrl: task.innovator_file_url || "",
    innovatorFileName: task.innovator_file_url || "",
    status: task.status || "waiting_for_innovator_review",
    managerFeedback: task.manager_feedback || "",
    managerDecision: task.status || "",
    createdAt: formatPersianDateTime(task.created_at),
    updatedAt: formatPersianDateTime(task.updated_at),
    reviewedAt: task.finished_at ? formatPersianDateTime(task.finished_at) : "",
  };
}

function mapBusinessRequestFromSupabase(request = {}) {
  return {
    id: request.local_request_id || request.id,
    supabaseId: request.id,
    partnerId: request.partner_id || request.partner_user_id || "",
    partnerUserId: request.partner_user_id || request.partner_id || "",
    opportunityId: request.opportunity_id || "",
    title: request.title || "درخواست همکاری تجاری",
    opportunityTitle: request.opportunity_title || "موقعیت همکاری تجاری",
    opportunityField: request.opportunity_field || "همکاری تجاری",
    collaborationType: request.collaboration_type || "همکاری تجاری",
    message: request.message || "",
    sentAt: formatPersianDateTime(request.sent_at),
    status: request.status || "در انتظار پیگیری",
    supportReply: request.support_reply || "",
    repliedAt: formatPersianDateTime(request.replied_at),
    revisionRound: Number(request.revision_round || 0),
  };
}

function mapContactRequestFromSupabase(request = {}) {
  const createdAtTimestamp = timestampFromValue(request.created_at);
  const updatedAtTimestamp = timestampFromValue(request.updated_at);

  return {
    id: request.local_request_id || request.id,
    supabaseId: request.id,
    requestNumber:
      request.request_number || `CR-${String(createdAtTimestamp).slice(-8)}`,
    fullName: request.full_name || "کاربر سایت",
    email: request.email || "",
    phone: request.phone || "",
    subject: request.subject || "درخواست تماس",
    message: request.message || "",
    sourceType: request.source_type || "contact",
    sourceTitle: request.source_title || "فرم تماس سایت",
    relatedId: request.related_id || "",
    relatedTitle: request.related_title || "",
    pageUrl: request.page_url || "",
    pagePath: request.page_path || "",
    status: request.status || "جدید",
    reply: request.reply || "",
    replyBy: request.reply_by || "",
    repliedAt: request.replied_at
      ? formatPersianDateTime(request.replied_at)
      : "",
    repliedAtTimestamp: request.replied_at
      ? timestampFromValue(request.replied_at)
      : 0,
    createdAt: formatPersianDateTime(request.created_at),
    createdAtTimestamp,
    updatedAt: formatPersianDateTime(request.updated_at),
    updatedAtTimestamp,
    origin: request.origin || "guest-site-contact-form",
    isGuestRequest: request.is_guest_request !== false,
  };
}

function mapSupportTicketFromSupabase(ticket = {}) {
  const sentAtTimestamp = timestampFromValue(ticket.sent_at);
  const createdAtTimestamp = timestampFromValue(ticket.created_at);

  const supportReply = ticket.support_reply || ticket.reply || "";
  const userRole = normalizeSupportRole(ticket.user_role || ticket.user_level);

  return {
    id: ticket.local_ticket_id || ticket.id,
    supabaseId: ticket.id,
    userId: ticket.user_id || "",
    userName: ticket.user_name || "کاربر سامانه",
    userRole,
    userLevel: ticket.user_level || userRole,
    title: ticket.title || "درخواست پشتیبانی",
    message: ticket.message || "",
    sentAt: formatPersianDateTime(ticket.sent_at),
    sentAtTimestamp,
    createdAtTimestamp,
    status: ticket.status || "در انتظار پیگیری",
    seenBySupport: Boolean(ticket.seen_by_support),
    supportReply,
    reply: supportReply,
    repliedAt: ticket.replied_at
      ? formatPersianDateTime(ticket.replied_at)
      : "",
    sourceType: ticket.source_type || "support-ticket",
    sourceTitle: ticket.source_title || "",
    relatedId: ticket.related_id || "",
    relatedTitle: ticket.related_title || "",
    origin: ticket.origin || "dashboard-support",
  };
}

function mapNotificationFromSupabase(notification = {}) {
  return {
    id: notification.local_notification_id || notification.id,
    supabaseId: notification.id,
    title: notification.title || "اعلان جدید",
    body: notification.body || "",
    category: notification.category || "پیام سامانه",
    sentAt: formatPersianDateTime(notification.sent_at),
    targetUserId: notification.target_user_id || "",
    targetRole: normalizeNotificationRole(notification.target_role),
    sourceType: notification.source_type || "system",
    sourceId: notification.source_id || "",
    eventKey: notification.event_key || "",
    isRead: Boolean(notification.is_read),
    isImportant: Boolean(notification.is_important),
  };
}

export async function syncCallsFromSupabase() {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت فراخوان‌ها.");
  }

  const calls = Array.isArray(data) ? data.map(mapCallFromSupabase) : [];
  writeStorageKey(CALLS_STORAGE_KEY, calls);

  return calls;
}

export async function syncPlansFromSupabase() {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت طرح‌ها.");
  }

  const plans = Array.isArray(data) ? data.map(mapPlanFromSupabase) : [];
  writeStorageKey(PLANS_STORAGE_KEY, plans);

  return plans;
}

export async function syncReviewsFromSupabase() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت بازخوردهای داوری.");
  }

  const reviews = Array.isArray(data) ? data.map(mapReviewFromSupabase) : [];
  writeStorageKey(REVIEWS_STORAGE_KEY, reviews);

  return reviews;
}

export async function syncTasksFromSupabase() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت وظایف.");
  }

  const tasks = Array.isArray(data) ? data.map(mapTaskFromSupabase) : [];
  writeStorageKey(TASKS_STORAGE_KEY, tasks);

  return tasks;
}

export async function syncBusinessRequestsFromSupabase() {
  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت درخواست‌های همکاری.");
  }

  const businessRequests = Array.isArray(data)
    ? data.map(mapBusinessRequestFromSupabase)
    : [];

  writeStorageKey(BUSINESS_REQUESTS_STORAGE_KEY, businessRequests);

  return businessRequests;
}

export async function syncContactRequestsFromSupabase() {
  const currentUser = getCurrentUser?.();

  if (!isManagerRole(currentUser)) {
    writeStorageKey(CONTACT_REQUESTS_STORAGE_KEY, []);
    return [];
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت درخواست‌های تماس.");
  }

  const contactRequests = Array.isArray(data)
    ? data.map(mapContactRequestFromSupabase)
    : [];

  writeStorageKey(CONTACT_REQUESTS_STORAGE_KEY, contactRequests);

  return contactRequests;
}

export async function syncSupportTicketsFromSupabase() {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id) {
    writeStorageKey(SUPPORT_TICKETS_STORAGE_KEY, []);
    return [];
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت تیکت‌های پشتیبانی.");
  }

  const supportTickets = Array.isArray(data)
    ? data.map(mapSupportTicketFromSupabase)
    : [];

  writeStorageKey(SUPPORT_TICKETS_STORAGE_KEY, supportTickets);

  return supportTickets;
}

export async function syncNotificationsFromSupabase() {
  const currentUser = getCurrentUser?.();

  if (!currentUser?.id) {
    writeStorageKey(NOTIFICATIONS_STORAGE_KEY, []);
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "خطا در دریافت اعلان‌ها.");
  }

  const notifications = Array.isArray(data)
    ? data.map(mapNotificationFromSupabase)
    : [];

  writeStorageKey(NOTIFICATIONS_STORAGE_KEY, notifications);

  return notifications;
}

export async function syncCoreDataFromSupabase() {
  const [
    calls,
    plans,
    reviews,
    tasks,
    businessRequests,
    contactRequests,
    supportTickets,
    notifications,
  ] = await Promise.all([
    syncCallsFromSupabase(),
    syncPlansFromSupabase(),
    syncReviewsFromSupabase(),
    syncTasksFromSupabase(),
    syncBusinessRequestsFromSupabase(),
    syncContactRequestsFromSupabase(),
    syncSupportTicketsFromSupabase(),
    syncNotificationsFromSupabase(),
  ]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("hatef:supabase-sync-complete", {
        detail: {
          calls,
          plans,
          reviews,
          tasks,
          businessRequests,
          contactRequests,
          supportTickets,
          notifications,
        },
      }),
    );
  }

  return {
    calls,
    plans,
    reviews,
    tasks,
    businessRequests,
    contactRequests,
    supportTickets,
    notifications,
  };
}

export {
  CALLS_STORAGE_KEY,
  PLANS_STORAGE_KEY,
  REVIEWS_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  BUSINESS_REQUESTS_STORAGE_KEY,
  CONTACT_REQUESTS_STORAGE_KEY,
  SUPPORT_TICKETS_STORAGE_KEY,
  NOTIFICATIONS_STORAGE_KEY,
};
