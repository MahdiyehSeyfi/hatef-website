import {
  PLAN_FINAL_STATUS,
  PLAN_REVIEW_STATUS,
  PLAN_STATUS,
} from "../constants/statuses";
import { addNotificationOnce } from "./notificationService";

import {
  syncPlanFinalDecisionToSupabase,
  syncPlanResultsPublicationToSupabase,
} from "./supabasePlanWriteService";

const PLANS_STORAGE_KEY = "hatef_plans";
const REVIEWS_STORAGE_KEY = "hatef_reviews";
const REVIEWER_ACTIVITY_STORAGE_KEY = "hatef_reviewer_activity";
const COMMITTEE_WORKSPACE_STORAGE_KEY = "hatef_committee_workspace";

let memoryPlans = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function toEnglishDigits(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
}

function getTodayPersianDate() {
  try {
    return new Date().toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function normalizeField(field) {
  return String(field || "فناوری")
    .replace("با محوریت", "")
    .trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[،,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeBusinessOpportunityDetails(details = {}) {
  if (!details || typeof details !== "object") {
    return {};
  }

  return {
    title: details.title || "",
    field: details.field || details.category || "",
    category: details.category || details.field || "",
    collaborationType: details.collaborationType || "",
    location: details.location || "",
    estimatedSupport: details.estimatedSupport || "",
    duration: details.duration || "",
    summary: details.summary || details.description || "",
    description: details.description || details.summary || "",
    challenge: details.challenge || "",
    solution: details.solution || "",
    businessValue: details.businessValue || "",
    requirements: normalizeList(details.requirements),
    tags: normalizeList(details.tags),
    updatedAt: details.updatedAt || "",
  };
}

function createTrackingCode() {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");

  return `HTF-1405-${timestampPart}-${randomPart}`;
}

function isEmptyFinalStatus(finalStatus) {
  return (
    !finalStatus ||
    finalStatus === PLAN_FINAL_STATUS.NONE ||
    finalStatus === "none" ||
    finalStatus === ""
  );
}

function isNeedsRevisionFinalStatus(finalStatus) {
  return [
    PLAN_FINAL_STATUS.NEEDS_REVISION,
    "نیازمند اصلاح",
    "needsRevision",
    "needs_revision",
  ].includes(finalStatus);
}

function getFinalStatusLabel(finalStatus) {
  const statusMap = {
    [PLAN_FINAL_STATUS.ACCEPTED]: "قبول",
    [PLAN_FINAL_STATUS.WEAK_ACCEPTED]: "قبول ضعیف",
    [PLAN_FINAL_STATUS.REJECTED]: "رد",
    [PLAN_FINAL_STATUS.WEAK_REJECTED]: "رد ضعیف",
    [PLAN_FINAL_STATUS.NEEDS_REVISION]: "نیازمند اصلاح",
    accepted: "قبول",
    weakAccepted: "قبول ضعیف",
    weak_accepted: "قبول ضعیف",
    rejected: "رد",
    weakRejected: "رد ضعیف",
    weak_rejected: "رد ضعیف",
    needsRevision: "نیازمند اصلاح",
    needs_revision: "نیازمند اصلاح",
    قبول: "قبول",
    "قبول ضعیف": "قبول ضعیف",
    رد: "رد",
    "رد ضعیف": "رد ضعیف",
    "نیازمند اصلاح": "نیازمند اصلاح",
  };

  return statusMap[finalStatus] || "داوری شده";
}

function readStorageArray(key) {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [];
  }

  const parsedValue = safeParseJson(storedValue, []);

  return Array.isArray(parsedValue) ? parsedValue : [];
}

function writeStorageArray(key, items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(items));
}

function clearPlanReviews(planId) {
  const reviews = readStorageArray(REVIEWS_STORAGE_KEY);
  const nextReviews = reviews.filter(
    (review) => String(review.planId) !== String(planId),
  );

  writeStorageArray(REVIEWS_STORAGE_KEY, nextReviews);
}

function clearPlanReviewerActivity(planId) {
  const activities = readStorageArray(REVIEWER_ACTIVITY_STORAGE_KEY);
  const normalizedPlanId = String(planId);

  const nextActivities = activities.map((activity) => {
    const viewedPlanIds = Array.isArray(activity.viewedPlanIds)
      ? activity.viewedPlanIds.filter(
          (itemPlanId) => String(itemPlanId) !== normalizedPlanId,
        )
      : [];

    const viewedAtByPlanId =
      activity.viewedAtByPlanId && typeof activity.viewedAtByPlanId === "object"
        ? { ...activity.viewedAtByPlanId }
        : {};

    delete viewedAtByPlanId[normalizedPlanId];

    return {
      ...activity,
      viewedPlanIds,
      viewedAtByPlanId,
    };
  });

  writeStorageArray(REVIEWER_ACTIVITY_STORAGE_KEY, nextActivities);
}

function clearCommitteePersonalWorkspaceForPlan(planId) {
  const notes = readStorageArray(COMMITTEE_WORKSPACE_STORAGE_KEY);
  const nextNotes = notes.filter(
    (note) => String(note.planId) !== String(planId),
  );

  writeStorageArray(COMMITTEE_WORKSPACE_STORAGE_KEY, nextNotes);
}

function resetPlanEvaluationSideEffects(planId) {
  clearPlanReviews(planId);
  clearPlanReviewerActivity(planId);
  clearCommitteePersonalWorkspaceForPlan(planId);
}

function notifyInnovatorPlanReviewStarted(plan) {
  if (!plan?.innovatorId) {
    return;
  }

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "طرح وارد بررسی نهایی شد",
    body: `طرح «${plan.title}» توسط کمیته مشاهده شد و وارد مرحله بررسی نهایی شد.`,
    category: "طرح‌ها",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `innovator-plan-review-started-${plan.id}`,
    isImportant: true,
  });
}

function notifyInnovatorFinalDecision(plan) {
  if (!plan?.innovatorId) {
    return;
  }

  const finalStatusLabel = getFinalStatusLabel(plan.finalStatus);

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "طرح شما داوری شد",
    body: `برای طرح «${plan.title}» وضعیت نهایی «${finalStatusLabel}» ثبت شد.`,
    category: "طرح‌ها",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `innovator-plan-final-decision-${plan.id}-${plan.finalStatus}`,
    isImportant: true,
  });
}

function notifyInnovatorResultsPublished(plan) {
  if (!plan?.innovatorId) {
    return;
  }

  const finalStatusLabel = getFinalStatusLabel(plan.finalStatus);

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "نتیجه نهایی طرح منتشر شد",
    body: `نتیجه نهایی طرح «${plan.title}» با وضعیت «${finalStatusLabel}» منتشر شد.`,
    category: "نتایج",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `innovator-plan-results-published-${plan.id}`,
    isImportant: true,
  });
}

function notifyInnovatorBusinessIntroduction(plan) {
  if (!plan?.innovatorId) {
    return;
  }

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "طرح برای آماده‌سازی همکاری تجاری معرفی شد",
    body: `طرح «${plan.title}» برای تکمیل اطلاعات همکاری تجاری در پنل شما فعال شد.`,
    category: "همکاری تجاری",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `innovator-plan-business-introduced-${plan.id}-${plan.revisionRound || 0}`,
    isImportant: true,
  });
}

function notifyReviewersNewPlan(plan) {
  addNotificationOnce({
    targetRole: "reviewer",
    title: "طرح جدید برای بررسی",
    body: `طرح «${plan.title}» برای بررسی داوران در دسترس قرار گرفت.`,
    category: "داوری",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `reviewer-new-plan-${plan.id}`,
    isImportant: true,
  });
}

function notifyReviewersFinalReviewStarted(plan) {
  addNotificationOnce({
    targetRole: "reviewer",
    title: "طرح وارد مرحله بررسی نهایی شد",
    body: `طرح «${plan.title}» توسط کمیته وارد مرحله بررسی نهایی شد.`,
    category: "داوری",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `reviewer-final-review-started-${plan.id}`,
    isImportant: false,
  });
}

function notifyReviewersResultsPublished(plan) {
  const finalStatusLabel = getFinalStatusLabel(plan.finalStatus);

  addNotificationOnce({
    targetRole: "reviewer",
    title: "نتیجه نهایی طرح منتشر شد",
    body: `نتیجه نهایی طرح «${plan.title}» با وضعیت «${finalStatusLabel}» منتشر شد.`,
    category: "نتایج",
    sourceType: "plan",
    sourceId: plan.id,
    eventKey: `reviewer-plan-results-published-${plan.id}`,
    isImportant: false,
  });
}

function notifyBusinessPartnersNewOpportunity(plan) {
  addNotificationOnce({
    targetRole: "business",
    title: "طرح جدید برای همکاری تجاری منتشر شد",
    body: `طرح «${plan.title}» به عنوان موقعیت جدید همکاری تجاری منتشر شد.`,
    category: "همکاری تجاری",
    sourceType: "business-opportunity",
    sourceId: plan.id,
    eventKey: `business-plan-opportunity-published-${plan.id}-${plan.revisionRound || 0}`,
    isImportant: true,
  });
}

function normalizePlan(plan = {}) {
  const today = getTodayPersianDate();

  return {
    id: plan.id || makeId(),
    trackingCode:
      plan.trackingCode ||
      plan.trackingId ||
      `HTF-1405-${String(Date.now()).slice(-3)}`,
    title: plan.title || "طرح فناورانه",
    field: normalizeField(plan.field),
    callId: plan.callId || plan.call || "",
    innovatorId: plan.innovatorId || plan.userId || "",
    status: plan.status || PLAN_STATUS.SUBMITTED,
    currentReviewStatus: plan.currentReviewStatus || PLAN_REVIEW_STATUS.PENDING,
    finalStatus: plan.finalStatus || PLAN_FINAL_STATUS.NONE,
    submittedAt: plan.submittedAt || plan.createdAt || today,
    updatedAt: plan.updatedAt || plan.submittedAt || today,
    proposalFileUrl:
      plan.proposalFileUrl ||
      plan.fileName ||
      plan.fileUrl ||
      plan.proposalFile ||
      "",
    committeeFeedback: plan.committeeFeedback || "",
    committeeReviewRecommendation: plan.committeeReviewRecommendation || "",
    committeeReviewScore: plan.committeeReviewScore || "",
    finalDecisionNote: plan.finalDecisionNote || "",
    finalStatusDate: plan.finalStatusDate || "",
    revisionRound: Number(plan.revisionRound || 0),
    publishForBusiness: Boolean(plan.publishForBusiness),
    businessIntroducedAt: plan.businessIntroducedAt || "",
    businessOpportunityPublished: Boolean(plan.businessOpportunityPublished),
    businessPublishedAt: plan.businessPublishedAt || "",
    businessOpportunityDetails: normalizeBusinessOpportunityDetails(
      plan.businessOpportunityDetails,
    ),
    resultsPublished: Boolean(plan.resultsPublished),
  };
}

function normalizePlans(plans) {
  if (!Array.isArray(plans)) {
    return [];
  }

  return plans.filter(Boolean).map(normalizePlan);
}

function readPlansFromStorageKey(key) {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [];
  }

  return normalizePlans(safeParseJson(storedValue, []));
}

function writePlansToStorage(plans) {
  const normalizedPlans = normalizePlans(plans);

  if (!canUseStorage()) {
    memoryPlans = normalizedPlans;
    return normalizedPlans;
  }

  window.localStorage.setItem(
    PLANS_STORAGE_KEY,
    JSON.stringify(normalizedPlans),
  );

  return normalizedPlans;
}

function readPlansFromStorage() {
  if (!canUseStorage()) {
    return memoryPlans;
  }

  return readPlansFromStorageKey(PLANS_STORAGE_KEY);
}

function sortPlansByNewest(plans) {
  return [...plans].sort((firstPlan, secondPlan) => {
    const firstTracking = Number(
      toEnglishDigits(firstPlan.trackingCode).match(/\d+$/)?.[0] || 0,
    );
    const secondTracking = Number(
      toEnglishDigits(secondPlan.trackingCode).match(/\d+$/)?.[0] || 0,
    );

    return secondTracking - firstTracking;
  });
}

function updatePlanCollection(planId, updater) {
  const plans = getPlans();
  let updatedPlan = null;

  const updatedPlans = plans.map((plan) => {
    if (String(plan.id) !== String(planId)) {
      return plan;
    }

    updatedPlan = normalizePlan(updater(plan));
    return updatedPlan;
  });

  writePlansToStorage(updatedPlans);

  return updatedPlan;
}

export function getPlans() {
  return sortPlansByNewest(readPlansFromStorage());
}

export function setPlans(plans) {
  return writePlansToStorage(plans);
}

export function getPlanById(planId) {
  return getPlans().find((plan) => String(plan.id) === String(planId)) || null;
}

export function getPlansByInnovatorId(innovatorId) {
  return getPlans().filter(
    (plan) => String(plan.innovatorId) === String(innovatorId),
  );
}

export function getPlansByCallId(callId) {
  return getPlans().filter((plan) => String(plan.callId) === String(callId));
}

export function addPlan(planData = {}) {
  const plans = getPlans();
  const today = getTodayPersianDate();

  const newPlan = normalizePlan({
    ...planData,
    id: planData.id || makeId(),
    trackingCode: planData.trackingCode || createTrackingCode(),
    status: planData.status || PLAN_STATUS.SUBMITTED,
    currentReviewStatus:
      planData.currentReviewStatus || PLAN_REVIEW_STATUS.PENDING,
    finalStatus: planData.finalStatus || PLAN_FINAL_STATUS.NONE,
    submittedAt: planData.submittedAt || today,
    updatedAt: planData.updatedAt || today,
    publishForBusiness: false,
    businessIntroducedAt: "",
    businessOpportunityPublished: false,
    businessPublishedAt: "",
    businessOpportunityDetails: {},
    resultsPublished: false,
  });

  writePlansToStorage([newPlan, ...plans]);
  notifyReviewersNewPlan(newPlan);

  return newPlan;
}

export function updatePlan(planId, updates = {}) {
  const today = getTodayPersianDate();

  return updatePlanCollection(planId, (plan) => ({
    ...plan,
    ...updates,
    id: plan.id,
    trackingCode: updates.trackingCode || plan.trackingCode,
    innovatorId: updates.innovatorId || plan.innovatorId,
    submittedAt: updates.submittedAt || plan.submittedAt,
    updatedAt: updates.updatedAt || today,
  }));
}

export function deletePlan(planId) {
  const plans = getPlans();
  const updatedPlans = plans.filter(
    (plan) => String(plan.id) !== String(planId),
  );

  writePlansToStorage(updatedPlans);

  return updatedPlans;
}

export function markPlanFinalReviewStarted(planId) {
  const plan = getPlanById(planId);

  if (!plan || !isEmptyFinalStatus(plan.finalStatus) || plan.resultsPublished) {
    return plan;
  }

  const updatedPlan = updatePlan(planId, {
    status: PLAN_STATUS.UNDER_REVIEW,
    currentReviewStatus: PLAN_REVIEW_STATUS.PENDING,
  });

  if (updatedPlan) {
    notifyInnovatorPlanReviewStarted(updatedPlan);
    notifyReviewersFinalReviewStarted(updatedPlan);
  }

  return updatedPlan;
}

export function resubmitPlanRevision(planId, updates = {}) {
  const plan = getPlanById(planId);

  if (
    !plan ||
    !plan.resultsPublished ||
    !isNeedsRevisionFinalStatus(plan.finalStatus)
  ) {
    return plan;
  }

  const nextRevisionRound = Number(plan.revisionRound || 0) + 1;

  resetPlanEvaluationSideEffects(planId);

  const updatedPlan = updatePlan(planId, {
    ...updates,
    status: PLAN_STATUS.SUBMITTED,
    currentReviewStatus: PLAN_REVIEW_STATUS.PENDING,
    finalStatus: PLAN_FINAL_STATUS.NONE,
    committeeFeedback: "",
    committeeReviewRecommendation: "",
    committeeReviewScore: "",
    finalDecisionNote: "",
    finalStatusDate: "",
    publishForBusiness: false,
    businessIntroducedAt: "",
    businessOpportunityPublished: false,
    businessPublishedAt: "",
    businessOpportunityDetails: {},
    resultsPublished: false,
    submittedAt: getTodayPersianDate(),
    updatedAt: getTodayPersianDate(),
    revisionRound: nextRevisionRound,
  });

  if (updatedPlan) {
    addNotificationOnce({
      targetRole: "reviewer",
      title: "طرح اصلاح‌شده برای بررسی مجدد",
      body: `طرح «${updatedPlan.title}» پس از اصلاح فناور دوباره برای داوری ارسال شد.`,
      category: "داوری",
      sourceType: "plan",
      sourceId: updatedPlan.id,
      eventKey: `reviewer-plan-revision-resubmitted-${updatedPlan.id}-${nextRevisionRound}`,
      isImportant: true,
    });
  }

  return updatedPlan;
}

export function savePlanBusinessOpportunityDetails(planId, details = {}) {
  const normalizedDetails = normalizeBusinessOpportunityDetails({
    ...details,
    updatedAt: getTodayPersianDate(),
  });

  return updatePlan(planId, {
    businessOpportunityDetails: normalizedDetails,
  });
}

export function publishPlanBusinessOpportunity(planId) {
  const plan = getPlanById(planId);

  if (!plan || !plan.resultsPublished || !plan.publishForBusiness) {
    return plan;
  }

  const details = normalizeBusinessOpportunityDetails(
    plan.businessOpportunityDetails,
  );

  if (!details.updatedAt) {
    return plan;
  }

  const wasAlreadyPublished = Boolean(plan.businessOpportunityPublished);

  const updatedPlan = updatePlan(planId, {
    businessOpportunityPublished: true,
    businessPublishedAt: plan.businessPublishedAt || getTodayPersianDate(),
  });

  if (updatedPlan && !wasAlreadyPublished) {
    notifyBusinessPartnersNewOpportunity(updatedPlan);

    if (updatedPlan.innovatorId) {
      addNotificationOnce({
        targetUserId: updatedPlan.innovatorId,
        targetRole: "innovator",
        title: "موقعیت همکاری تجاری منتشر شد",
        body: `اطلاعات همکاری تجاری طرح «${updatedPlan.title}» در پنل همکاران تجاری منتشر شد.`,
        category: "همکاری تجاری",
        sourceType: "plan",
        sourceId: updatedPlan.id,
        eventKey: `innovator-business-opportunity-published-${updatedPlan.id}-${updatedPlan.revisionRound || 0}`,
        isImportant: true,
      });
    }
  }

  return updatedPlan;
}

export function updatePlanReviewStatus(planId, currentReviewStatus) {
  return updatePlan(planId, {
    currentReviewStatus,
    status:
      currentReviewStatus === PLAN_REVIEW_STATUS.REVIEWED ||
      currentReviewStatus === "بررسی شده"
        ? PLAN_STATUS.REVIEWED
        : PLAN_STATUS.UNDER_REVIEW,
  });
}

export function saveCommitteePlanFeedback(planId, feedbackText, options = {}) {
  return updatePlan(planId, {
    committeeFeedback: feedbackText,
    committeeReviewRecommendation: options.recommendation || "",
    committeeReviewScore: options.score || "",
    currentReviewStatus: PLAN_REVIEW_STATUS.REVIEWED,
    status: PLAN_STATUS.REVIEWED,
  });
}

export function deleteCommitteePlanFeedback(planId) {
  return updatePlan(planId, {
    committeeFeedback: "",
    committeeReviewRecommendation: "",
    committeeReviewScore: "",
    currentReviewStatus: PLAN_REVIEW_STATUS.PENDING,
    status: PLAN_STATUS.SUBMITTED,
  });
}

export function savePlanFinalDecision(
  planId,
  finalStatus,
  finalDecisionNote = "",
  options = {},
) {
  const updatedPlan = updatePlan(planId, {
    finalStatus,
    finalDecisionNote,
    committeeFeedback: finalDecisionNote,
    currentReviewStatus: PLAN_REVIEW_STATUS.REVIEWED,
    status: PLAN_STATUS.REVIEWED,
    finalStatusDate: getTodayPersianDate(),
    publishForBusiness: Boolean(options.publishForBusiness),
    businessIntroducedAt: "",
    businessOpportunityPublished: false,
    businessPublishedAt: "",
    businessOpportunityDetails: {},
    resultsPublished: false,
  });

  if (updatedPlan) {
    notifyInnovatorFinalDecision(updatedPlan);

    syncPlanFinalDecisionToSupabase({
      planId: updatedPlan.id,
      finalStatus: updatedPlan.finalStatus,
      finalDecisionNote: updatedPlan.finalDecisionNote,
      resultsPublished: updatedPlan.resultsPublished,
    });
  }

  return updatedPlan;
}

export function publishPlanResults(planIds = []) {
  const plans = getPlans();
  const targetIds = new Set(planIds.map((planId) => String(planId)));
  const plansToNotify = [];

  const updatedPlans = plans.map((plan) => {
    if (targetIds.size && !targetIds.has(String(plan.id))) {
      return plan;
    }

    if (isEmptyFinalStatus(plan.finalStatus)) {
      return plan;
    }

    if (!plan.resultsPublished) {
      plansToNotify.push(plan);
    }

    return normalizePlan({
      ...plan,
      businessIntroducedAt: plan.publishForBusiness
        ? plan.businessIntroducedAt || getTodayPersianDate()
        : plan.businessIntroducedAt || "",
      resultsPublished: true,
    });
  });

  writePlansToStorage(updatedPlans);

  const publishedPlanIds = updatedPlans
    .filter((plan) => !isEmptyFinalStatus(plan.finalStatus))
    .map((plan) => plan.id);

  syncPlanResultsPublicationToSupabase(publishedPlanIds);

  plansToNotify.forEach((plan) => {
    const publishedPlan = {
      ...plan,
      businessIntroducedAt: plan.publishForBusiness
        ? plan.businessIntroducedAt || getTodayPersianDate()
        : plan.businessIntroducedAt || "",
      resultsPublished: true,
    };

    notifyInnovatorResultsPublished(publishedPlan);
    notifyReviewersResultsPublished(publishedPlan);

    if (publishedPlan.publishForBusiness) {
      notifyInnovatorBusinessIntroduction(publishedPlan);
    }
  });

  return updatedPlans;
}

export function getAcceptedPlans() {
  return getPlans().filter((plan) =>
    [
      PLAN_FINAL_STATUS.ACCEPTED,
      PLAN_FINAL_STATUS.WEAK_ACCEPTED,
      "قبول",
      "قبول ضعیف",
      "accepted",
      "weakAccepted",
      "weak_accepted",
    ].includes(plan.finalStatus),
  );
}

export function getPublishedAcceptedPlans() {
  return getAcceptedPlans().filter((plan) => plan.resultsPublished);
}

export function getBusinessPublishedPlans() {
  return getPlans().filter(
    (plan) =>
      plan.resultsPublished &&
      plan.publishForBusiness &&
      plan.businessOpportunityPublished,
  );
}

export function getPlanStats() {
  const plans = getPlans();

  const pendingCommitteeReview = plans.filter(
    (plan) =>
      plan.currentReviewStatus !== PLAN_REVIEW_STATUS.REVIEWED &&
      plan.currentReviewStatus !== "بررسی شده" &&
      plan.status !== PLAN_STATUS.REVIEWED,
  ).length;

  const reviewedByCommittee = plans.filter(
    (plan) =>
      plan.currentReviewStatus === PLAN_REVIEW_STATUS.REVIEWED ||
      plan.currentReviewStatus === "بررسی شده" ||
      plan.status === PLAN_STATUS.REVIEWED,
  ).length;

  const withoutFinalStatus = plans.filter((plan) =>
    isEmptyFinalStatus(plan.finalStatus),
  ).length;

  const accepted = plans.filter((plan) =>
    [PLAN_FINAL_STATUS.ACCEPTED, "قبول", "accepted"].includes(plan.finalStatus),
  ).length;

  const weakAccepted = plans.filter((plan) =>
    [
      PLAN_FINAL_STATUS.WEAK_ACCEPTED,
      "قبول ضعیف",
      "weakAccepted",
      "weak_accepted",
    ].includes(plan.finalStatus),
  ).length;

  const rejected = plans.filter((plan) =>
    [PLAN_FINAL_STATUS.REJECTED, "رد", "rejected"].includes(plan.finalStatus),
  ).length;

  const weakRejected = plans.filter((plan) =>
    [
      PLAN_FINAL_STATUS.WEAK_REJECTED,
      "رد ضعیف",
      "weakRejected",
      "weak_rejected",
    ].includes(plan.finalStatus),
  ).length;

  const needsRevision = plans.filter((plan) =>
    [
      PLAN_FINAL_STATUS.NEEDS_REVISION,
      "نیازمند اصلاح",
      "needsRevision",
      "needs_revision",
    ].includes(plan.finalStatus),
  ).length;

  const publishedResults = plans.filter((plan) => plan.resultsPublished).length;

  const businessPublished = plans.filter(
    (plan) =>
      plan.resultsPublished &&
      plan.publishForBusiness &&
      plan.businessOpportunityPublished,
  ).length;

  return {
    total: plans.length,
    pendingCommitteeReview,
    reviewedByCommittee,
    withoutFinalStatus,
    accepted,
    weakAccepted,
    rejected,
    weakRejected,
    needsRevision,
    publishedResults,
    businessPublished,
  };
}

export function clearPlans() {
  writePlansToStorage([]);
  return [];
}

export function resetPlans() {
  writePlansToStorage([]);
  return [];
}

export { PLANS_STORAGE_KEY };
