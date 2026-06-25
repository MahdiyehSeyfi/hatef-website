export const CALL_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

export const CALL_STATUS_LABELS = {
  [CALL_STATUS.DRAFT]: "پیش‌نویس",
  [CALL_STATUS.PUBLISHED]: "منتشر شده",
  [CALL_STATUS.INACTIVE]: "غیرفعال",
  [CALL_STATUS.ARCHIVED]: "آرشیو شده",
};

export const PLAN_STATUS = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  REVIEWED: "reviewed",
  ACCEPTED: "accepted",
  WEAK_ACCEPTED: "weak_accepted",
  REJECTED: "rejected",
  WEAK_REJECTED: "weak_rejected",
  NEEDS_REVISION: "needs_revision",
};

export const PLAN_STATUS_LABELS = {
  [PLAN_STATUS.SUBMITTED]: "ثبت شده",
  [PLAN_STATUS.UNDER_REVIEW]: "در حال بررسی",
  [PLAN_STATUS.REVIEWED]: "بررسی شده",
  [PLAN_STATUS.ACCEPTED]: "قبول",
  [PLAN_STATUS.WEAK_ACCEPTED]: "قبول ضعیف",
  [PLAN_STATUS.REJECTED]: "رد",
  [PLAN_STATUS.WEAK_REJECTED]: "رد ضعیف",
  [PLAN_STATUS.NEEDS_REVISION]: "نیازمند اصلاح",
};

export const PLAN_REVIEW_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
};

export const PLAN_REVIEW_STATUS_LABELS = {
  [PLAN_REVIEW_STATUS.PENDING]: "در انتظار بررسی",
  [PLAN_REVIEW_STATUS.REVIEWED]: "بررسی شده",
};

export const PLAN_FINAL_STATUS = {
  NONE: "none",
  ACCEPTED: "accepted",
  WEAK_ACCEPTED: "weak_accepted",
  REJECTED: "rejected",
  WEAK_REJECTED: "weak_rejected",
  NEEDS_REVISION: "needs_revision",
};

export const PLAN_FINAL_STATUS_LABELS = {
  [PLAN_FINAL_STATUS.NONE]: "بدون وضعیت نهایی",
  [PLAN_FINAL_STATUS.ACCEPTED]: "قبول",
  [PLAN_FINAL_STATUS.WEAK_ACCEPTED]: "قبول ضعیف",
  [PLAN_FINAL_STATUS.REJECTED]: "رد",
  [PLAN_FINAL_STATUS.WEAK_REJECTED]: "رد ضعیف",
  [PLAN_FINAL_STATUS.NEEDS_REVISION]: "نیازمند اصلاح",
};

export const REVIEW_RECOMMENDATION = {
  ACCEPT: "accept",
  WEAK_ACCEPT: "weak_accept",
  REJECT: "reject",
  WEAK_REJECT: "weak_reject",
  NEEDS_REVISION: "needs_revision",
};

export const REVIEW_RECOMMENDATION_LABELS = {
  [REVIEW_RECOMMENDATION.ACCEPT]: "پیشنهاد قبول",
  [REVIEW_RECOMMENDATION.WEAK_ACCEPT]: "پیشنهاد قبول ضعیف",
  [REVIEW_RECOMMENDATION.REJECT]: "پیشنهاد رد",
  [REVIEW_RECOMMENDATION.WEAK_REJECT]: "پیشنهاد رد ضعیف",
  [REVIEW_RECOMMENDATION.NEEDS_REVISION]: "پیشنهاد اصلاح",
};

export const TASK_STATUS = {
  WAITING_FOR_INNOVATOR_REVIEW: "waiting_for_innovator_review",
  VIEWED_BY_INNOVATOR: "viewed_by_innovator",
  ANSWERED_BY_INNOVATOR: "answered_by_innovator",
  NEEDS_REVISION: "needs_revision",
  FINISHED: "finished",
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.WAITING_FOR_INNOVATOR_REVIEW]: "در انتظار بررسی فناور",
  [TASK_STATUS.VIEWED_BY_INNOVATOR]: "مشاهده شده",
  [TASK_STATUS.ANSWERED_BY_INNOVATOR]: "پاسخ داده شده",
  [TASK_STATUS.NEEDS_REVISION]: "نیازمند اصلاح",
  [TASK_STATUS.FINISHED]: "پایان‌یافته",
};
