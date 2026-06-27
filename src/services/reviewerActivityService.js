import { getCurrentUser, getUserById } from "./authService";
import { getPlanById } from "./planService";
import { addNotificationOnce } from "./notificationService";

const REVIEWER_ACTIVITY_STORAGE_KEY = "hatef_reviewer_activity";

let memoryActivity = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function getNowText() {
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

function normalizeActivity(activity) {
  return {
    reviewerId: activity.reviewerId,
    viewedPlanIds: Array.isArray(activity.viewedPlanIds)
      ? activity.viewedPlanIds.map((planId) => String(planId))
      : [],
    viewedAtByPlanId:
      activity.viewedAtByPlanId && typeof activity.viewedAtByPlanId === "object"
        ? activity.viewedAtByPlanId
        : {},
    updatedAt: activity.updatedAt || getNowText(),
  };
}

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) {
    return [];
  }

  return activities
    .filter((activity) => activity && activity.reviewerId)
    .map(normalizeActivity);
}

function readActivities() {
  if (!canUseStorage()) {
    return memoryActivity;
  }

  const storedValue = window.localStorage.getItem(
    REVIEWER_ACTIVITY_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  return normalizeActivities(safeParseJson(storedValue, []));
}

function writeActivities(activities) {
  const normalizedActivities = normalizeActivities(activities);

  if (!canUseStorage()) {
    memoryActivity = normalizedActivities;
    return normalizedActivities;
  }

  window.localStorage.setItem(
    REVIEWER_ACTIVITY_STORAGE_KEY,
    JSON.stringify(normalizedActivities),
  );

  return normalizedActivities;
}

function getReviewerDisplayName(reviewerId) {
  const currentUser = getCurrentUser?.();

  if (currentUser && String(currentUser.id) === String(reviewerId)) {
    return (
      currentUser.fullName ||
      `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
      currentUser.name ||
      "داور"
    );
  }

  const reviewer = getUserById?.(reviewerId);

  return (
    reviewer?.fullName ||
    `${reviewer?.firstName || ""} ${reviewer?.lastName || ""}`.trim() ||
    reviewer?.name ||
    "داور"
  );
}

function notifyCommitteeReviewerViewedPlan(reviewerId, planId) {
  const plan = getPlanById(planId);

  if (!plan) {
    return;
  }

  const reviewerName = getReviewerDisplayName(reviewerId);

  addNotificationOnce({
    targetRole: "committee",
    title: "طرح توسط داور مشاهده شد",
    body: `${reviewerName} طرح «${plan.title}» را مشاهده کرد.`,
    category: "داوری",
    sourceType: "review",
    sourceId: plan.id,
    eventKey: `committee-reviewer-viewed-plan-${reviewerId}-${plan.id}`,
    isImportant: false,
  });
}

export function getReviewerViewedPlanIds(reviewerId) {
  const activity = readActivities().find(
    (item) => String(item.reviewerId) === String(reviewerId),
  );

  return new Set(activity?.viewedPlanIds || []);
}

export function getReviewerActivity(reviewerId) {
  return (
    readActivities().find(
      (activity) => String(activity.reviewerId) === String(reviewerId),
    ) || null
  );
}

export function markReviewerPlanViewed(reviewerId, planId) {
  const activities = readActivities();
  const normalizedReviewerId = String(reviewerId);
  const normalizedPlanId = String(planId);
  const existingActivity =
    activities.find(
      (activity) => String(activity.reviewerId) === normalizedReviewerId,
    ) || null;

  const currentViewedPlanIds = existingActivity?.viewedPlanIds || [];
  const wasAlreadyViewed = currentViewedPlanIds.includes(normalizedPlanId);
  const nextViewedPlanIds = Array.from(
    new Set([...currentViewedPlanIds, normalizedPlanId]),
  );

  const nextActivity = normalizeActivity({
    reviewerId,
    viewedPlanIds: nextViewedPlanIds,
    viewedAtByPlanId: {
      ...(existingActivity?.viewedAtByPlanId || {}),
      [normalizedPlanId]:
        existingActivity?.viewedAtByPlanId?.[normalizedPlanId] || getNowText(),
    },
    updatedAt: getNowText(),
  });

  const nextActivities = existingActivity
    ? activities.map((activity) =>
        String(activity.reviewerId) === normalizedReviewerId
          ? nextActivity
          : activity,
      )
    : [nextActivity, ...activities];

  writeActivities(nextActivities);

  if (!wasAlreadyViewed) {
    notifyCommitteeReviewerViewedPlan(reviewerId, planId);
  }

  return nextActivity;
}

export function clearReviewerActivity() {
  writeActivities([]);
  return [];
}

export { REVIEWER_ACTIVITY_STORAGE_KEY };
