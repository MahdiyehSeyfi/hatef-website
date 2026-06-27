import { getCurrentUser, getUserById } from "./authService";
import { getPlanById } from "./planService";
import { addNotification } from "./notificationService";

const REVIEWS_STORAGE_KEY = "hatef_reviews";

const DEFAULT_REVIEWS = [
  {
    id: "review-001",
    planId: "plan-001",
    reviewerId: "reviewer-001",
    score: 82,
    recommendation: "accepted",
    feedbackText:
      "طرح از نظر نوآوری و امکان اجرا قابل قبول است و برای ورود به مرحله بعد پیشنهاد می‌شود.",
    createdAt: "۱۴۰۵/۰۳/۱۰ - ساعت ۱۰:۳۰",
    updatedAt: "۱۴۰۵/۰۳/۱۰ - ساعت ۱۰:۳۰",
  },
];

let memoryReviews = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "review") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
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

function normalizeReview(review) {
  return {
    id: review.id || makeId(),
    planId: review.planId,
    reviewerId: review.reviewerId,
    score: Number(review.score || 0),
    recommendation: review.recommendation || "needsRevision",
    feedbackText:
      review.feedbackText || review.feedback || review.description || "",
    createdAt: review.createdAt || getNowText(),
    updatedAt: review.updatedAt || review.createdAt || getNowText(),
  };
}

function normalizeReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews
    .filter((review) => review && review.planId && review.reviewerId)
    .map(normalizeReview);
}

function readReviewsFromStorage() {
  if (!canUseStorage()) {
    if (!memoryReviews.length) {
      memoryReviews = normalizeReviews(DEFAULT_REVIEWS);
    }

    return memoryReviews;
  }

  const storedReviews = window.localStorage.getItem(REVIEWS_STORAGE_KEY);

  if (!storedReviews) {
    window.localStorage.setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify(normalizeReviews(DEFAULT_REVIEWS)),
    );

    return normalizeReviews(DEFAULT_REVIEWS);
  }

  const parsedReviews = safeParseJson(storedReviews, DEFAULT_REVIEWS);

  if (!Array.isArray(parsedReviews)) {
    window.localStorage.setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify(normalizeReviews(DEFAULT_REVIEWS)),
    );

    return normalizeReviews(DEFAULT_REVIEWS);
  }

  return normalizeReviews(parsedReviews);
}

function writeReviewsToStorage(reviews) {
  const normalizedReviews = normalizeReviews(reviews);

  if (!canUseStorage()) {
    memoryReviews = normalizedReviews;
    return normalizedReviews;
  }

  window.localStorage.setItem(
    REVIEWS_STORAGE_KEY,
    JSON.stringify(normalizedReviews),
  );

  return normalizedReviews;
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

function getRecommendationLabel(recommendation) {
  const labels = {
    accepted: "پیشنهاد قبول",
    weakAccepted: "پیشنهاد قبول ضعیف",
    weak_accepted: "پیشنهاد قبول ضعیف",
    rejected: "پیشنهاد رد",
    weakRejected: "پیشنهاد رد ضعیف",
    weak_rejected: "پیشنهاد رد ضعیف",
    needsRevision: "نیازمند اصلاح",
    needs_revision: "نیازمند اصلاح",
    "قابل بررسی در مرحله بعد": "قابل بررسی در مرحله بعد",
    "نیازمند اصلاح": "نیازمند اصلاح",
    "رد شود": "رد شود",
  };

  return labels[recommendation] || "بازخورد ثبت‌شده";
}

function notifyReviewSaved(review, actionType = "saved") {
  const plan = getPlanById(review.planId);
  const planTitle = plan?.title || "طرح";
  const reviewerName = getReviewerDisplayName(review.reviewerId);
  const recommendationLabel = getRecommendationLabel(review.recommendation);
  const isUpdate = actionType === "updated";

  addNotification({
    targetRole: "committee",
    title: isUpdate ? "بازخورد داور ویرایش شد" : "بازخورد داور ثبت شد",
    body: `${reviewerName} برای طرح «${planTitle}» بازخورد ثبت کرد. نتیجه پیشنهادی: ${recommendationLabel}`,
    category: "داوری",
    sourceType: "review",
    sourceId: review.id,
    isImportant: true,
  });

  addNotification({
    targetUserId: review.reviewerId,
    targetRole: "reviewer",
    title: isUpdate ? "بازخورد شما ویرایش شد" : "بازخورد شما ثبت شد",
    body: `بازخورد شما برای طرح «${planTitle}» با موفقیت ذخیره شد.`,
    category: "داوری",
    sourceType: "review",
    sourceId: review.id,
    isImportant: false,
  });
}

export function getReviews() {
  return readReviewsFromStorage();
}

export function setReviews(reviews) {
  return writeReviewsToStorage(reviews);
}

export function getReviewsByPlanId(planId) {
  return getReviews()
    .filter((review) => String(review.planId) === String(planId))
    .sort((firstReview, secondReview) =>
      String(secondReview.updatedAt).localeCompare(
        String(firstReview.updatedAt),
      ),
    );
}

export function getReviewsByReviewerId(reviewerId) {
  return getReviews()
    .filter((review) => String(review.reviewerId) === String(reviewerId))
    .sort((firstReview, secondReview) =>
      String(secondReview.updatedAt).localeCompare(
        String(firstReview.updatedAt),
      ),
    );
}

export function getReviewByReviewerAndPlan(reviewerId, planId) {
  return (
    getReviews().find(
      (review) =>
        String(review.reviewerId) === String(reviewerId) &&
        String(review.planId) === String(planId),
    ) || null
  );
}

export function addReview(reviewData) {
  const reviews = getReviews();

  const newReview = normalizeReview({
    ...reviewData,
    id: reviewData.id || makeId(),
    createdAt: reviewData.createdAt || getNowText(),
    updatedAt: reviewData.updatedAt || getNowText(),
  });

  writeReviewsToStorage([newReview, ...reviews]);

  return newReview;
}

export function updateReview(reviewId, reviewData) {
  const reviews = getReviews();
  let updatedReview = null;

  const updatedReviews = reviews.map((review) => {
    if (String(review.id) !== String(reviewId)) {
      return review;
    }

    updatedReview = normalizeReview({
      ...review,
      ...reviewData,
      id: review.id,
      createdAt: review.createdAt,
      updatedAt: getNowText(),
    });

    return updatedReview;
  });

  writeReviewsToStorage(updatedReviews);

  return updatedReview;
}

export function saveReview(reviewData) {
  const existingReview = getReviewByReviewerAndPlan(
    reviewData.reviewerId,
    reviewData.planId,
  );

  const savedReview = existingReview
    ? updateReview(existingReview.id, reviewData)
    : addReview(reviewData);

  if (savedReview) {
    notifyReviewSaved(savedReview, existingReview ? "updated" : "saved");
  }

  return savedReview;
}

export function upsertReview(reviewData) {
  return saveReview(reviewData);
}

export function deleteReview(reviewId) {
  const reviews = getReviews();
  const updatedReviews = reviews.filter(
    (review) => String(review.id) !== String(reviewId),
  );

  writeReviewsToStorage(updatedReviews);

  return updatedReviews;
}

export function getAverageScoreByPlanId(planId) {
  const planReviews = getReviewsByPlanId(planId);

  if (!planReviews.length) {
    return "";
  }

  const totalScore = planReviews.reduce(
    (sum, review) => sum + Number(review.score || 0),
    0,
  );

  return Math.round(totalScore / planReviews.length);
}

export function getReviewerStatsByReviewerId(reviewerId, plans = []) {
  const reviewerReviews = getReviewsByReviewerId(reviewerId);
  const reviewedPlanIds = new Set(
    reviewerReviews.map((review) => String(review.planId)),
  );

  return {
    assignedPlans: plans.length,
    reviewedPlans: reviewedPlanIds.size,
    feedbacks: reviewerReviews.length,
    remainingPlans: Math.max(plans.length - reviewedPlanIds.size, 0),
  };
}

export function clearReviews() {
  if (!canUseStorage()) {
    memoryReviews = [];
    return [];
  }

  window.localStorage.removeItem(REVIEWS_STORAGE_KEY);

  return [];
}

export { REVIEWS_STORAGE_KEY };
