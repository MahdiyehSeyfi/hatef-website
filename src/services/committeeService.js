import { USER_ROLES } from "../constants/roles";
import { getUsers } from "./authService";
import { getCalls } from "./callService";
import { getPlans, getAcceptedPlans, getPlanStats } from "./planService";
import {
  getAverageScoreByPlanId,
  getReviews,
  getReviewsByPlanId,
} from "./reviewService";
import { getTasksByPlanId } from "./taskService";

import {
  CALL_STATUS,
  CALL_STATUS_LABELS,
  PLAN_FINAL_STATUS,
  PLAN_FINAL_STATUS_LABELS,
  PLAN_REVIEW_STATUS,
  PLAN_REVIEW_STATUS_LABELS,
  PLAN_STATUS_LABELS,
  REVIEW_RECOMMENDATION_LABELS,
  TASK_STATUS_LABELS,
} from "../constants/statuses";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function isReviewerUser(user) {
  return (
    user?.role === USER_ROLES.REVIEWER ||
    user?.role === "reviewer" ||
    user?.role === "داور"
  );
}

function getCommitteeCallStatus(callStatus) {
  if (callStatus === CALL_STATUS.PUBLISHED) {
    return "منتشر شده";
  }

  return CALL_STATUS_LABELS[callStatus] || "نامشخص";
}

function getCommitteePlanReviewStatus(plan) {
  const status = plan.currentReviewStatus;

  if (status === "بررسی شده") {
    return "بررسی شده";
  }

  if (status === "در انتظار بررسی") {
    return "در انتظار بررسی";
  }

  if (status === PLAN_REVIEW_STATUS.REVIEWED || status === "reviewed") {
    return "بررسی شده";
  }

  return PLAN_REVIEW_STATUS_LABELS[status] || "در انتظار بررسی";
}

function getCommitteeFinalStatus(plan) {
  const status = plan.finalStatus;

  if (!status || status === PLAN_FINAL_STATUS.NONE || status === "none") {
    return "";
  }

  const persianStatusMap = {
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

  return persianStatusMap[status] || PLAN_FINAL_STATUS_LABELS[status] || status;
}

function getReviewerDisplayName(reviewer) {
  return (
    reviewer?.fullName ||
    `${reviewer?.firstName || ""} ${reviewer?.lastName || ""}`.trim() ||
    reviewer?.name ||
    "داور"
  );
}

function getPlanInnovator(plan) {
  const users = getUsers();
  return users.find((user) => user.id === plan.innovatorId) || null;
}

function getReviewerPossibleIds(reviewer, reviewerIndex = 0) {
  const orderNumber = reviewerIndex + 1;
  const paddedOrderNumber = String(orderNumber).padStart(3, "0");

  return new Set(
    [
      reviewer?.id,
      reviewer?.userId,
      reviewer?.email,
      `reviewer-${orderNumber}`,
      `user-reviewer-${orderNumber}`,
      `reviewer-${paddedOrderNumber}`,
      `user-reviewer-${paddedOrderNumber}`,
    ]
      .filter(Boolean)
      .map((value) => String(value)),
  );
}

function getReviewerPossibleIdsList(reviewers) {
  return reviewers.flatMap((reviewer, reviewerIndex) =>
    Array.from(getReviewerPossibleIds(reviewer, reviewerIndex)),
  );
}

function doesReviewBelongToReviewer(
  review,
  reviewer,
  reviewerIndex,
  reviewers,
) {
  const reviewReviewerId = String(review?.reviewerId || "");
  const reviewerIds = getReviewerPossibleIds(reviewer, reviewerIndex);

  if (reviewerIds.has(reviewReviewerId)) {
    return true;
  }

  const knownReviewerIds = new Set(getReviewerPossibleIdsList(reviewers));

  if (reviewers.length === 1 && !knownReviewerIds.has(reviewReviewerId)) {
    return true;
  }

  return false;
}

function getReviewerByReviewId(reviewerId) {
  const users = getUsers();
  const reviewers = users.filter(isReviewerUser);
  const normalizedReviewerId = String(reviewerId || "");

  const exactReviewer = reviewers.find(
    (reviewer) => String(reviewer.id) === normalizedReviewerId,
  );

  if (exactReviewer) {
    return exactReviewer;
  }

  return (
    reviewers.find((reviewer, reviewerIndex) =>
      getReviewerPossibleIds(reviewer, reviewerIndex).has(normalizedReviewerId),
    ) || null
  );
}

function getReviewerFeedbackSummary(planId) {
  const reviews = getReviewsByPlanId(planId);

  if (!reviews.length) {
    return null;
  }

  const latestReview = reviews[0];

  return {
    text: latestReview.feedbackText,
    createdAt: latestReview.createdAt,
    score: latestReview.score,
    recommendation:
      REVIEW_RECOMMENDATION_LABELS[latestReview.recommendation] ||
      "بازخورد ثبت‌شده",
  };
}

function createFallbackReviewerProfiles(reviews) {
  const reviewerIds = Array.from(
    new Set(reviews.map((review) => review.reviewerId).filter(Boolean)),
  );

  return reviewerIds.map((reviewerId, index) => ({
    id: reviewerId,
    fullName: `داور ${toPersianNumber(index + 1)}`,
    role: USER_ROLES.REVIEWER,
    expertise: "ارزیابی طرح‌های فناورانه",
    email: "ثبت نشده",
    mobile: "ثبت نشده",
    organization: "ثبت نشده",
  }));
}

function getCommitteeReviewers() {
  const users = getUsers();
  const reviews = getReviews();

  const reviewerUsers = users.filter(isReviewerUser);

  if (!reviewerUsers.length) {
    return createFallbackReviewerProfiles(reviews);
  }

  const knownReviewerIds = new Set(getReviewerPossibleIdsList(reviewerUsers));

  const unknownReviewerIds = Array.from(
    new Set(
      reviews
        .map((review) => review.reviewerId)
        .filter(
          (reviewerId) =>
            reviewerId && !knownReviewerIds.has(String(reviewerId)),
        ),
    ),
  );

  const fallbackReviewers = unknownReviewerIds.map((reviewerId, index) => ({
    id: reviewerId,
    fullName: `داور ثبت‌شده ${toPersianNumber(index + 1)}`,
    role: USER_ROLES.REVIEWER,
    expertise: "ارزیابی طرح‌های فناورانه",
    email: "ثبت نشده",
    mobile: "ثبت نشده",
    organization: "ثبت نشده",
  }));

  return [...reviewerUsers, ...fallbackReviewers];
}

export function getCommitteeCalls() {
  return getCalls().map((call, index) => ({
    id: call.id,
    number: toPersianNumber(index + 1),
    title: call.title,
    category: call.field ? `با محوریت ${call.field}` : "فراخوان برنامه هاتف",
    deadline: call.deadlineDate,
    deadlineTime: call.deadlineTime,
    heroDescription: call.description,
    moreTitle: "توضیحات تکمیلی فراخوان",
    moreDescription: call.moreDescription,
    pdfFileName: call.pdfFileUrl ? "call-file.pdf" : "",
    bannerPreview: "",
    isAnnualTheme: false,
    faqs: [],
    status: getCommitteeCallStatus(call.status),
    createdAt: call.createdAt,
    publishedAt: call.publishedAt,
    year: call.createdAt?.slice(0, 4) || "1405",
    sourceId: call.id,
  }));
}

export function getCommitteePlans() {
  return getPlans().map((plan, index) => {
    const reviews = getReviewsByPlanId(plan.id);
    const reviewerFeedback = getReviewerFeedbackSummary(plan.id);
    const averageScore = getAverageScoreByPlanId(plan.id);
    const finalStatus = getCommitteeFinalStatus(plan);
    const innovator = getPlanInnovator(plan);
    const committeeReviewStatus = getCommitteePlanReviewStatus(plan);
    const committeeFeedbackText =
      plan.committeeFeedback || plan.finalDecisionNote || "";

    return {
      id: plan.id,
      trackingId: plan.trackingCode,
      title: plan.title,
      field: plan.field,
      call: plan.callId,
      innovator: {
        name: innovator?.fullName || "فناور ثبت‌کننده طرح",
        organization: innovator?.organization || "تیم فناور",
        phone: innovator?.mobile || "ثبت نشده",
        email: innovator?.email || "ثبت نشده",
      },
      sentAt: plan.submittedAt,
      deadline: plan.updatedAt,
      reviewerStatus: reviews.length ? "بررسی شده" : "در انتظار بررسی",
      folders: [],
      reviewerScore: averageScore || "",
      reviewerRecommendation: reviewerFeedback?.recommendation || "",
      reviewerFeedback,
      committeeReviewStatus,
      committeeReviewScore: plan.committeeReviewScore || "",
      committeeReviewRecommendation:
        plan.committeeReviewRecommendation ||
        (committeeFeedbackText ? "بازخورد دبیرخانه ثبت شده" : ""),
      committeeReviewFeedback: committeeFeedbackText
        ? {
            text: committeeFeedbackText,
            createdAt: plan.updatedAt,
          }
        : null,
      committeeFeedback: plan.finalDecisionNote || plan.committeeFeedback || "",
      finalStatus,
      finalStatusDate: finalStatus
        ? plan.finalStatusDate || plan.updatedAt
        : "",
      resultsPublished: Boolean(plan.resultsPublished),
      proposalFile: plan.proposalFileUrl || "",
      sourceId: plan.id,
      orderNumber: index + 1,
      originalStatus: PLAN_STATUS_LABELS[plan.status] || "",
    };
  });
}

export function getCommitteeAcceptedPlans() {
  return getAcceptedPlans().map((plan, index) => ({
    id: plan.id,
    trackingId: plan.trackingCode,
    title: plan.title,
    field: plan.field,
    finalStatus: getCommitteeFinalStatus(plan) || "قبول",
    finalStatusDate: plan.finalStatusDate || plan.updatedAt,
    deadline: plan.updatedAt,
    proposalFile: plan.proposalFileUrl || "",
    sourceId: plan.id,
    orderNumber: index + 1,
  }));
}

export function getCommitteeTasksByPlanId(planId) {
  return getTasksByPlanId(planId).map((task) => ({
    id: task.id,
    title: task.title,
    deadline: `${task.deadlineDate} - ساعت ${task.deadlineTime}`,
    managerMessage: task.managerMessage,
    userDescription: task.innovatorResponseText,
    userFileName: task.innovatorFileUrl,
    participantStatus:
      TASK_STATUS_LABELS[task.status] || "در انتظار بررسی فناور",
    managerFeedback: task.managerFeedback,
    managerDecision: task.status,
    createdAt: task.createdAt,
    sourceId: task.id,
  }));
}

export function getCommitteeReviewerProfiles() {
  const reviewers = getCommitteeReviewers();
  const plans = getPlans();
  const reviews = getReviews();

  return reviewers.map((reviewer, reviewerIndex) => {
    const reviewerReviews = reviews.filter((review) =>
      doesReviewBelongToReviewer(review, reviewer, reviewerIndex, reviewers),
    );

    const reviewedPlanIds = new Set(
      reviewerReviews.map((review) => String(review.planId)),
    );

    const assignedPlansCount = plans.length;
    const reviewedPlansCount = reviewedPlanIds.size;
    const remainingPlans = Math.max(assignedPlansCount - reviewedPlansCount, 0);

    return {
      id: reviewer.id,
      name: getReviewerDisplayName(reviewer),
      role: "داور تخصصی",
      specialty: reviewer.expertise || "ارزیابی طرح‌های فناورانه",
      email: reviewer.email || "ثبت نشده",
      phone: reviewer.mobile || "ثبت نشده",
      organization: reviewer.organization || "ثبت نشده",
      stats: {
        assignedPlans: assignedPlansCount,
        reviewedPlans: reviewedPlansCount,
        feedbacks: reviewerReviews.length,
        remainingPlans,
      },
    };
  });
}

export function getCommitteeReviewerFeedbackPlans() {
  const reviewers = getCommitteeReviewers();

  return getPlans()
    .map((plan) => {
      const reviews = getReviewsByPlanId(plan.id);
      const innovator = getPlanInnovator(plan);

      return {
        id: plan.id,
        trackingId: plan.trackingCode,
        title: plan.title,
        field: plan.field,
        call: plan.callId,
        innovator: {
          name: innovator?.fullName || "فناور ثبت‌کننده طرح",
          organization: innovator?.organization || "ثبت نشده",
        },
        reviewerFeedbacks: reviews.map((review) => {
          const reviewer =
            getReviewerByReviewId(review.reviewerId) ||
            reviewers.find((item, reviewerIndex) =>
              getReviewerPossibleIds(item, reviewerIndex).has(
                String(review.reviewerId),
              ),
            );

          return {
            id: review.id,
            reviewerId: review.reviewerId,
            reviewerName: getReviewerDisplayName(reviewer),
            reviewerRole: reviewer?.expertise || "داور تخصصی",
            specialty: reviewer?.expertise || "ارزیابی طرح فناورانه",
            score: review.score,
            recommendation:
              REVIEW_RECOMMENDATION_LABELS[review.recommendation] ||
              "بازخورد ثبت‌شده",
            createdAt: review.createdAt,
            text: review.feedbackText,
          };
        }),
      };
    })
    .filter((plan) => plan.reviewerFeedbacks.length > 0);
}

export function getCommitteeDashboardStats() {
  const plans = getCommitteePlans();
  const calls = getCommitteeCalls();
  const planStats = getPlanStats();

  return {
    callsCount: calls.length,
    publishedCalls: calls.filter((call) => call.status === "منتشر شده").length,
    plansCount: plans.length,
    pendingCommitteePlans: planStats.pendingCommitteeReview,
    reviewedCommitteePlans: planStats.reviewedByCommittee,
    withoutFinalStatus: planStats.withoutFinalStatus,
    acceptedPlans: planStats.accepted + planStats.weakAccepted,
    publishedResults: planStats.publishedResults,
  };
}
