import { supabase } from "../lib/supabaseClient";
import { fetchSitePublicationRequestsFromSupabase } from "./supabaseSitePublicationService";

const STORAGE_KEYS = {
  instructorActivities: "hatef_instructor_activities",
  executionOrders: "hatef_execution_orders",
  activityRegistrations: "hatef_activity_registrations",
  activityParticipantNotices: "hatef_activity_participant_notices",
  businessPartners: "hatef_business_partners",
  businessRequests: "hatef_business_collaboration_requests",
  userProfiles: "hatef_user_profiles",
  sitePublicationRequests: "hatef_site_publication_requests",
};

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function readCollection(storageKey) {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  return Array.isArray(parsedValue) ? parsedValue : [];
}

function writeCollection(storageKey, items = []) {
  if (!canUseStorage() || !Array.isArray(items)) {
    return [];
  }

  window.localStorage.setItem(storageKey, JSON.stringify(items));

  return items;
}

function getItemKey(item = {}) {
  return String(
    item.id ||
      item.localId ||
      item.local_id ||
      item.localActivityId ||
      item.localOrderId ||
      item.localRegistrationId ||
      item.localNoticeId ||
      "",
  );
}

function mergeById(existingItems = [], incomingItems = []) {
  const itemsById = new Map();

  existingItems.forEach((item) => {
    const key = getItemKey(item);

    if (key) {
      itemsById.set(key, item);
    }
  });

  incomingItems.forEach((item) => {
    const key = getItemKey(item);

    if (key) {
      itemsById.set(key, item);
    }
  });

  return Array.from(itemsById.values());
}

function hydrateCollection(storageKey, incomingItems = []) {
  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    return [];
  }

  const existingItems = readCollection(storageKey);
  const nextItems = mergeById(existingItems, incomingItems);

  writeCollection(storageKey, nextItems);

  return nextItems;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = safeParseJson(value, null);

    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

    if (value.trim()) {
      return [value.trim()];
    }
  }

  return [];
}

function normalizeRole(role) {
  const value = String(role || "").trim();

  if (value === "committee_secretariat") {
    return "committee";
  }

  if (value === "business") {
    return "business_partner";
  }

  if (value === "event_organizer" || value === "organizer") {
    return "instructor";
  }

  return value;
}

function isCommitteeRole(role) {
  return ["committee", "admin", "support"].includes(normalizeRole(role));
}

function isInstructorRole(role) {
  return normalizeRole(role) === "instructor";
}

function isInnovatorRole(role) {
  return normalizeRole(role) === "innovator";
}

function mapInstructorActivityRow(row = {}) {
  const payload = isPlainObject(row.payload) ? row.payload : {};

  return {
    ...payload,
    id: row.local_activity_id || payload.id || row.id,
    supabaseId: row.id,
    type: row.type || payload.type || "course",
    title: row.title || payload.title || "دوره یا رویداد",
    summary: row.summary || payload.summary || "",
    image: row.image || payload.image || "",
    status: row.status || payload.status || "در انتظار تایید",
    secondaryStatus:
      row.secondary_status ||
      payload.secondaryStatus ||
      payload.secondary_status ||
      "",
    statusFeedback:
      row.status_feedback ||
      payload.statusFeedback ||
      payload.status_feedback ||
      "",
    reviewedAt:
      row.reviewed_at || payload.reviewedAt || payload.reviewed_at || "",
    publishedAt:
      row.published_at || payload.publishedAt || payload.published_at || "",
    revisionRound: Number(row.revision_round || payload.revisionRound || 0),
    instructorId:
      row.instructor_id || payload.instructorId || payload.instructor_id || "",
    createdBy:
      row.instructor_id ||
      row.created_by ||
      payload.createdBy ||
      payload.created_by ||
      payload.instructorId ||
      "",
    instructorName:
      row.instructor_name ||
      payload.instructorName ||
      payload.instructor_name ||
      "مدرس هاتف",
    createdAt: row.created_at || payload.createdAt || payload.created_at || "",
    updatedAt: row.updated_at || payload.updatedAt || payload.updated_at || "",
    audiences: normalizeArray(payload.audiences),
    outcomes: normalizeArray(payload.outcomes),
    modules: normalizeArray(payload.modules),
    instructors: normalizeArray(payload.instructors),
    benefits: normalizeArray(payload.benefits),
    faqs: normalizeArray(payload.faqs),
    highlights: normalizeArray(payload.highlights),
    agenda: normalizeArray(payload.agenda),
    speakers: normalizeArray(payload.speakers),
    capacity: payload.capacity || row.capacity || "",
    startDate: payload.startDate || row.start_date || "",
    startAt: payload.startAt || row.start_at || "",
    eventDate: payload.eventDate || row.event_date || "",
    location: payload.location || row.location || "",
    format: payload.format || row.format || "",
    instructor: payload.instructor || row.instructor_name || "",
  };
}

function mapExecutionOrderRow(row = {}) {
  const payload = isPlainObject(row.payload) ? row.payload : {};

  return {
    ...payload,
    id: row.local_order_id || payload.id || row.id,
    supabaseId: row.id,
    title: row.title || payload.title || "سفارش اجرای دوره یا رویداد",
    summary: row.summary || payload.summary || "",
    description: row.description || payload.description || row.summary || "",
    subject: row.subject || payload.subject || "سفارش اجرا",
    category: row.category || payload.category || row.subject || "سفارش اجرا",
    deadlineDate:
      row.deadline_date || payload.deadlineDate || payload.deadline_date || "",
    deadlineTime:
      row.deadline_time || payload.deadlineTime || payload.deadline_time || "",
    deadline: row.deadline || payload.deadline || "",
    status: row.status || payload.status || "در انتظار پذیرش",
    acceptedBy:
      row.accepted_by_name ||
      payload.acceptedBy ||
      payload.accepted_by_name ||
      "",
    acceptedById:
      row.accepted_by_id ||
      payload.acceptedById ||
      payload.accepted_by_id ||
      "",
    acceptedAt:
      row.accepted_at || payload.acceptedAt || payload.accepted_at || "",
    completedAt:
      row.completed_at || payload.completedAt || payload.completed_at || "",
    createdBy: row.created_by || payload.createdBy || payload.created_by || "",
    createdAt: row.created_at || payload.createdAt || payload.created_at || "",
    updatedAt: row.updated_at || payload.updatedAt || payload.updated_at || "",
  };
}

function getRoleLabel(role) {
  const roleMap = {
    innovator: "فناور",
    reviewer: "داور",
    committee: "کمیته",
    business_partner: "همکار تجاری",
    business: "همکار تجاری",
    instructor: "مدرس",
  };

  return roleMap[role] || "کاربر";
}

function mapActivityRegistrationRow(row = {}) {
  const payload = isPlainObject(row.payload) ? row.payload : {};

  return {
    ...payload,
    id: row.local_registration_id || payload.id || row.id,
    supabaseId: row.id,
    activityId:
      row.activity_id || payload.activityId || payload.activity_id || "",
    activityType:
      row.activity_type ||
      payload.activityType ||
      payload.activity_type ||
      "course",
    activityTitle:
      row.activity_title ||
      payload.activityTitle ||
      payload.activity_title ||
      "برنامه آموزشی",
    instructorId:
      row.instructor_id || payload.instructorId || payload.instructor_id || "",
    userId: row.user_id || payload.userId || payload.user_id || "",
    role: row.role || payload.role || "innovator",
    roleLabel: payload.roleLabel || getRoleLabel(row.role || payload.role),
    fullName:
      row.full_name || payload.fullName || payload.full_name || "کاربر هاتف",
    email: row.email || payload.email || "",
    mobile: row.mobile || payload.mobile || payload.phone || "",
    organization: row.organization || payload.organization || "ثبت نشده",
    note: row.note || payload.note || "",
    registeredAt:
      row.registered_at ||
      payload.registeredAt ||
      payload.registered_at ||
      row.created_at ||
      "",
  };
}

function mapActivityNoticeRow(row = {}) {
  const payload = isPlainObject(row.payload) ? row.payload : {};
  const targetActivityIds = normalizeArray(
    row.target_activity_ids ||
      payload.targetActivityIds ||
      payload.target_activity_ids,
  );

  return {
    ...payload,
    id: row.local_notice_id || payload.id || row.id,
    supabaseId: row.id,
    mode: row.mode || payload.mode || "broadcast",
    title: row.title || payload.title || "اطلاعیه مدرس",
    message: row.message || payload.message || payload.body || "",
    target:
      row.target ||
      payload.target ||
      (targetActivityIds.length > 1
        ? "همه ثبت‌نام‌کنندگان دوره‌ها و رویدادهای منتشرشده"
        : "شرکت‌کنندگان برنامه"),
    sentAt: row.created_at || payload.sentAt || payload.createdAt || "",
    recipients: Number(row.recipients || payload.recipients || 0),
    targetActivityIds,
    activityId:
      row.activity_id ||
      payload.activityId ||
      payload.activity_id ||
      targetActivityIds[0] ||
      "",
    activityType:
      row.activity_type ||
      payload.activityType ||
      payload.activity_type ||
      "course",
    senderUserId:
      row.sender_user_id ||
      payload.senderUserId ||
      payload.sender_user_id ||
      "",
  };
}

function mapBusinessRequestRow(row = {}) {
  const payload = isPlainObject(row.payload) ? row.payload : {};

  return {
    ...payload,
    id: row.local_request_id || payload.id || row.id,
    supabaseId: row.id,
    partnerId:
      row.partner_id ||
      payload.partnerId ||
      payload.partner_id ||
      row.partner_user_id ||
      "",
    partnerUserId:
      row.partner_user_id ||
      payload.partnerUserId ||
      payload.partner_user_id ||
      row.partner_id ||
      "",
    opportunityId:
      row.opportunity_id ||
      payload.opportunityId ||
      payload.opportunity_id ||
      row.plan_id ||
      "",
    title: row.title || payload.title || "درخواست همکاری تجاری",
    opportunityTitle:
      row.opportunity_title ||
      payload.opportunityTitle ||
      payload.opportunity_title ||
      "موقعیت همکاری تجاری",
    opportunityField:
      row.opportunity_field ||
      payload.opportunityField ||
      payload.opportunity_field ||
      "همکاری تجاری",
    collaborationType:
      row.collaboration_type ||
      payload.collaborationType ||
      payload.collaboration_type ||
      "همکاری تجاری",
    message: row.message || payload.message || "",
    status: row.status || payload.status || "در انتظار پیگیری",
    supportReply:
      row.support_reply || payload.supportReply || payload.support_reply || "",
    repliedAt: row.replied_at || payload.repliedAt || payload.replied_at || "",
    sentAt: row.created_at || payload.sentAt || payload.createdAt || "",
    revisionRound: Number(row.revision_round || payload.revisionRound || 0),
  };
}

function mapUserProfile(profile = {}) {
  const fullName = profile.full_name || profile.name || profile.email || "";

  return {
    id: profile.id,
    userId: profile.id,
    username: profile.email || "",
    email: profile.email || "",
    fullName,
    full_name: fullName,
    name: fullName,
    role: profile.role || "innovator",
    mobile: profile.mobile || profile.phone || "",
    phone: profile.mobile || profile.phone || "",
    organization: profile.organization || "",
    expertise: profile.expertise || "",
    avatarUrl: profile.avatar_url || "",
    avatar_url: profile.avatar_url || "",
    createdAt: profile.created_at || "",
    updatedAt: profile.updated_at || "",
  };
}

function mapBusinessPartnerProfile(profile = {}) {
  return {
    id: profile.id,
    userId: profile.id,
    name: profile.full_name || profile.email || "همکار تجاری",
    role: "همکار تجاری",
    organization: profile.organization || "ثبت نشده",
    field: profile.expertise || "همکاری تجاری",
    email: profile.email || "ثبت نشده",
    phone: profile.mobile || "ثبت نشده",
    joinedAt: profile.created_at || "",
    viewedOpportunities: 0,
    favoriteOpportunities: 0,
    activeCollaborations: 0,
  };
}

async function hydrateInstructorActivities() {
  const { data, error } = await supabase
    .from("instructor_activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: instructor activities failed:",
      error.message,
    );
    return [];
  }

  const activities = Array.isArray(data)
    ? data.map(mapInstructorActivityRow)
    : [];

  hydrateCollection(STORAGE_KEYS.instructorActivities, activities);

  return activities;
}

async function hydrateExecutionOrders() {
  const { data, error } = await supabase
    .from("execution_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: execution orders failed:",
      error.message,
    );
    return [];
  }

  const orders = Array.isArray(data) ? data.map(mapExecutionOrderRow) : [];

  hydrateCollection(STORAGE_KEYS.executionOrders, orders);

  return orders;
}

async function hydrateActivityRegistrations() {
  const { data, error } = await supabase
    .from("activity_registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: activity registrations failed:",
      error.message,
    );
    return [];
  }

  const registrations = Array.isArray(data)
    ? data.map(mapActivityRegistrationRow)
    : [];

  hydrateCollection(STORAGE_KEYS.activityRegistrations, registrations);

  return registrations;
}

async function hydrateActivityParticipantNotices() {
  const { data, error } = await supabase
    .from("activity_participant_notices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: activity participant notices failed:",
      error.message,
    );
    return [];
  }

  const notices = Array.isArray(data) ? data.map(mapActivityNoticeRow) : [];

  hydrateCollection(STORAGE_KEYS.activityParticipantNotices, notices);

  return notices;
}

async function hydrateUserProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Dashboard hydration: user profiles failed:", error.message);
    return [];
  }

  const profiles = Array.isArray(data) ? data.map(mapUserProfile) : [];

  hydrateCollection(STORAGE_KEYS.userProfiles, profiles);

  return profiles;
}

async function hydrateBusinessPartners() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["business_partner", "business"])
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: business partners failed:",
      error.message,
    );
    return [];
  }

  const partners = Array.isArray(data)
    ? data.map(mapBusinessPartnerProfile)
    : [];

  hydrateCollection(STORAGE_KEYS.businessPartners, partners);

  return partners;
}

async function hydrateBusinessRequests() {
  const { data, error } = await supabase
    .from("business_collaboration_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(
      "Dashboard hydration: business requests failed:",
      error.message,
    );
    return [];
  }

  const requests = Array.isArray(data) ? data.map(mapBusinessRequestRow) : [];

  hydrateCollection(STORAGE_KEYS.businessRequests, requests);

  return requests;
}

async function hydrateSitePublicationRequests() {
  const requests = await fetchSitePublicationRequestsFromSupabase();

  if (!canUseStorage()) {
    return requests;
  }

  writeCollection(STORAGE_KEYS.sitePublicationRequests, requests);

  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent("hatef-site-publication-requests-updated"),
    );
  }

  return requests;
}

export async function hydrateDashboardDataForUser(user = {}) {
  if (!user?.id || !canUseStorage()) {
    return {
      success: false,
      reason: "missing_user_or_storage",
    };
  }

  const role = normalizeRole(user.role);
  const jobs = [];

  if (isCommitteeRole(role)) {
    jobs.push(
      hydrateInstructorActivities(),
      hydrateExecutionOrders(),
      hydrateActivityRegistrations(),
      hydrateActivityParticipantNotices(),
      hydrateUserProfiles(),
      hydrateBusinessPartners(),
      hydrateBusinessRequests(),
      hydrateSitePublicationRequests(),
    );
  } else if (isInstructorRole(role)) {
    jobs.push(
      hydrateInstructorActivities(),
      hydrateExecutionOrders(),
      hydrateActivityRegistrations(),
      hydrateActivityParticipantNotices(),
    );
  } else if (isInnovatorRole(role)) {
    jobs.push(
      hydrateInstructorActivities(),
      hydrateActivityRegistrations(),
      hydrateActivityParticipantNotices(),
      hydrateSitePublicationRequests(),
    );
  } else if (role === "business_partner") {
    jobs.push(hydrateBusinessRequests(), hydrateSitePublicationRequests());
  }

  const results = await Promise.allSettled(jobs);

  return {
    success: true,
    role,
    jobs: results.length,
    failedJobs: results.filter((result) => result.status === "rejected").length,
  };
}

export async function hydrateDashboardDataForCurrentSession() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return {
      success: false,
      reason: "missing_supabase_session",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      reason: "missing_profile",
    };
  }

  return hydrateDashboardDataForUser({
    id: profile.id,
    role: profile.role,
  });
}
