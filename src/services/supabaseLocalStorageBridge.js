import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";
import { syncExecutionOrderToSupabase } from "./supabaseExecutionOrderService";

const STORAGE_KEYS = {
  calls: "hatef_calls",
  plans: "hatef_plans",
  reviews: "hatef_reviews",
  tasks: "hatef_tasks",
  executionOrders: "hatef_execution_orders",
};

const ID_MAP_STORAGE_KEY = "hatef_supabase_id_map";

let isBridgeStarted = false;
let originalSetItem = null;

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
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function makeUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getSupabaseId(entityType, localId) {
  const rawLocalId = String(localId || "").trim();

  if (!rawLocalId) {
    return makeUuid();
  }

  if (isUuid(rawLocalId)) {
    return rawLocalId;
  }

  const idMap = readIdMap();
  const mapKey = `${entityType}:${rawLocalId}`;

  if (idMap[mapKey]) {
    return idMap[mapKey];
  }

  const newId = makeUuid();

  writeIdMap({
    ...idMap,
    [mapKey]: newId,
  });

  return newId;
}

function getStableTrackingCode(plan = {}, supabasePlanId = "") {
  const rawCode = String(plan.trackingCode || plan.trackingId || "").trim();

  if (rawCode && isUuid(plan.id)) {
    return rawCode;
  }

  const idSuffix = String(supabasePlanId || makeUuid())
    .slice(0, 8)
    .toUpperCase();

  if (rawCode) {
    return `${rawCode}-${idSuffix}`;
  }

  return `HTF-1405-${Date.now().toString(36).toUpperCase()}-${idSuffix}`;
}

function isManagerRole(user) {
  return ["committee", "admin", "support"].includes(user?.role);
}

function isReviewerRole(user) {
  return user?.role === "reviewer";
}

function isInnovatorRole(user) {
  return user?.role === "innovator";
}

function toEnglishDigits(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
}

function toIsoDate(value) {
  const rawValue = toEnglishDigits(value).trim();

  if (!rawValue) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  return null;
}

function normalizeTime(value) {
  const rawValue = toEnglishDigits(value).trim();

  if (!rawValue) {
    return null;
  }

  const match = rawValue.match(/(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const hour = String(match[1]).padStart(2, "0");
  const minute = match[2];

  return `${hour}:${minute}`;
}

function normalizePlanStatus(status) {
  const statusMap = {
    submitted: "submitted",
    under_review: "under_review",
    reviewed: "reviewed",
    accepted: "accepted",
    weak_accepted: "weak_accepted",
    weakAccepted: "weak_accepted",
    rejected: "rejected",
    weak_rejected: "weak_rejected",
    weakRejected: "weak_rejected",
    needs_revision: "needs_revision",
    needsRevision: "needs_revision",
    "ثبت شده": "submitted",
    "در حال بررسی": "under_review",
    "بررسی شده": "reviewed",
    قبول: "accepted",
    "قبول ضعیف": "weak_accepted",
    رد: "rejected",
    "رد ضعیف": "weak_rejected",
    "نیازمند اصلاح": "needs_revision",
  };

  return statusMap[status] || "submitted";
}

function normalizeReviewStatus(status) {
  const statusMap = {
    pending: "pending",
    reviewed: "reviewed",
    "در انتظار بررسی": "pending",
    "بررسی شده": "reviewed",
  };

  return statusMap[status] || "pending";
}

function normalizeFinalStatus(status) {
  const statusMap = {
    none: "none",
    accepted: "accepted",
    weak_accepted: "weak_accepted",
    weakAccepted: "weak_accepted",
    rejected: "rejected",
    weak_rejected: "weak_rejected",
    weakRejected: "weak_rejected",
    needs_revision: "needs_revision",
    needsRevision: "needs_revision",
    قبول: "accepted",
    "قبول ضعیف": "weak_accepted",
    رد: "rejected",
    "رد ضعیف": "weak_rejected",
    "نیازمند اصلاح": "needs_revision",
    "": "none",
  };

  return statusMap[status] || "none";
}

function normalizeRecommendation(recommendation) {
  const recommendationMap = {
    accept: "accept",
    accepted: "accept",
    weak_accept: "weak_accept",
    weakAccepted: "weak_accept",
    weak_accepted: "weak_accept",
    reject: "reject",
    rejected: "reject",
    weak_reject: "weak_reject",
    weakRejected: "weak_reject",
    weak_rejected: "weak_reject",
    needs_revision: "needs_revision",
    needsRevision: "needs_revision",
    قبول: "accept",
    "پیشنهاد قبول": "accept",
    "قبول ضعیف": "weak_accept",
    "پیشنهاد قبول ضعیف": "weak_accept",
    رد: "reject",
    "پیشنهاد رد": "reject",
    "رد ضعیف": "weak_reject",
    "پیشنهاد رد ضعیف": "weak_reject",
    "نیازمند اصلاح": "needs_revision",
    "پیشنهاد اصلاح": "needs_revision",
  };

  return recommendationMap[recommendation] || "needs_revision";
}

function normalizeTaskStatus(status) {
  const statusMap = {
    waiting_for_innovator_review: "waiting_for_innovator_review",
    viewed_by_innovator: "viewed_by_innovator",
    answered_by_innovator: "answered_by_innovator",
    needs_revision: "needs_revision",
    finished: "finished",
    "در انتظار بررسی فناور": "waiting_for_innovator_review",
    "در انتظار ارسال": "waiting_for_innovator_review",
    "مشاهده شده": "viewed_by_innovator",
    "پاسخ داده شده": "answered_by_innovator",
    "ارسال شده": "answered_by_innovator",
    "نیازمند اصلاح": "needs_revision",
    "پایان یافته": "finished",
    پایان‌یافته: "finished",
  };

  return statusMap[status] || "waiting_for_innovator_review";
}

function splitDeadline(deadline = "") {
  const rawDeadline = String(deadline || "").trim();

  if (!rawDeadline) {
    return {
      deadlineDate: "",
      deadlineTime: "",
    };
  }

  if (rawDeadline.includes(" - ساعت ")) {
    const [deadlineDate, deadlineTime] = rawDeadline.split(" - ساعت ");
    return {
      deadlineDate: deadlineDate.trim(),
      deadlineTime: deadlineTime.trim(),
    };
  }

  if (rawDeadline.startsWith("ساعت ")) {
    return {
      deadlineDate: "",
      deadlineTime: rawDeadline.replace("ساعت ", "").trim(),
    };
  }

  return {
    deadlineDate: rawDeadline,
    deadlineTime: "",
  };
}

function getDeadlineDate(task = {}) {
  const deadlineParts = splitDeadline(task.deadline);

  return toIsoDate(
    task.deadlineDate || task.deadline_date || deadlineParts.deadlineDate,
  );
}

function getDeadlineTime(task = {}) {
  const deadlineParts = splitDeadline(task.deadline);

  return normalizeTime(
    task.deadlineTime || task.deadline_time || deadlineParts.deadlineTime,
  );
}

function getCurrentUserId() {
  return getCurrentUser()?.id || "";
}

async function upsertCalls(calls = []) {
  const user = getCurrentUser();

  if (!isManagerRole(user) || !Array.isArray(calls) || !calls.length) {
    return;
  }

  const payload = calls
    .filter((call) => call?.id && call?.title)
    .map((call) => ({
      id: getSupabaseId("call", call.id),
      title: call.title,
      subtitle: call.subtitle || "",
      field: call.field || "",
      description: call.description || "",
      more_description: call.moreDescription || "",
      deadline_date: toIsoDate(call.deadlineDate),
      deadline_time: normalizeTime(call.deadlineTime),
      status: call.status || "draft",
      pdf_file_url: call.pdfFileUrl || call.pdfFileName || "",
      image:
        call.image ||
        call.bannerPreview ||
        call.banner_preview ||
        call.bannerImage ||
        "",
      banner_preview:
        call.bannerPreview ||
        call.image ||
        call.banner_preview ||
        call.bannerImage ||
        "",
      created_by: user.id,
      updated_at: new Date().toISOString(),
      published_at:
        call.status === "published"
          ? new Date().toISOString()
          : call.publishedAt || null,
    }));

  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from("calls").upsert(payload);

  if (error) {
    console.error("Supabase calls sync failed:", error.message);
  }
}

async function upsertPlans(plans = []) {
  const user = getCurrentUser();

  if (!Array.isArray(plans) || !plans.length || !user?.id) {
    return;
  }

  const allowedPlans = plans.filter((plan) => {
    if (!plan?.id || !plan?.title || !plan?.innovatorId) {
      return false;
    }

    if (isManagerRole(user)) {
      return true;
    }

    if (isInnovatorRole(user)) {
      const status = normalizePlanStatus(plan.status);
      const finalStatus = normalizeFinalStatus(plan.finalStatus);
      const isOwnPlan = String(plan.innovatorId) === String(user.id);
      const isLocalOnlyPlan = !isUuid(plan.id);

      return (
        isOwnPlan &&
        (isLocalOnlyPlan ||
          (status === "submitted" &&
            finalStatus === "none" &&
            !plan.resultsPublished))
      );
    }

    return false;
  });

  const payload = allowedPlans.map((plan) => {
    const supabasePlanId = getSupabaseId("plan", plan.id);

    return {
      id: supabasePlanId,
      tracking_code: getStableTrackingCode(plan, supabasePlanId),
      title: plan.title,
      summary: plan.summary || "",
      call_id: plan.callId ? getSupabaseId("call", plan.callId) : null,
      innovator_id: plan.innovatorId,
      field: plan.field || "",
      proposal_file_url: plan.proposalFileUrl || "",
      status: normalizePlanStatus(plan.status),
      current_review_status: normalizeReviewStatus(plan.currentReviewStatus),
      committee_feedback: plan.committeeFeedback || "",
      final_status: normalizeFinalStatus(plan.finalStatus),
      final_decision_note: plan.finalDecisionNote || "",
      results_published: Boolean(plan.resultsPublished),
      publish_for_business: Boolean(plan.publishForBusiness),
      business_opportunity_published: Boolean(
        plan.businessOpportunityPublished,
      ),
      business_published_at: plan.businessPublishedAt || null,
      business_opportunity_details:
        plan.businessOpportunityDetails &&
        typeof plan.businessOpportunityDetails === "object"
          ? plan.businessOpportunityDetails
          : {},
      updated_at: new Date().toISOString(),
    };
  });

  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from("plans").upsert(payload);

  if (error) {
    console.error("Supabase plans sync failed:", error.message);
  }
}

async function upsertReviews(reviews = []) {
  const user = getCurrentUser();

  if (!Array.isArray(reviews) || !reviews.length) {
    return;
  }

  const allowedReviews = reviews.filter((review) => {
    if (!review?.id || !review?.planId || !review?.reviewerId) {
      return false;
    }

    if (isManagerRole(user)) {
      return true;
    }

    if (isReviewerRole(user)) {
      return String(review.reviewerId) === String(user.id);
    }

    return false;
  });

  const payload = allowedReviews.map((review) => ({
    id: getSupabaseId("review", review.id),
    plan_id: getSupabaseId("plan", review.planId),
    reviewer_id: isReviewerRole(user) ? user.id : review.reviewerId,
    feedback_text: review.feedbackText || "",
    score:
      review.score === "" || review.score === null || review.score === undefined
        ? null
        : Number(review.score),
    recommendation: normalizeRecommendation(review.recommendation),
    updated_at: new Date().toISOString(),
  }));

  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from("reviews").upsert(payload);

  if (error) {
    console.error("Supabase reviews sync failed:", error.message);
  }
}

function buildTaskRow(task, user) {
  const status = normalizeTaskStatus(
    task.status || task.managerDecision || task.participantStatus,
  );

  const row = {
    id: getSupabaseId("task", task.id),
    plan_id: getSupabaseId("plan", task.planId),
    title: task.title,
    manager_message: task.managerMessage || "",
    deadline_date: getDeadlineDate(task),
    deadline_time: getDeadlineTime(task),
    status,
    innovator_response_text:
      task.innovatorResponseText || task.userDescription || "",
    innovator_file_url:
      task.innovatorFileUrl ||
      task.innovatorFileName ||
      task.userFileName ||
      "",
    manager_feedback: task.managerFeedback || "",
    updated_at: new Date().toISOString(),
    finished_at: status === "finished" ? new Date().toISOString() : null,
  };

  if (isManagerRole(user)) {
    row.created_by = user.id;
  }

  return row;
}

async function upsertTasksAsManager(tasks = [], user) {
  const payload = tasks
    .filter((task) => task?.id && task?.planId && task?.title)
    .map((task) => buildTaskRow(task, user));

  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from("tasks").upsert(payload);

  if (error) {
    console.error("Supabase tasks sync failed:", error.message);
  }
}

async function updateTasksAsInnovator(tasks = [], user) {
  const allowedTasks = tasks.filter(
    (task) => task?.id && task?.planId && task?.title,
  );

  for (const task of allowedTasks) {
    const taskId = getSupabaseId("task", task.id);
    const status = normalizeTaskStatus(
      task.status || task.managerDecision || task.participantStatus,
    );

    const payload = {
      status,
      innovator_response_text:
        task.innovatorResponseText || task.userDescription || "",
      innovator_file_url:
        task.innovatorFileUrl ||
        task.innovatorFileName ||
        task.userFileName ||
        "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId);

    if (error) {
      console.error("Supabase innovator task update failed:", error.message);
    }
  }
}

async function upsertTasks(tasks = []) {
  const user = getCurrentUser();

  if (!Array.isArray(tasks) || !tasks.length || !user?.id) {
    return;
  }

  if (isManagerRole(user)) {
    await upsertTasksAsManager(tasks, user);
    return;
  }

  if (isInnovatorRole(user)) {
    await updateTasksAsInnovator(tasks, user);
  }
}
async function upsertExecutionOrders(orders = []) {
  const user = getCurrentUser();

  if (!Array.isArray(orders) || !orders.length || !user?.id) {
    return;
  }

  if (!isManagerRole(user)) {
    return;
  }

  for (const order of orders) {
    if (!order?.id || !order?.title) {
      continue;
    }

    await syncExecutionOrderToSupabase(order);
  }
}
function syncByStorageKey(key, value) {
  const parsedValue = safeParseJson(value, []);

  if (!Array.isArray(parsedValue)) {
    return;
  }

  if (!getCurrentUserId()) {
    return;
  }

  if (key === STORAGE_KEYS.calls) {
    upsertCalls(parsedValue);
    return;
  }

  if (key === STORAGE_KEYS.plans) {
    upsertPlans(parsedValue);
    return;
  }

  if (key === STORAGE_KEYS.reviews) {
    upsertReviews(parsedValue);
    return;
  }

  if (key === STORAGE_KEYS.tasks) {
    upsertTasks(parsedValue);
  }
  if (key === STORAGE_KEYS.executionOrders) {
    upsertExecutionOrders(parsedValue);
  }
}

export function startSupabaseLocalStorageBridge() {
  if (!canUseStorage() || isBridgeStarted) {
    return;
  }

  originalSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    originalSetItem.call(this, key, value);

    if (
      this === window.localStorage &&
      Object.values(STORAGE_KEYS).includes(key)
    ) {
      syncByStorageKey(key, value);
    }
  };

  isBridgeStarted = true;
}

export function stopSupabaseLocalStorageBridge() {
  if (!canUseStorage() || !isBridgeStarted || !originalSetItem) {
    return;
  }

  Storage.prototype.setItem = originalSetItem;
  originalSetItem = null;
  isBridgeStarted = false;
}
