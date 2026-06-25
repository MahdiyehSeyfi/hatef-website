import { USER_ROLES } from "../constants/roles";
import { getUsers } from "./authService";
import { getCalls } from "./callService";
import { getPlans, getAcceptedPlans, getPlanStats } from "./planService";
import { getAverageScoreByPlanId, getReviewsByPlanId } from "./reviewService";
import { getTasksByPlanId } from "./taskService";

import {
  CALL_STATUS,
  CALL_STATUS_LABELS,
  PLAN_FINAL_STATUS,
  PLAN_FINAL_STATUS_LABELS,
  PLAN_REVIEW_STATUS_LABELS,
  PLAN_STATUS_LABELS,
  REVIEW_RECOMMENDATION_LABELS,
  TASK_STATUS_LABELS,
} from "../constants/statuses";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function getCommitteeCallStatus(callStatus) {
  if (callStatus === CALL_STATUS.PUBLISHED) {
    return "منتشر شده";
  }

  return CALL_STATUS_LABELS[callStatus] || "نامشخص";
}

function getCommitteePlanReviewStatus(plan) {
  return (
    PLAN_REVIEW_STATUS_LABELS[plan.currentReviewStatus] || "در انتظار بررسی"
  );
}

function getCommitteeFinalStatus(plan) {
  if (!plan.finalStatus || plan.finalStatus === PLAN_FINAL_STATUS.NONE) {
    return "";
  }

  return PLAN_FINAL_STATUS_LABELS[plan.finalStatus] || "";
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

function getReviewerDisplayName(reviewer) {
  return (
    reviewer?.fullName ||
    `${reviewer?.firstName || ""} ${reviewer?.lastName || ""}`.trim() ||
    "داور"
  );
}

function getPlanInnovator(plan) {
  const users = getUsers();

  return users.find((user) => user.id === plan.innovatorId) || null;
}

function getReviewerById(reviewerId) {
  return getUsers().find((user) => user.id === reviewerId) || null;
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
      committeeReviewStatus: getCommitteePlanReviewStatus(plan),
      committeeReviewScore: "",
      committeeReviewRecommendation: plan.committeeFeedback
        ? "بازخورد دبیرخانه ثبت شده"
        : "",
      committeeReviewFeedback: plan.committeeFeedback
        ? {
            text: plan.committeeFeedback,
            createdAt: plan.updatedAt,
          }
        : null,
      committeeFeedback: plan.finalDecisionNote || "",
      finalStatus,
      finalStatusDate: finalStatus ? plan.updatedAt : "",
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
    finalStatus: PLAN_FINAL_STATUS_LABELS[plan.finalStatus] || "قبول شده",
    finalStatusDate: plan.updatedAt,
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
  const users = getUsers();
  const plans = getPlans();

  const reviews = plans.flatMap((plan) =>
    getReviewsByPlanId(plan.id).map((review) => ({
      ...review,
      plan,
    })),
  );

  return users
    .filter((user) => user.role === USER_ROLES.REVIEWER)
    .map((reviewer) => {
      const reviewerReviews = reviews.filter(
        (review) => review.reviewerId === reviewer.id,
      );

      const reviewedPlanIds = new Set(
        reviewerReviews.map((review) => review.planId),
      );

      const assignedPlansCount = plans.length;

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
          reviewedPlans: reviewedPlanIds.size,
          feedbacks: reviewerReviews.length,
          remainingPlans: Math.max(
            assignedPlansCount - reviewedPlanIds.size,
            0,
          ),
        },
      };
    });
}

export function getCommitteeReviewerFeedbackPlans() {
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
          const reviewer = getReviewerById(review.reviewerId);

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
