import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import { getCurrentUser } from "../../services/authService";
import { getPublishedCalls, getCallById } from "../../services/callService";
import {
  addPlan,
  deletePlan as deletePlanFromService,
  getPlansByInnovatorId,
  publishPlanBusinessOpportunity,
  resubmitPlanRevision,
  savePlanBusinessOpportunityDetails,
  updatePlan,
} from "../../services/planService";
import { getBusinessCollaborationRequestStatsByPlanId } from "../../services/businessService";
import {
  COOPERATION_NEED_OPTIONS,
  INVESTMENT_NEED_OPTIONS,
  SITE_PUBLICATION_FIELD_OPTIONS,
  getSitePublicationRequestsByInnovator,
  saveSitePublicationDraft,
  saveSitePublicationPreviewItem,
  submitSitePublicationDraft,
  SITE_PUBLICATION_STATUS,
} from "../../services/projectPublicationService";
import { getCurrentUserActivityRegistrations } from "../../services/activityRegistrationService";
import { getParticipantNoticesForCurrentUserByActivityId } from "../../services/activityParticipantNoticeService";
import {
  getPublicCourseById,
  getPublicEventById,
} from "../../services/publicActivityService";
import { getReviewsByPlanId } from "../../services/reviewService";
import {
  getTasksWithPlanByInnovatorId,
  markTaskViewed,
  submitTaskResponse,
  updateTask as updateTaskInService,
} from "../../services/taskService";
import {
  PLAN_FINAL_STATUS,
  PLAN_REVIEW_STATUS,
  PLAN_STATUS,
  TASK_STATUS,
} from "../../constants/statuses";

import {
  addSupportTicket,
  deleteSupportTicket,
  getCurrentUserSupportTickets,
} from "../../services/supportService";
import {
  deleteAllNotificationsForCurrentUser,
  deleteNotification,
  getNotificationsForCurrentUser,
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsRead,
} from "../../services/notificationService";

import {
  getCurrentDashboardProfile,
  saveCurrentDashboardProfile,
} from "../../services/userProfileService";

import "./InnovatorDashboardPage.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: "🏠",
  },
  {
    id: "calls",
    label: "فراخوان‌ها",
    icon: "📣",
    subItems: [
      {
        id: "submit-plan",
        label: "طرح‌های من",
      },
      {
        id: "selected-plans",
        label: "طرح‌های انتخاب‌شده",
      },
      {
        id: "site-publication",
        label: "طرح‌های معرفی‌شده",
      },
    ],
  },
  {
    id: "my-activities",
    label: "دوره‌ها و رویدادهای من",
    icon: "🎓",
  },
  {
    id: "requests",
    label: "درخواست‌ها و پشتیبانی",
    icon: "🗂",
  },
  {
    id: "messages",
    label: "پیام‌ها و اعلانات",
    icon: "🔔",
  },
  {
    id: "faq",
    label: "سوالات متداول",
    icon: "❓",
  },
];

function formatCallDeadline(call) {
  if (!call?.deadlineDate && !call?.deadlineTime) {
    return "مهلت مشخص نشده";
  }

  if (call.deadlineDate && call.deadlineTime) {
    return `${call.deadlineDate} - ساعت ${call.deadlineTime}`;
  }

  return call.deadlineDate || call.deadlineTime;
}

function getCallOptionsForInnovator() {
  return getPublishedCalls().map((call) => ({
    id: call.id,
    title: call.title,
    field: call.field ? `با محوریت ${call.field}` : "فراخوان برنامه هاتف",
    deadline: formatCallDeadline(call),
    status: "فعال",
  }));
}

const CALL_OPTIONS = getCallOptionsForInnovator();

function getCurrentInnovatorUserId() {
  return getCurrentUser()?.id || "user-innovator-1";
}

function getPlanCallInfo(plan) {
  return getCallById(plan.callId);
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

  return statusMap[finalStatus] || "";
}

function isAcceptedFinalStatus(finalStatus) {
  return ["قبول", "قبول ضعیف"].includes(getFinalStatusLabel(finalStatus));
}

function isNeedsRevisionFinalStatus(finalStatus) {
  return getFinalStatusLabel(finalStatus) === "نیازمند اصلاح";
}

function getPlanStatusLabelFromCentralData(plan) {
  if (plan.resultsPublished) {
    return getFinalStatusLabel(plan.finalStatus) || "نتیجه نهایی منتشر شده";
  }

  if (plan.currentReviewStatus === PLAN_REVIEW_STATUS.REVIEWED) {
    return "داوری شده";
  }

  if (plan.status === PLAN_STATUS.REVIEWED) {
    return "داوری شده";
  }

  if (plan.status === PLAN_STATUS.UNDER_REVIEW) {
    return "در حال بررسی";
  }

  if (plan.status === PLAN_STATUS.SUBMITTED) {
    return "در انتظار بررسی";
  }

  return "دریافت شده";
}

function getTaskStatusLabelFromCentralData(status) {
  const statusMap = {
    [TASK_STATUS.WAITING_FOR_INNOVATOR_REVIEW]: "در انتظار ارسال",
    [TASK_STATUS.VIEWED_BY_INNOVATOR]: "مشاهده شده",
    [TASK_STATUS.ANSWERED_BY_INNOVATOR]: "ارسال شده",
    [TASK_STATUS.NEEDS_REVISION]: "نیازمند اصلاح",
    [TASK_STATUS.FINISHED]: "پایان یافته",
  };

  return statusMap[status] || "در انتظار ارسال";
}

function mapPlanFeedbacks(plan) {
  if (!plan.resultsPublished) {
    return undefined;
  }

  const reviews = getReviewsByPlanId(plan.id);
  const feedbacks = {};
  const generalFeedback = plan.finalDecisionNote || "";
  const committeeFeedback =
    plan.committeeFeedback && plan.committeeFeedback !== generalFeedback
      ? plan.committeeFeedback
      : "";

  if (committeeFeedback) {
    feedbacks.steering = committeeFeedback;
  }

  if (generalFeedback) {
    feedbacks.general = generalFeedback;
  }

  if (reviews.length > 0) {
    feedbacks.reviewers = reviews.map((review) => ({
      text: review.feedbackText,
    }));
  }

  return Object.keys(feedbacks).length > 0 ? feedbacks : undefined;
}

function getDefaultBusinessOpportunityDetails(plan = {}) {
  const details =
    plan.businessOpportunityDetails &&
    typeof plan.businessOpportunityDetails === "object"
      ? plan.businessOpportunityDetails
      : {};

  const field =
    details.field || details.category || plan.field || "همکاری تجاری";
  const summary =
    details.summary ||
    details.description ||
    plan.finalDecisionNote ||
    plan.committeeFeedback ||
    "این طرح پس از تعیین وضعیت نهایی توسط کمیته برای همکاری تجاری معرفی شده است.";

  return {
    title: details.title || plan.title || "موقعیت همکاری تجاری",
    field,
    category: details.category || details.field || field,
    collaborationType:
      details.collaborationType || "همکاری تجاری روی طرح منتشرشده",
    location: details.location || "قابل مذاکره",
    estimatedSupport: details.estimatedSupport || "قابل مذاکره",
    duration: details.duration || "براساس توافق طرفین",
    summary,
    challenge:
      details.challenge ||
      "چالش اصلی این موقعیت، بررسی ظرفیت همکاری تجاری و تبدیل خروجی طرح به مسیر اجرا یا بازار است.",
    solution:
      details.solution ||
      "همکار تجاری می‌تواند برای بررسی مدل همکاری، اجرای پایلوت، توسعه بازار یا مشارکت تجاری درخواست ثبت کند.",
    businessValue:
      details.businessValue ||
      "این موقعیت ظرفیت معرفی به همکاران تجاری و شروع مذاکره همکاری را دارد.",
    requirements: Array.isArray(details.requirements)
      ? details.requirements.join("\n")
      : details.requirements ||
        "بررسی خلاصه طرح و وضعیت نهایی کمیته\nاعلام علاقه‌مندی و ظرفیت همکاری\nثبت درخواست همکاری برای شروع پیگیری دبیرخانه",
    tags: Array.isArray(details.tags)
      ? details.tags.join("، ")
      : details.tags || `${field}، طرح منتشرشده، همکاری تجاری`,
    updatedAt: details.updatedAt || "",
  };
}

function isBusinessOpportunityPlan(plan) {
  return Boolean(plan?.resultsPublished && plan?.publishForBusiness);
}

function getBusinessOpportunityPublicationLabel(plan) {
  if (plan?.businessOpportunityPublished) {
    return "منتشرشده در پنل همکار تجاری";
  }

  if (plan?.businessOpportunityDetails?.updatedAt) {
    return "آماده انتشار نهایی";
  }

  return "نیازمند تکمیل اطلاعات";
}

function getBusinessRequestStatsText(planId) {
  const stats = getBusinessCollaborationRequestStatsByPlanId(planId);

  if (!stats.total) {
    return "هنوز درخواست همکاری برای این طرح ثبت نشده است.";
  }

  return `${stats.total} درخواست همکاری ثبت شده`;
}

function getBusinessRequestStats(planId) {
  return getBusinessCollaborationRequestStatsByPlanId(planId);
}

function normalizeBusinessOpportunityFormForSave(form) {
  const listFromText = (value, separator = /[،,\n]/) =>
    String(value || "")
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    title: form.title,
    field: form.field,
    category: form.category || form.field,
    collaborationType: form.collaborationType,
    location: form.location,
    estimatedSupport: form.estimatedSupport,
    duration: form.duration,
    summary: form.summary,
    description: form.summary,
    challenge: form.challenge,
    solution: form.solution,
    businessValue: form.businessValue,
    requirements: listFromText(form.requirements, /\n/),
    tags: listFromText(form.tags),
  };
}

function sortIntroducedPlanRequests(requests = []) {
  return [...requests].sort(
    (first, second) =>
      Number(second.updatedAtTimestamp || second.createdAtTimestamp || 0) -
      Number(first.updatedAtTimestamp || first.createdAtTimestamp || 0),
  );
}

function getInitialSitePublicationRequestsForCurrentUser() {
  const innovatorId = getCurrentInnovatorUserId();

  return sortIntroducedPlanRequests(
    getSitePublicationRequestsByInnovator(innovatorId),
  );
}

const DEFAULT_SITE_PUBLICATION_REPORT = {
  id: "report-1",
  title: "گزارش اولیه پروژه",
  status: "تکمیل شده",
  text: "",
  type: "text",
  fileName: "",
  fileUrl: "",
};

function makeLocalId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function normalizeReportsForForm(reports = []) {
  const normalizedReports = Array.isArray(reports) ? reports : [];

  if (!normalizedReports.length) {
    return [{ ...DEFAULT_SITE_PUBLICATION_REPORT }];
  }

  return normalizedReports.map((report, index) => ({
    id: report.id || `report-${index + 1}`,
    title: report.title || `گزارش ${index + 1}`,
    status: report.status || "تکمیل شده",
    text: report.text || "",
    type: report.fileUrl ? "file" : report.type || "text",
    fileName: report.fileName || "",
    fileUrl: report.fileUrl || "",
  }));
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<br\s*\/?>(\n)?/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function hasSitePublicationDraft(request = {}) {
  const draft = request.draft || {};

  return Boolean(
    draft.title ||
    draft.summary ||
    draft.contentHtml ||
    draft.description ||
    draft.image ||
    draft.investmentNeed ||
    draft.commercializationPercent ||
    draft.collaborationReadinessPercent ||
    (Array.isArray(draft.cooperationNeedTypes) &&
      draft.cooperationNeedTypes.length) ||
    (Array.isArray(draft.reports) &&
      draft.reports.some(
        (report) => report.title || report.text || report.fileUrl,
      )),
  );
}

function getDefaultSitePublicationForm(request = {}) {
  const draft = request.draft || {};

  return {
    title: draft.title || request.planTitle || "",
    field: draft.field || request.field || "",
    summary: draft.summary || "",
    contentHtml: draft.contentHtml || draft.description || "",
    cooperationNeedTypes: Array.isArray(draft.cooperationNeedTypes)
      ? draft.cooperationNeedTypes
      : Array.isArray(draft.cooperationNeeds)
        ? draft.cooperationNeeds
        : [],
    commercializationPercent: String(draft.commercializationPercent || ""),
    collaborationReadinessPercent: String(
      draft.collaborationReadinessPercent || "",
    ),
    investmentNeed: draft.investmentNeed || "",
    image: draft.image || "",
    reports: normalizeReportsForForm(draft.reports),
  };
}

function normalizePercent(value) {
  if (value === "" || value === null || typeof value === "undefined") {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return String(Math.max(0, Math.min(100, Math.round(numericValue))));
}

function normalizeSitePublicationFormForSave(form = {}) {
  const contentHtml = String(form.contentHtml || "").trim();

  return {
    title: form.title,
    field: form.field,
    summary: form.summary,
    contentHtml,
    description: stripHtml(contentHtml),
    cooperationNeedTypes: Array.isArray(form.cooperationNeedTypes)
      ? form.cooperationNeedTypes
      : [],
    cooperationNeeds: Array.isArray(form.cooperationNeedTypes)
      ? form.cooperationNeedTypes
      : [],
    commercializationPercent: normalizePercent(form.commercializationPercent),
    collaborationReadinessPercent: normalizePercent(
      form.collaborationReadinessPercent,
    ),
    investmentNeed: form.investmentNeed,
    image: form.image,
    reports: normalizeReportsForForm(form.reports).map((report) => ({
      ...report,
      type: report.fileUrl ? "file" : "text",
    })),
  };
}

function readFileAsDataUrl(file, maxSizeBytes = 650 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (file.size > maxSizeBytes) {
      reject(
        new Error(
          "حجم فایل انتخاب‌شده زیاد است. لطفاً فایل کوچک‌تر انتخاب کنید.",
        ),
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("خواندن فایل انجام نشد."));
    reader.readAsDataURL(file);
  });
}

function readImageAsCompressedDataUrl(file, maxWidth = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("لطفاً یک فایل تصویر انتخاب کنید."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("پردازش تصویر انجام نشد."));
      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("خواندن تصویر انجام نشد."));
    reader.readAsDataURL(file);
  });
}

function getSitePublicationStatusClass(status) {
  const statusMap = {
    [SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR]: "waiting-send",
    [SITE_PUBLICATION_STATUS.SUBMITTED_TO_COMMITTEE]: "submitted",
    [SITE_PUBLICATION_STATUS.NEEDS_REVISION]: "revision",
    [SITE_PUBLICATION_STATUS.PUBLISHED]: "finished",
  };

  return statusMap[status] || "default";
}

function getSitePublicationActionLabel(status) {
  if (status === SITE_PUBLICATION_STATUS.NEEDS_REVISION) {
    return "اصلاح اطلاعات";
  }

  if (status === SITE_PUBLICATION_STATUS.SUBMITTED_TO_COMMITTEE) {
    return "مشاهده اطلاعات ارسالی";
  }

  if (status === SITE_PUBLICATION_STATUS.PUBLISHED) {
    return "مشاهده اطلاعات منتشرشده";
  }

  return "تکمیل اطلاعات";
}

function mapPlanForInnovatorDashboard(plan) {
  const call = getPlanCallInfo(plan);

  return {
    id: plan.id,
    title: plan.title,
    callId: plan.callId,
    call: call?.title || "فراخوان برنامه هاتف",
    deadline: call ? formatCallDeadline(call) : "مهلت مشخص نشده",
    date: plan.submittedAt || plan.updatedAt || "ثبت‌شده در سامانه",
    fileName: plan.proposalFileUrl || `${plan.trackingCode || plan.id}.pdf`,
    status: getPlanStatusLabelFromCentralData(plan),
    finalStatus: plan.finalStatus,
    publishForBusiness: Boolean(plan.publishForBusiness),
    businessIntroducedAt: plan.businessIntroducedAt || "",
    businessPublishedAt: plan.businessPublishedAt || "",
    businessOpportunityPublished: Boolean(plan.businessOpportunityPublished),
    businessOpportunityDetails: getDefaultBusinessOpportunityDetails(plan),
    resultsPublished: Boolean(plan.resultsPublished),
    feedbacks: mapPlanFeedbacks(plan),
  };
}

function getInitialSubmittedPlansForCurrentUser() {
  const innovatorId = getCurrentInnovatorUserId();

  return getPlansByInnovatorId(innovatorId).map(mapPlanForInnovatorDashboard);
}

function getInitialSelectedPlanTasksForCurrentUser() {
  const innovatorId = getCurrentInnovatorUserId();
  const tasks = getTasksWithPlanByInnovatorId(innovatorId);

  return tasks.reduce((groupedTasks, task) => {
    const plan = task.plan;

    if (
      !plan ||
      !plan.resultsPublished ||
      !isAcceptedFinalStatus(plan.finalStatus)
    ) {
      return groupedTasks;
    }

    const planTasks = groupedTasks[plan.id] || [];

    return {
      ...groupedTasks,
      [plan.id]: [
        ...planTasks,
        {
          id: task.id,
          title: task.title,
          deadline:
            task.deadlineDate && task.deadlineTime
              ? `${task.deadlineDate} - ساعت ${task.deadlineTime}`
              : task.deadlineDate || task.deadlineTime || "",
          status: getTaskStatusLabelFromCentralData(task.status),
          isNew: task.status === TASK_STATUS.WAITING_FOR_INNOVATOR_REVIEW,
          managerMessage: task.managerMessage,
          managerFeedback: task.managerFeedback,
          description: task.innovatorResponseText,
          fileName: task.innovatorFileUrl ? "فایل پاسخ فناور" : "",
        },
      ],
    };
  }, {});
}

const SECTION_DATA = {
  dashboard: {
    title: "داشبورد",
    primaryTitle: "نمای کلی داشبورد",
    primaryItems: [
      {
        title: "صفحه اصلی داشبورد در مرحله بعدی تکمیل می‌شود",
        meta: "این بخش بعداً به‌صورت کامل طراحی خواهد شد.",
        status: "در حال طراحی",
      },
    ],
    sideTitle: "میان‌برهای داشبورد",
    sideItems: ["مرور سریع وضعیت", "آخرین فعالیت‌ها", "اعلان‌های مهم"],
    actionLabel: "شروع کار",
  },
  calls: {
    title: "فراخوان‌ها",
    primaryTitle: "فراخوان‌های در دسترس",
    primaryItems: [
      {
        title: "فراخوان فعال هدایت اعتبارات توسعه فناوری (هاتف)",
        meta: "مهلت ثبت: ۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
        status: "فعال",
      },
      {
        title: "محورهای پژوهشی سال جاری",
        meta: "به‌روزرسانی: ۲ روز پیش",
        status: "جدید",
      },
      {
        title: "آیین‌نامه شرکت در فراخوان‌ها",
        meta: "راهنما و شرایط شرکت",
        status: "راهنما",
      },
    ],
    sideTitle: "کارهای سریع",
    sideItems: [
      "مشاهده فراخوان‌های فعال",
      "بررسی شرایط احراز",
      "دانلود شیوه‌نامه تدوین پروپوزال",
      "ثبت درخواست جدید",
    ],
    actionLabel: "ثبت درخواست جدید",
  },
  "my-activities": {
    title: "دوره‌ها و رویدادهای من",
    primaryTitle: "برنامه‌های ثبت‌نام‌شده",
    primaryItems: [],
    sideTitle: "دسترسی سریع",
    sideItems: [
      "مشاهده دوره‌های ثبت‌نام‌شده",
      "مشاهده رویدادهای ثبت‌نام‌شده",
      "ورود به صفحه جزئیات برنامه",
    ],
    actionLabel: "مشاهده برنامه‌ها",
  },
  requests: {
    title: "درخواست‌ها و پشتیبانی",
    primaryTitle: "درخواست‌های اخیر",
    primaryItems: [
      {
        title: "مشکل در بارگذاری فایل پروپوزال",
        meta: "وضعیت: پاسخ داده شده",
        status: "پاسخ داده شده",
      },
      {
        title: "پیگیری مشکل ورود به پنل",
        meta: "وضعیت: در حال پیگیری",
        status: "در حال پیگیری",
      },
      {
        title: "درخواست راهنمایی برای تکمیل فرم",
        meta: "وضعیت: در انتظار پیگیری",
        status: "در انتظار پیگیری",
      },
    ],
    sideTitle: "اقدامات پیشنهادی",
    sideItems: [
      "ثبت درخواست جدید",
      "مشاهده پاسخ پشتیبان",
      "پیگیری درخواست‌های قبلی",
    ],
    actionLabel: "ثبت درخواست",
  },
  messages: {
    title: "پیام‌ها و اعلانات",
    primaryTitle: "پیام‌های اخیر",
    primaryItems: [
      {
        title: "نتیجه بررسی اولیه درخواست شما ثبت شد",
        meta: "دیروز",
        status: "مهم",
      },
      {
        title: "مهلت فراخوان هاتف به‌روزرسانی شد",
        meta: "۳ ساعت پیش",
        status: "جدید",
      },
      {
        title: "درخواست پشتیبانی شما به‌روزرسانی شد",
        meta: "۲ روز پیش",
        status: "اطلاعیه",
      },
    ],
    sideTitle: "دسترسی سریع",
    sideItems: [
      "مشاهده همه پیام‌ها",
      "پیام‌های خوانده‌نشده",
      "پیام‌های مهم",
      "تنظیمات دریافت اعلان",
    ],
    actionLabel: "مشاهده پیام‌ها",
  },
  faq: {
    title: "سوالات متداول",
    primaryTitle: "سوالات پرتکرار",
    primaryItems: [
      {
        title: "چگونه در یک فراخوان ثبت‌نام کنم؟",
        meta: "راهنمای شروع ثبت درخواست",
        status: "راهنما",
      },
      {
        title: "چه مدارکی برای ثبت درخواست لازم است؟",
        meta: "فهرست مدارک و شرایط",
        status: "مدارک",
      },
      {
        title: "چگونه وضعیت درخواست را پیگیری کنم؟",
        meta: "مراحل پیگیری و پاسخ‌دهی",
        status: "پیگیری",
      },
    ],
    sideTitle: "پیشنهاد برای توسعه",
    sideItems: [
      "افزودن دسته‌بندی سوالات",
      "نمایش سوالات محبوب",
      "جست‌وجوی هوشمند در سوالات",
      "ثبت سوال جدید",
    ],
    actionLabel: "ارسال سوال",
  },
  profile: {
    title: "پروفایل",
    primaryTitle: "اطلاعات پروفایل",
    primaryItems: [],
    sideTitle: "پروفایل",
    sideItems: [],
    actionLabel: "ویرایش پروفایل",
  },
  "edit-profile": {
    title: "ویرایش پروفایل",
    primaryTitle: "ویرایش اطلاعات کاربری",
    primaryItems: [],
    sideTitle: "ویرایش پروفایل",
    sideItems: [],
    actionLabel: "ذخیره تغییرات",
  },
};

const SUMMARY_CARDS = [
  {
    label: "طرح‌های ارسالی",
    value: "۸",
    hint: "کل طرح‌هایی که ثبت کرده‌اید",
  },
  {
    label: "طرح‌های قبول‌شده",
    value: "۲",
    hint: "طرح‌های قبول یا قبول ضعیف",
  },
  {
    label: "فراخوان‌های شرکت‌کرده",
    value: "۳",
    hint: "فراخوان‌هایی که در آن‌ها طرح دارید",
  },
  {
    label: "حمایت‌های دریافت‌شده",
    value: "۲",
    hint: "حمایت‌های فعال یا قابل پیگیری",
  },
];

const RECENT_ACTIVITY = [
  "فراخوان «هدایت اعتبارات توسعه فناوری» به داشبورد شما اضافه شد.",
  "یک پیام جدید درباره مهلت ثبت طرح دریافت کرده‌اید.",
  "وضعیت یکی از درخواست‌های شما به «در حال بررسی» تغییر کرد.",
];

const INITIAL_RECENT_MESSAGES = [
  {
    id: 1,
    title: "نتیجه بررسی اولیه درخواست شما ثبت شد.",
    time: "دیروز",
    isRead: false,
  },
  {
    id: 2,
    title: "مهلت فراخوان هاتف به‌روزرسانی شد.",
    time: "۳ ساعت پیش",
    isRead: false,
  },
  {
    id: 3,
    title: "درخواست پشتیبانی شما در حال پیگیری است.",
    time: "۲ روز پیش",
    isRead: false,
  },
];

const INITIAL_SUBMITTED_PLANS = [
  {
    id: 1,
    title: "سامانه هوشمند تحلیل داده‌های صنعتی",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    fileName: "industrial-ai-proposal.pdf",
    status: "دریافت شده",
  },
  {
    id: 2,
    title: "پلتفرم پایش مصرف انرژی",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۵/۰۲/۲۷ - ساعت ۱۴:۱۵",
    fileName: "energy-monitoring.zip",
    status: "در انتظار بررسی",
  },
  {
    id: 3,
    title: "ابزار تحلیل داده سلامت دیجیتال",
    callId: "health-call",
    call: "فراخوان فناوری‌های سلامت دیجیتال",
    deadline: "۱۴۰۵/۰۶/۱۵ - ساعت ۲۰:۰۰",
    date: "۱۴۰۵/۰۲/۱۰ - ساعت ۰۹:۴۵",
    fileName: "health-data-proposal.docx",
    status: "در حال بررسی",
  },
  {
    id: 4,
    title: "مدل پیش‌بینی تقاضای انرژی",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۵/۰۱/۲۸ - ساعت ۱۶:۲۰",
    fileName: "energy-demand-model.pdf",
    status: "داوری شده",
  },
  {
    id: 5,
    title: "سامانه تشخیص خطای تجهیزات",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۱/۱۵ - ساعت ۱۱:۰۰",
    fileName: "equipment-fault-detection.pdf",
    status: "رد",
    feedbacks: {
      secretariat:
        "مستندات طرح از نظر ساختار کلی قابل بررسی بود، اما برخی پیوست‌های اجرایی و برنامه زمان‌بندی نیاز به تکمیل داشت.",
      steering:
        "طرح از نظر مسئله‌محوری قابل توجه است، اما مسیر تجاری‌سازی و مدل بهره‌برداری به اندازه کافی شفاف ارائه نشده است.",
      reviewers: [
        {
          text: "از نظر فنی، نوآوری طرح نسبت به نمونه‌های موجود نیازمند تقویت و ارائه شواهد دقیق‌تر است.",
        },
        {
          text: "برنامه اجرایی طرح نیازمند جزئیات بیشتر در بخش اعتبارسنجی و آزمون میدانی است.",
        },
      ],
    },
  },
  {
    id: 6,
    title: "دستیار هوشمند تحلیل پروپوزال",
    callId: "ai-call",
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    deadline: "۱۴۰۵/۰۵/۰۵ - ساعت ۲۳:۵۹",
    date: "۱۴۰۵/۰۱/۰۸ - ساعت ۱۲:۱۰",
    fileName: "proposal-ai-assistant.pdf",
    status: "رد ضعیف",
    feedbacks: {
      secretariat:
        "پرونده طرح کامل دریافت شده اما در بخش مستندات پشتیبان، نیاز به توضیح دقیق‌تر درباره خروجی مورد انتظار وجود دارد.",
      reviewers: [
        {
          text: "پیشنهاد می‌شود دامنه کاربرد، داده‌های موردنیاز و معیارهای سنجش عملکرد به‌صورت دقیق‌تر بازنویسی شود.",
        },
      ],
    },
  },
  {
    id: 7,
    title: "سامانه پایش هوشمند کیفیت هوا",
    callId: "health-call",
    call: "فراخوان فناوری‌های سلامت دیجیتال",
    deadline: "۱۴۰۵/۰۶/۱۵ - ساعت ۲۰:۰۰",
    date: "۱۴۰۴/۱۲/۲۲ - ساعت ۰۹:۳۰",
    fileName: "air-quality-monitoring.zip",
    status: "قبول",
    feedbacks: {
      secretariat:
        "مدارک طرح کامل، ساختارمند و مطابق الزامات فراخوان ارسال شده است.",
      steering:
        "طرح از نظر اثرگذاری، امکان اجرا و قابلیت توسعه در مسیر فناوری مورد تأیید قرار گرفته است.",
      reviewers: [
        {
          text: "سطح آمادگی فنی، منطق طراحی سامانه و قابلیت پیاده‌سازی طرح مناسب ارزیابی شده است.",
        },
        {
          text: "پیشنهاد می‌شود در مرحله اجرا، شاخص‌های سنجش اثرگذاری محیطی دقیق‌تر تعریف شود.",
        },
        {
          text: "مسیر توسعه نمونه اولیه و امکان اجرای پایلوت قابل قبول ارزیابی شده است.",
        },
      ],
    },
  },
  {
    id: 8,
    title: "پلتفرم مدیریت مصرف انرژی ساختمان",
    callId: "energy-call",
    call: "فراخوان توسعه فناوری‌های انرژی",
    deadline: "۱۴۰۵/۰۴/۲۰ - ساعت ۱۸:۰۰",
    date: "۱۴۰۴/۱۲/۱۵ - ساعت ۱۵:۴۰",
    fileName: "building-energy-platform.docx",
    status: "قبول ضعیف",
    feedbacks: {
      steering:
        "طرح از نظر نیاز بازار و موضوع کلی قابل قبول است، اما مدل اجرای پایلوت باید دقیق‌تر شود.",
      reviewers: [
        {
          text: "پیشنهاد می‌شود معماری فنی، شاخص‌های عملکرد و برنامه اعتبارسنجی در نسخه بعدی تقویت شود.",
        },
      ],
    },
  },
];

const ACCEPTED_PLAN_STATUSES = ["قبول", "قبول ضعیف"];

const INITIAL_SELECTED_PLAN_TASKS = {
  7: [
    {
      id: 1,
      title: "تکمیل برنامه زمان‌بندی اجرای پایلوت",
      deadline: "۱۴۰۵/۰۴/۱۵ - ساعت ۱۸:۰۰",
      status: "در انتظار ارسال",
      isNew: true,
      managerMessage:
        "لطفاً برنامه زمان‌بندی اجرای پایلوت را با جزئیات فعالیت‌ها، خروجی هر مرحله و زمان تحویل هر بخش بارگذاری کنید.",
      managerFeedback: "",
      description: "",
      fileName: "",
    },
    {
      id: 2,
      title: "ارسال مستندات فنی نمونه اولیه",
      deadline: "۱۴۰۵/۰۴/۲۲ - ساعت ۲۰:۰۰",
      status: "ارسال شده",
      isNew: false,
      managerMessage:
        "مستندات باید شامل معماری سامانه، ورودی‌ها، خروجی‌ها و نحوه اعتبارسنجی باشد.",
      managerFeedback: "",
      description: "نسخه اولیه مستندات ارسال شده است.",
      fileName: "prototype-documents.pdf",
    },
    {
      id: 3,
      title: "بررسی مستندات ارسال‌شده توسط مدیر",
      deadline: "۱۴۰۵/۰۴/۲۹ - ساعت ۱۴:۰۰",
      status: "مشاهده شده",
      isNew: false,
      managerMessage:
        "این وظیفه پس از ارسال فایل توسط فناور، توسط مدیر مشاهده شده است.",
      managerFeedback:
        "فایل شما مشاهده شد. در صورت نیاز، وظیفه اصلاحی جداگانه تعریف خواهد شد.",
      description: "مستندات فنی ارسال شده و توسط مدیر مشاهده شده است.",
      fileName: "reviewed-documents.pdf",
    },
    {
      id: 4,
      title: "اصلاح مستندات اعتبارسنجی",
      deadline: "۱۴۰۵/۰۵/۱۸ - ساعت ۱۷:۰۰",
      status: "نیازمند اصلاح",
      isNew: false,
      managerMessage:
        "لطفاً نسخه اصلاح‌شده مستندات اعتبارسنجی را با توضیح تغییرات انجام‌شده ارسال کنید.",
      managerFeedback:
        "در نسخه قبلی، بخش معیارهای پذیرش و نحوه سنجش عملکرد کافی نبود. لطفاً این بخش‌ها را تکمیل کنید.",
      description: "در حال اصلاح مستندات طبق بازخورد مدیر هستیم.",
      fileName: "validation-documents.pdf",
    },
    {
      id: 5,
      title: "تحویل نسخه نهایی پایلوت",
      deadline: "",
      status: "پایان یافته",
      isNew: false,
      managerMessage:
        "این وظیفه پس از دریافت نسخه نهایی و بررسی مدیر پروژه خاتمه یافته است.",
      managerFeedback:
        "نسخه نهایی مورد تأیید قرار گرفت و این وظیفه پایان یافته است.",
      description: "نسخه نهایی پایلوت تحویل داده شد.",
      fileName: "final-pilot-version.zip",
    },
  ],
  8: [
    {
      id: 1,
      title: "بازنگری مدل اجرای پایلوت",
      deadline: "۱۴۰۵/۰۴/۱۰ - ساعت ۱۶:۰۰",
      status: "در انتظار ارسال",
      isNew: true,
      managerMessage:
        "برای ادامه فرآیند، مدل اجرای پایلوت و محدوده آزمایش اولیه باید شفاف‌تر شود.",
      managerFeedback: "",
      description: "",
      fileName: "",
    },
    {
      id: 2,
      title: "ارسال برنامه اعتبارسنجی فنی",
      deadline: "۱۴۰۵/۰۴/۲۸ - ساعت ۱۸:۰۰",
      status: "مشاهده شده",
      isNew: false,
      managerMessage:
        "برنامه اعتبارسنجی باید شامل معیارهای عملکرد، روش آزمون و داده‌های موردنیاز باشد.",
      managerFeedback:
        "فایل ارسال‌شده توسط مدیر مشاهده شد و فعلاً امکان تغییر مجدد ندارد.",
      description: "برنامه اعتبارسنجی ارسال شده و توسط مدیر مشاهده شده است.",
      fileName: "validation-plan.pdf",
    },
  ],
};

const INITIAL_SUPPORT_REQUESTS = [
  {
    id: 1,
    title: "مشکل در بارگذاری فایل پروپوزال",
    message:
      "هنگام بارگذاری فایل پروپوزال، سامانه خطا می‌دهد و فایل ثبت نمی‌شود. لطفاً راهنمایی کنید.",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    status: "پاسخ داده شده",
    seenBySupport: true,
    supportReply:
      "لطفاً حجم فایل را بررسی کنید و در صورت امکان فایل را به‌صورت PDF فشرده بارگذاری کنید. محدودیت فعلی سامانه ۲۰ مگابایت است.",
    repliedAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۱۰",
  },
  {
    id: 2,
    title: "پیگیری مشکل ورود به پنل",
    message:
      "گاهی هنگام ورود به پنل، صفحه دیر بارگذاری می‌شود و پیام خطای موقت نمایش داده می‌شود.",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۶:۲۰",
    status: "در حال پیگیری",
    seenBySupport: true,
    supportReply: "",
    repliedAt: "",
  },
  {
    id: 3,
    title: "درخواست راهنمایی برای تکمیل فرم",
    message:
      "برای تکمیل بخش توضیحات فنی فرم، نیاز به راهنمایی دارم. آیا نمونه‌ای برای تکمیل این بخش وجود دارد؟",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۱۱:۰۰",
    status: "در انتظار پیگیری",
    seenBySupport: false,
    supportReply: "",
    repliedAt: "",
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    title: "مهلت ارسال مدارک تکمیلی نزدیک است",
    category: "یادآوری",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۰۹:۱۵",
    isRead: false,
    isImportant: true,
    body: "برای یکی از طرح‌های شما وظیفه‌ای با ددلاین نزدیک تعریف شده است. لطفاً قبل از پایان مهلت، فایل یا توضیحات لازم را ارسال کنید.",
  },
  {
    id: 2,
    title: "نتیجه بررسی اولیه طرح ثبت شد",
    category: "پیام سامانه",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۵:۴۰",
    isRead: false,
    isImportant: false,
    body: "نتیجه بررسی اولیه یکی از طرح‌های شما در سامانه ثبت شده است. برای مشاهده جزئیات، به بخش طرح‌های من مراجعه کنید.",
  },
  {
    id: 3,
    title: "اطلاعیه به‌روزرسانی سامانه",
    category: "اطلاعیه",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۰۰",
    isRead: true,
    isImportant: false,
    body: "سامانه در نسخه جدید با بهبود سرعت بارگذاری داشبورد و اصلاح برخی خطاهای گزارش‌شده به‌روزرسانی شده است.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "فراخوان‌ها",
    question: "چطور می‌توانم برای یک فراخوان طرح ارسال کنم؟",
    answer:
      "از منوی فراخوان‌ها وارد بخش طرح‌های من شوید، فراخوان موردنظر را انتخاب کنید و سپس فایل پروپوزال یا مستندات طرح را بارگذاری کنید.",
  },
  {
    id: 2,
    category: "طرح‌ها",
    question: "بعد از ارسال طرح، آیا امکان ویرایش وجود دارد؟",
    answer:
      "امکان ویرایش یا حذف فقط برای طرح‌هایی وجود دارد که وضعیت آن‌ها «در انتظار بررسی» باشد. برای سایر وضعیت‌ها فقط امکان مشاهده طرح فعال است.",
  },
  {
    id: 3,
    category: "وظایف",
    question: "وظیفه‌ای که مدیر برای طرح تعریف می‌کند یعنی چه؟",
    answer:
      "وظیفه یک اقدام مشخص است که مدیر برای ادامه مسیر طرح تعریف می‌کند؛ مثل ارسال فایل تکمیلی، توضیح متنی، اصلاح مستندات یا تحویل یک خروجی مشخص.",
  },
  {
    id: 4,
    category: "درخواست‌ها",
    question: "چه زمانی می‌توانم درخواست پشتیبانی را حذف کنم؟",
    answer:
      "اگر درخواست هنوز توسط پشتیبان مشاهده نشده باشد، امکان حذف وجود دارد. پس از مشاهده پشتیبان، درخواست قابل حذف نخواهد بود.",
  },
  {
    id: 5,
    category: "پیام‌ها",
    question: "پیام‌های مهم کجا نمایش داده می‌شوند؟",
    answer:
      "پیام‌های مهم هم در بخش پیام‌ها و اعلانات نمایش داده می‌شوند و هم از طریق آیکون اعلان در بالای داشبورد قابل مشاهده هستند.",
  },
];

const INITIAL_USER_PROFILE = {
  firstName: "مهدیه",
  lastName: "سیفی",
  mobile: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "mahdieh.seyfi@example.com",
  level: "فناور",
  memberSince: "۱۴۰۴",
  membershipDuration: "۱ سال",
  avatarLetter: "م",
  avatarPreview: "",
};

const DASHBOARD_REMINDERS = [
  {
    id: 1,
    title: "ارسال پاسخ وظیفه جدید",
    date: "۱۴۰۵/۰۴/۱۵",
    time: "۱۸:۰۰",
    type: "ددلاین",
  },
  {
    id: 2,
    title: "پیگیری درخواست پشتیبانی",
    date: "۱۴۰۵/۰۳/۱۸",
    time: "۱۰:۰۰",
    type: "یادآوری",
  },
  {
    id: 3,
    title: "بازبینی فایل طرح انتخاب‌شده",
    date: "۱۴۰۵/۰۴/۲۲",
    time: "۲۰:۰۰",
    type: "ددلاین",
  },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      className={isOpen ? "innovator-dashboard__nav-chevron--open" : ""}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 10l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v11m0 0l4-4m-4 4l-4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const dateText = now.toLocaleDateString("fa-IR-u-ca-persian", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeText = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="innovator-dashboard__date-time">
      <span>تاریخ امروز</span>
      <strong>{dateText}</strong>
      <small>ساعت {timeText}</small>
    </div>
  );
}

function getPlanStatusClass(status) {
  const statusMap = {
    "دریافت شده": "received",
    "در انتظار بررسی": "waiting",
    "در حال بررسی": "reviewing",
    "داوری شده": "judged",
    رد: "rejected",
    "رد ضعیف": "weak-rejected",
    قبول: "accepted",
    "قبول ضعیف": "weak-accepted",
  };

  return statusMap[status] || "default";
}

function isFinalJudgementStatus(status) {
  return ["رد", "رد ضعیف", "قبول", "قبول ضعیف"].includes(status);
}

function isEditableSubmittedPlan(status) {
  return ["در انتظار بررسی", "نیازمند اصلاح"].includes(status);
}

function isRevisionResubmissionPlan(plan) {
  return Boolean(
    plan?.resultsPublished && isNeedsRevisionFinalStatus(plan?.finalStatus),
  );
}

function getDownloadHref(plan) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `این فایل نمونه برای طرح «${plan.title}» است.`,
  )}`;
}

function getFeedbackItems(plan) {
  if (!plan?.feedbacks) {
    return [];
  }

  const items = [];

  if (plan.feedbacks.secretariat) {
    items.push({
      id: "secretariat",
      title: "بازخورد دبیرخانه",
      text: plan.feedbacks.secretariat,
    });
  }

  if (plan.feedbacks.steering) {
    items.push({
      id: "steering",
      title: "بازخورد عضو کمیته",
      text: plan.feedbacks.steering,
    });
  }

  if (plan.feedbacks.general) {
    items.push({
      id: "general",
      title: "بازخورد کلی",
      text: plan.feedbacks.general,
    });
  }

  if (Array.isArray(plan.feedbacks.reviewers)) {
    plan.feedbacks.reviewers.forEach((reviewer, index) => {
      if (!reviewer?.text) {
        return;
      }

      items.push({
        id: `reviewer-${index + 1}`,
        title: `بازخورد داور ${index + 1}`,
        text: reviewer.text,
      });
    });
  }

  return items;
}

function getTaskStatusClass(status) {
  const statusMap = {
    "در انتظار ارسال": "waiting-send",
    "ارسال شده": "submitted",
    "مشاهده شده": "viewed",
    "نیازمند اصلاح": "revision",
    "پایان یافته": "finished",
  };

  return statusMap[status] || "default";
}

function isLockedTaskStatus(status) {
  return ["ارسال شده", "پایان یافته"].includes(status);
}

function getNearestTaskDeadline(tasks) {
  const activeTask = tasks.find(
    (task) => task.deadline && task.status !== "پایان یافته",
  );

  return activeTask?.deadline || "ددلاین فعالی وجود ندارد";
}

function getCurrentPersianDateTime() {
  const now = new Date();

  const date = now.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const time = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} - ساعت ${time}`;
}

function StatusBadge({ status, className = "" }) {
  const isJudged = status === "داوری شده";

  return (
    <span
      className={`submit-plan__status submit-plan__status--${getPlanStatusClass(
        status,
      )} ${className}`}
    >
      {status}

      {isJudged && (
        <span className="submit-plan__status-info" tabIndex={0}>
          i
          <span className="submit-plan__status-tooltip">
            وضعیت دقیق این طرح پس از تأیید نهایی و انتشار نتایج اعلام خواهد شد.
          </span>
        </span>
      )}
    </span>
  );
}

function SubmitPlanPanel() {
  const [mode, setMode] = useState("list");
  const [submitStep, setSubmitStep] = useState("select");
  const [selectedCallId, setSelectedCallId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [submittedPlans, setSubmittedPlans] = useState(() =>
    getInitialSubmittedPlansForCurrentUser(),
  );
  const [planTitle, setPlanTitle] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [businessForm, setBusinessForm] = useState(() =>
    getDefaultBusinessOpportunityDetails(),
  );

  const selectedCall = CALL_OPTIONS.find((item) => item.id === selectedCallId);
  const hasFile = Boolean(uploadedFile || existingFileName);
  const feedbackItems = getFeedbackItems(selectedPlan);
  const businessOpportunityPlans = [];

  const resetForm = () => {
    setSubmitStep("select");
    setSelectedCallId("");
    setUploadedFile(null);
    setExistingFileName("");
    setPlanTitle("");
    setSelectedPlan(null);
    setEditingPlanId(null);
    setSubmitMessage("");
    setBusinessForm(getDefaultBusinessOpportunityDetails());
  };

  const openNewPlan = () => {
    resetForm();
    setMode("new");
  };

  const openList = () => {
    resetForm();
    setMode("list");
  };

  const openViewPlan = (plan) => {
    setSelectedPlan(plan);
    setMode("view");
    setSubmitMessage("");
  };

  const openEditPlan = (plan) => {
    if (!isEditableSubmittedPlan(plan.status)) {
      return;
    }

    setMode("edit");
    setSubmitStep("upload");
    setSelectedPlan(plan);
    setEditingPlanId(plan.id);
    setSelectedCallId(plan.callId);
    setPlanTitle(plan.title);
    setExistingFileName(plan.fileName);
    setUploadedFile(null);
    setSubmitMessage("");
  };

  const openBusinessOpportunityDetails = (plan) => {
    if (!isBusinessOpportunityPlan(plan)) {
      return;
    }

    setSelectedPlan(plan);
    setBusinessForm(getDefaultBusinessOpportunityDetails(plan));
    setMode("business-details");
    setSubmitMessage("");
  };

  const updateBusinessFormField = (fieldName, value) => {
    setBusinessForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const refreshBusinessOpportunityPlanState = (message, nextMode = "view") => {
    const nextPlans = getInitialSubmittedPlansForCurrentUser();
    const updatedSelectedPlan =
      nextPlans.find((plan) => plan.id === selectedPlan?.id) || selectedPlan;

    setSubmittedPlans(nextPlans);
    setSelectedPlan(updatedSelectedPlan);
    setBusinessForm(getDefaultBusinessOpportunityDetails(updatedSelectedPlan));
    setSubmitMessage(message);
    setMode(nextMode);

    return updatedSelectedPlan;
  };

  const saveCurrentBusinessOpportunityDetails = () => {
    if (!selectedPlan || !isBusinessOpportunityPlan(selectedPlan)) {
      return null;
    }

    return savePlanBusinessOpportunityDetails(
      selectedPlan.id,
      normalizeBusinessOpportunityFormForSave(businessForm),
    );
  };

  const handleBusinessOpportunityDetailsSubmit = (event) => {
    event.preventDefault();

    const savedPlan = saveCurrentBusinessOpportunityDetails();

    if (!savedPlan) {
      return;
    }

    refreshBusinessOpportunityPlanState(
      "اطلاعات نمایش تجاری این طرح با موفقیت ذخیره شد. هنوز در پنل همکار تجاری منتشر نشده است.",
    );
  };

  const handleBusinessOpportunityFinalPublish = () => {
    const savedPlan = saveCurrentBusinessOpportunityDetails();

    if (!savedPlan) {
      return;
    }

    publishPlanBusinessOpportunity(savedPlan.id);

    refreshBusinessOpportunityPlanState(
      "اطلاعات همکاری تجاری این طرح ذخیره و در پنل همکار تجاری منتشر شد.",
    );
  };

  const deletePlan = (planId) => {
    const targetPlan = submittedPlans.find((plan) => plan.id === planId);

    if (!targetPlan || !isEditableSubmittedPlan(targetPlan.status)) {
      return;
    }

    const confirmed = window.confirm("آیا از حذف این طرح مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    deletePlanFromService(planId);
    setSubmittedPlans(getInitialSubmittedPlansForCurrentUser());
    setSelectedPlan(null);
    setSubmitMessage("طرح با موفقیت حذف شد.");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setUploadedFile(file || null);
    setExistingFileName("");
    setSubmitMessage("");
  };

  const removeCurrentFile = () => {
    setUploadedFile(null);
    setExistingFileName("");
  };

  const handleSubmitPlan = (event) => {
    event.preventDefault();

    if (!selectedCall || !hasFile) {
      return;
    }

    const innovatorId = getCurrentInnovatorUserId();
    const proposalFileName = uploadedFile?.name || existingFileName;

    if (mode === "edit" && editingPlanId) {
      const planUpdates = {
        title: planTitle || selectedPlan?.title || "طرح فناورانه",
        callId: selectedCall.id,
        field: selectedCall.field,
        proposalFileUrl: proposalFileName,
      };

      if (isRevisionResubmissionPlan(selectedPlan)) {
        resubmitPlanRevision(editingPlanId, planUpdates);
      } else {
        updatePlan(editingPlanId, planUpdates);
      }

      setMode("list");
      resetForm();
      setSubmittedPlans(getInitialSubmittedPlansForCurrentUser());
      setSubmitMessage(
        isRevisionResubmissionPlan(selectedPlan)
          ? "طرح اصلاح‌شده با موفقیت ارسال شد و دوباره وارد چرخه بررسی شد."
          : "تغییرات طرح با موفقیت ذخیره شد.",
      );
      return;
    }

    addPlan({
      title: planTitle || "طرح جدید فناورانه",
      callId: selectedCall.id,
      field: selectedCall.field,
      innovatorId,
      proposalFileUrl: proposalFileName,
    });

    setMode("list");
    resetForm();
    setSubmittedPlans(getInitialSubmittedPlansForCurrentUser());
    setSubmitMessage("طرح شما با موفقیت ارسال شد.");
  };
  return (
    <section className="submit-plan">
      {mode === "list" && (
        <div className="submit-plan__panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>طرح‌های ثبت‌شده</span>
              <h3>لیست طرح‌های ارسال‌شده توسط شما</h3>
            </div>

            <button type="button" onClick={openNewPlan}>
              ارسال طرح جدید
            </button>
          </div>

          {businessOpportunityPlans.length > 0 && (
            <section className="submit-plan__feedbacks submit-plan__business-introduction">
              <div className="submit-plan__feedbacks-header">
                <span>تکمیل اطلاعات همکاری تجاری</span>
                <h3>طرح‌های معرفی‌شده برای همکاری تجاری</h3>
                <p>
                  کمیته این طرح‌ها را برای همکاری تجاری معرفی کرده است. این
                  طرح‌ها تا زمانی که شما اطلاعات همکاری را تکمیل و انتشار نهایی
                  نکنید، در پنل همکاران تجاری نمایش داده نمی‌شوند.
                </p>
              </div>

              <div className="submit-plan__feedback-grid">
                {businessOpportunityPlans.map((plan) => (
                  <article key={`business-details-${plan.id}`}>
                    <span>{getBusinessOpportunityPublicationLabel(plan)}</span>
                    <p>{plan.title}</p>
                    <small>
                      {plan.businessOpportunityPublished
                        ? `منتشرشده در: ${plan.businessPublishedAt || "ثبت نشده"}`
                        : `معرفی‌شده توسط کمیته: ${plan.businessIntroducedAt || plan.businessPublishedAt || "پس از انتشار نهایی"}`}
                    </small>
                    {plan.businessOpportunityPublished && (
                      <small>{getBusinessRequestStatsText(plan.id)}</small>
                    )}
                    <div className="submit-plan__footer-actions">
                      <button
                        type="button"
                        onClick={() => openBusinessOpportunityDetails(plan)}
                      >
                        {plan.businessOpportunityPublished
                          ? "ویرایش اطلاعات منتشرشده"
                          : plan.businessOpportunityDetails?.updatedAt
                            ? "ویرایش و انتشار نهایی"
                            : "تکمیل اطلاعات همکاری تجاری"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <ol className="submit-plan__submitted-list">
            {submittedPlans.map((plan, index) => {
              const canModify = isEditableSubmittedPlan(plan.status);

              return (
                <li className="submit-plan__submitted-card" key={plan.id}>
                  <span className="submit-plan__order">{index + 1}</span>

                  <div className="submit-plan__submitted-info">
                    <h4>{plan.title}</h4>
                    <p>{plan.call}</p>
                    <small>تاریخ ارسال: {plan.date}</small>
                    <small>ددلاین فراخوان: {plan.deadline}</small>
                    {plan.businessOpportunityPublished && (
                      <small>{getBusinessRequestStatsText(plan.id)}</small>
                    )}
                  </div>

                  <StatusBadge status={plan.status} />

                  <div className="submit-plan__actions">
                    <button
                      type="button"
                      className="submit-plan__action submit-plan__action--view"
                      onClick={() => openViewPlan(plan)}
                    >
                      مشاهده
                    </button>

                    {false && isBusinessOpportunityPlan(plan) && (
                      <button
                        type="button"
                        className="submit-plan__action submit-plan__action--edit"
                        onClick={() => openBusinessOpportunityDetails(plan)}
                      >
                        اطلاعات همکاری تجاری
                      </button>
                    )}

                    {canModify && (
                      <>
                        <button
                          type="button"
                          className="submit-plan__action submit-plan__action--edit"
                          onClick={() => openEditPlan(plan)}
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          className="submit-plan__action submit-plan__action--delete"
                          onClick={() => deletePlan(plan.id)}
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {mode === "view" && selectedPlan && (
        <div className="submit-plan__panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>مشاهده طرح</span>
              <h3>{selectedPlan.title}</h3>
            </div>

            <button type="button" onClick={openList}>
              بازگشت به لیست
            </button>
          </div>

          <div className="submit-plan__view-card">
            <div>
              <span>فراخوان</span>
              <strong>{selectedPlan.call}</strong>
            </div>

            <div className="submit-plan__view-status">
              <span>وضعیت</span>
              <StatusBadge
                status={selectedPlan.status}
                className="submit-plan__status--inline"
              />
            </div>

            <div>
              <span>تاریخ ارسال</span>
              <strong>{selectedPlan.date}</strong>
            </div>

            <div>
              <span>ددلاین</span>
              <strong>{selectedPlan.deadline}</strong>
            </div>

            <div className="submit-plan__view-file">
              <div>
                <span>فایل پیوست</span>
                <strong>{selectedPlan.fileName}</strong>
              </div>

              <a
                href={getDownloadHref(selectedPlan)}
                download={selectedPlan.fileName}
              >
                <DownloadIcon />
                دانلود فایل
              </a>
            </div>
          </div>

          {false &&
            selectedPlan.resultsPublished &&
            selectedPlan.publishForBusiness && (
              <section className="submit-plan__feedbacks submit-plan__business-introduction">
                <div className="submit-plan__feedbacks-header">
                  <span>همکاری تجاری</span>
                  <h3>وضعیت معرفی این طرح در همکاری تجاری</h3>
                  <p>
                    شما فقط آمار تعداد درخواست‌های همکاری ثبت‌شده برای این طرح
                    را می‌بینید. اطلاعات همکار تجاری، متن درخواست و پاسخ کمیته
                    در پنل فناور نمایش داده نمی‌شود.
                  </p>
                </div>

                <div className="submit-plan__feedback-grid">
                  <article>
                    <span>وضعیت همکاری تجاری</span>
                    <p>
                      {getBusinessOpportunityPublicationLabel(selectedPlan)}
                    </p>
                  </article>
                  <article>
                    <span>تاریخ معرفی توسط کمیته</span>
                    <p>
                      {selectedPlan.businessIntroducedAt ||
                        "پس از انتشار نهایی"}
                    </p>
                  </article>
                  <article>
                    <span>تاریخ انتشار در پنل همکار تجاری</span>
                    <p>
                      {selectedPlan.businessOpportunityPublished
                        ? selectedPlan.businessPublishedAt || "ثبت شده"
                        : "هنوز منتشر نشده"}
                    </p>
                  </article>
                  {selectedPlan.businessOpportunityPublished &&
                    (() => {
                      const stats = getBusinessRequestStats(selectedPlan.id);

                      return (
                        <>
                          <article>
                            <span>تعداد کل درخواست‌ها</span>
                            <p>{stats.total}</p>
                          </article>
                          <article>
                            <span>در انتظار پیگیری</span>
                            <p>{stats.waiting}</p>
                          </article>
                          <article>
                            <span>در حال پیگیری</span>
                            <p>{stats.tracking}</p>
                          </article>
                          <article>
                            <span>پایان‌یافته / پاسخ داده شده</span>
                            <p>{stats.answered}</p>
                          </article>
                        </>
                      );
                    })()}
                </div>

                <div className="submit-plan__footer-actions">
                  <button
                    type="button"
                    onClick={() => openBusinessOpportunityDetails(selectedPlan)}
                  >
                    {selectedPlan.businessOpportunityPublished
                      ? "ویرایش اطلاعات همکاری تجاری"
                      : "تکمیل و انتشار اطلاعات همکاری تجاری"}
                  </button>
                </div>
              </section>
            )}

          {isFinalJudgementStatus(selectedPlan.status) &&
            feedbackItems.length > 0 && (
              <section className="submit-plan__feedbacks">
                <div className="submit-plan__feedbacks-header">
                  <span>بازخوردها</span>
                  <h3>بازخوردهای ارزیابی طرح</h3>
                  <p>
                    بازخوردها بدون نمایش نام اعضای دبیرخانه، کمیته راهبری و
                    داوران برای شما نمایش داده می‌شوند.
                  </p>
                </div>

                <div className="submit-plan__feedback-grid">
                  {feedbackItems.map((item) => (
                    <article key={item.id}>
                      <span>{item.title}</span>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {isEditableSubmittedPlan(selectedPlan.status) && (
            <div className="submit-plan__footer-actions">
              <button type="button" onClick={() => openEditPlan(selectedPlan)}>
                {isRevisionResubmissionPlan(selectedPlan)
                  ? "ویرایش و ارسال مجدد طرح"
                  : "ویرایش این طرح"}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "business-details" && selectedPlan && (
        <div className="submit-plan__panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>اطلاعات همکاری تجاری</span>
              <h3>تکمیل اطلاعات نمایش موقعیت تجاری</h3>
              <p>
                این اطلاعات تا وقتی «انتشار نهایی در پنل همکار تجاری» را نزنید،
                فقط برای شما ذخیره می‌شود و در پنل همکاران تجاری نمایش داده
                نمی‌شود.
              </p>
            </div>

            <button type="button" onClick={() => openViewPlan(selectedPlan)}>
              بازگشت به مشاهده طرح
            </button>
          </div>

          <form
            className="submit-plan__upload-form"
            onSubmit={handleBusinessOpportunityDetailsSubmit}
          >
            <label className="submit-plan__input-group">
              <span>عنوان نمایش در پنل همکاری تجاری</span>
              <input
                type="text"
                value={businessForm.title}
                onChange={(event) =>
                  updateBusinessFormField("title", event.target.value)
                }
                placeholder="عنوان موقعیت همکاری"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>حوزه / دسته‌بندی</span>
              <input
                type="text"
                value={businessForm.field}
                onChange={(event) => {
                  updateBusinessFormField("field", event.target.value);
                  updateBusinessFormField("category", event.target.value);
                }}
                placeholder="مثلاً انرژی، سلامت دیجیتال، هوش مصنوعی صنعتی"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>نوع همکاری پیشنهادی</span>
              <input
                type="text"
                value={businessForm.collaborationType}
                onChange={(event) =>
                  updateBusinessFormField(
                    "collaborationType",
                    event.target.value,
                  )
                }
                placeholder="مثلاً سرمایه‌گذاری، توسعه بازار، اجرای پایلوت"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>محل اجرا یا بازار هدف</span>
              <input
                type="text"
                value={businessForm.location}
                onChange={(event) =>
                  updateBusinessFormField("location", event.target.value)
                }
                placeholder="مثلاً تهران، سراسر کشور، قابل مذاکره"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>برآورد حمایت یا سرمایه موردنیاز</span>
              <input
                type="text"
                value={businessForm.estimatedSupport}
                onChange={(event) =>
                  updateBusinessFormField(
                    "estimatedSupport",
                    event.target.value,
                  )
                }
                placeholder="مثلاً قابل مذاکره، ۵۰۰ میلیون تومان، حمایت غیرنقدی"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>بازه همکاری پیشنهادی</span>
              <input
                type="text"
                value={businessForm.duration}
                onChange={(event) =>
                  updateBusinessFormField("duration", event.target.value)
                }
                placeholder="مثلاً ۳ ماه پایلوت، ۶ ماه توسعه بازار"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>خلاصه موقعیت</span>
              <textarea
                rows="4"
                value={businessForm.summary}
                onChange={(event) =>
                  updateBusinessFormField("summary", event.target.value)
                }
                placeholder="خلاصه‌ای که همکار تجاری در ابتدای صفحه موقعیت می‌بیند"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>مسئله یا چالش</span>
              <textarea
                rows="4"
                value={businessForm.challenge}
                onChange={(event) =>
                  updateBusinessFormField("challenge", event.target.value)
                }
                placeholder="این طرح چه مسئله‌ای را برای بازار یا صنعت حل می‌کند؟"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>راهکار پیشنهادی</span>
              <textarea
                rows="4"
                value={businessForm.solution}
                onChange={(event) =>
                  updateBusinessFormField("solution", event.target.value)
                }
                placeholder="راهکار یا محصول شما برای حل این مسئله چیست؟"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>ارزش تجاری</span>
              <textarea
                rows="4"
                value={businessForm.businessValue}
                onChange={(event) =>
                  updateBusinessFormField("businessValue", event.target.value)
                }
                placeholder="چرا این طرح برای شریک تجاری جذاب است؟"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>نیازمندی‌های همکاری</span>
              <textarea
                rows="4"
                value={businessForm.requirements}
                onChange={(event) =>
                  updateBusinessFormField("requirements", event.target.value)
                }
                placeholder="هر مورد را در یک خط بنویسید"
              />
            </label>

            <label className="submit-plan__input-group">
              <span>برچسب‌ها</span>
              <input
                type="text"
                value={businessForm.tags}
                onChange={(event) =>
                  updateBusinessFormField("tags", event.target.value)
                }
                placeholder="با ویرگول جدا کنید؛ مثال: انرژی، پایلوت، توسعه بازار"
              />
            </label>

            <div className="submit-plan__footer-actions">
              <button type="button" onClick={() => openViewPlan(selectedPlan)}>
                انصراف
              </button>

              <button type="submit">ذخیره اطلاعات همکاری تجاری</button>

              <button
                type="button"
                onClick={handleBusinessOpportunityFinalPublish}
              >
                {selectedPlan.businessOpportunityPublished
                  ? "ذخیره و به‌روزرسانی انتشار"
                  : "ذخیره و انتشار نهایی در پنل همکار تجاری"}
              </button>
            </div>
          </form>

          {submitMessage && (
            <p className="submit-plan__success-message">{submitMessage}</p>
          )}
        </div>
      )}

      {(mode === "new" || mode === "edit") && (
        <div className="submit-plan__panel">
          <div className="submit-plan__wizard">
            <button
              type="button"
              className={
                submitStep === "select"
                  ? "submit-plan__wizard-step submit-plan__wizard-step--active"
                  : "submit-plan__wizard-step"
              }
              onClick={() => setSubmitStep("select")}
            >
              ۱. انتخاب فراخوان
            </button>

            <button
              type="button"
              className={
                submitStep === "upload"
                  ? "submit-plan__wizard-step submit-plan__wizard-step--active"
                  : "submit-plan__wizard-step"
              }
              disabled={!selectedCallId}
              onClick={() => {
                if (selectedCallId) {
                  setSubmitStep("upload");
                }
              }}
            >
              ۲. بارگذاری و ارسال
            </button>
          </div>

          {submitStep === "select" && (
            <>
              <div className="submit-plan__panel-header">
                <div>
                  <span>مرحله اول</span>
                  <h3>نوع فراخوان را انتخاب کنید</h3>
                </div>
              </div>

              <div className="submit-plan__call-grid">
                {CALL_OPTIONS.map((call) => (
                  <button
                    type="button"
                    key={call.id}
                    className={
                      selectedCallId === call.id
                        ? "submit-plan__call-card submit-plan__call-card--active"
                        : "submit-plan__call-card"
                    }
                    onClick={() => setSelectedCallId(call.id)}
                  >
                    <span>{call.status}</span>
                    <h4>{call.title}</h4>
                    <p>{call.field}</p>
                    <strong>ددلاین: {call.deadline}</strong>
                  </button>
                ))}
              </div>

              <div className="submit-plan__footer-actions">
                <button type="button" onClick={openList}>
                  بازگشت
                </button>

                <button
                  type="button"
                  disabled={!selectedCallId}
                  onClick={() => setSubmitStep("upload")}
                >
                  ادامه به مرحله آپلود
                </button>
              </div>
            </>
          )}

          {submitStep === "upload" && selectedCall && (
            <form
              className="submit-plan__upload-form"
              onSubmit={handleSubmitPlan}
            >
              <div className="submit-plan__deadline-box">
                <span>
                  {mode === "edit"
                    ? isRevisionResubmissionPlan(selectedPlan)
                      ? "ارسال مجدد طرح اصلاح‌شده"
                      : "ویرایش طرح"
                    : "فراخوان انتخاب‌شده"}
                </span>
                <h4>{selectedCall.title}</h4>
                <p>{selectedCall.field}</p>
                <strong>ددلاین ارسال: {selectedCall.deadline}</strong>
              </div>

              <label className="submit-plan__input-group">
                <span>عنوان طرح</span>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(event) => setPlanTitle(event.target.value)}
                  placeholder="عنوان طرح را وارد کنید"
                />
              </label>

              {hasFile && (
                <div className="submit-plan__current-file">
                  <div>
                    <span>فایل فعلی</span>
                    <strong>{uploadedFile?.name || existingFileName}</strong>
                  </div>

                  <button type="button" onClick={removeCurrentFile}>
                    حذف فایل
                  </button>
                </div>
              )}

              <label className="submit-plan__upload-box">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={handleFileChange}
                />

                <span>
                  {hasFile
                    ? "برای جایگزینی فایل، فایل جدید انتخاب کنید"
                    : "فایل پروپوزال یا مستندات طرح را آپلود کنید"}
                </span>

                <strong>PDF, DOC, DOCX یا ZIP</strong>
              </label>

              <div className="submit-plan__footer-actions">
                <button
                  type="button"
                  onClick={() =>
                    mode === "edit" ? openList() : setSubmitStep("select")
                  }
                >
                  {mode === "edit"
                    ? "انصراف از ویرایش"
                    : "بازگشت به انتخاب فراخوان"}
                </button>

                <button
                  type="submit"
                  className={mode === "edit" ? "submit-plan__edit-submit" : ""}
                  disabled={!hasFile}
                >
                  {mode === "edit"
                    ? isRevisionResubmissionPlan(selectedPlan)
                      ? "ارسال مجدد طرح"
                      : "ذخیره تغییرات"
                    : "ارسال طرح"}
                </button>
              </div>
            </form>
          )}

          {submitMessage && (
            <p className="submit-plan__success-message">{submitMessage}</p>
          )}
        </div>
      )}
    </section>
  );
}

function SitePublicationPanel() {
  const [requests, setRequests] = useState(() =>
    getInitialSitePublicationRequestsForCurrentUser(),
  );
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [mode, setMode] = useState("select");
  const [form, setForm] = useState(() => getDefaultSitePublicationForm());
  const [panelMessage, setPanelMessage] = useState("");
  const descriptionEditorRef = useRef(null);

  const selectedRequest = requests.find(
    (request) => String(request.id) === String(selectedRequestId),
  );

  useEffect(() => {
    if (mode !== "edit" || !descriptionEditorRef.current) {
      return;
    }

    descriptionEditorRef.current.innerHTML = form.contentHtml || "";
  }, [mode, selectedRequestId]);

  const refreshRequests = (message = "") => {
    const nextRequests = getInitialSitePublicationRequestsForCurrentUser();
    setRequests(nextRequests);

    if (selectedRequestId) {
      const updatedRequest = nextRequests.find(
        (request) => String(request.id) === String(selectedRequestId),
      );

      if (updatedRequest) {
        setForm(getDefaultSitePublicationForm(updatedRequest));
      }
    }

    setPanelMessage(message);
  };

  const openList = () => {
    setMode("select");
    setSelectedRequestId(null);
    setForm(getDefaultSitePublicationForm());
    setPanelMessage("");
  };

  const openEditor = (request) => {
    setSelectedRequestId(request.id);
    setForm(getDefaultSitePublicationForm(request));
    setMode("edit");
    setPanelMessage("");
  };

  const updateFormField = (fieldName, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const updatePercentField = (fieldName, value) => {
    const normalizedValue = normalizePercent(value);
    updateFormField(fieldName, normalizedValue);
  };

  const updateReport = (reportId, updates = {}) => {
    setForm((currentForm) => ({
      ...currentForm,
      reports: normalizeReportsForForm(currentForm.reports).map((report) =>
        report.id === reportId ? { ...report, ...updates } : report,
      ),
    }));
  };

  const addReport = () => {
    setForm((currentForm) => ({
      ...currentForm,
      reports: [
        ...normalizeReportsForForm(currentForm.reports),
        {
          ...DEFAULT_SITE_PUBLICATION_REPORT,
          id: makeLocalId("report"),
          title: `گزارش ${normalizeReportsForForm(currentForm.reports).length + 1}`,
        },
      ],
    }));
  };

  const removeReport = (reportId) => {
    setForm((currentForm) => {
      const nextReports = normalizeReportsForForm(currentForm.reports).filter(
        (report) => report.id !== reportId,
      );

      return {
        ...currentForm,
        reports: nextReports.length
          ? nextReports
          : [{ ...DEFAULT_SITE_PUBLICATION_REPORT }],
      };
    });
  };

  const toggleCooperationNeed = (need) => {
    setForm((currentForm) => {
      const currentNeeds = Array.isArray(currentForm.cooperationNeedTypes)
        ? currentForm.cooperationNeedTypes
        : [];
      const hasNeed = currentNeeds.includes(need);

      return {
        ...currentForm,
        cooperationNeedTypes: hasNeed
          ? currentNeeds.filter((item) => item !== need)
          : [...currentNeeds, need],
      };
    });
  };

  const syncEditorContent = () => {
    updateFormField(
      "contentHtml",
      descriptionEditorRef.current?.innerHTML || "",
    );
  };

  const applyEditorCommand = (command, value = null) => {
    if (!descriptionEditorRef.current) {
      return;
    }

    descriptionEditorRef.current.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const applyEditorLink = () => {
    const linkUrl = window.prompt("آدرس لینک را وارد کنید:");

    if (!linkUrl) {
      return;
    }

    applyEditorCommand("createLink", linkUrl);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const compressedImage = await readImageAsCompressedDataUrl(file);
      updateFormField("image", compressedImage);
      setPanelMessage("تصویر شاخص بارگذاری شد.");
    } catch (error) {
      setPanelMessage(error?.message || "بارگذاری تصویر انجام نشد.");
    }
  };

  const handleReportFileUpload = async (reportId, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const fileUrl = await readFileAsDataUrl(file);
      updateReport(reportId, {
        fileName: file.name,
        fileUrl,
        type: "file",
      });
      setPanelMessage("فایل گزارش بارگذاری شد.");
    } catch (error) {
      setPanelMessage(error?.message || "بارگذاری فایل گزارش انجام نشد.");
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setPanelMessage("عنوان صفحه پروژه را وارد کنید.");
      return false;
    }

    if (!form.summary.trim()) {
      setPanelMessage("خلاصه معرفی پروژه را وارد کنید.");
      return false;
    }

    if (!stripHtml(form.contentHtml).trim()) {
      setPanelMessage("توضیحات کامل پروژه را وارد کنید.");
      return false;
    }

    if (!form.field) {
      setPanelMessage("حوزه پروژه را انتخاب کنید.");
      return false;
    }

    if (!form.collaborationReadinessPercent || !form.commercializationPercent) {
      setPanelMessage("درصد آمادگی همکاری و ظرفیت تجاری‌سازی را وارد کنید.");
      return false;
    }

    if (!form.investmentNeed) {
      setPanelMessage("وضعیت نیاز به سرمایه را انتخاب کنید.");
      return false;
    }

    if (!form.cooperationNeedTypes.length) {
      setPanelMessage("حداقل یک نیازمندی همکاری یا توسعه را انتخاب کنید.");
      return false;
    }

    return true;
  };

  const handleSaveDraft = () => {
    if (!selectedRequest) {
      return;
    }

    saveSitePublicationDraft(
      selectedRequest.id,
      normalizeSitePublicationFormForSave(form),
    );

    refreshRequests("اطلاعات صفحه معرفی طرح به‌صورت پیش‌نویس ذخیره شد.");
  };

  const handlePreview = () => {
    if (!selectedRequest) {
      return;
    }

    saveSitePublicationPreviewItem({
      ...selectedRequest,
      draft: normalizeSitePublicationFormForSave(form),
    });

    window.open(
      "/business/opportunities/preview?preview=site-publication",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleSubmitToCommittee = () => {
    if (!selectedRequest || !validateForm()) {
      return;
    }

    const confirmed = window.confirm(
      "بعد از ارسال برای کمیته، تا زمان اعلام نتیجه امکان ویرایش این اطلاعات را ندارید. ارسال انجام شود؟",
    );

    if (!confirmed) {
      return;
    }

    submitSitePublicationDraft(
      selectedRequest.id,
      normalizeSitePublicationFormForSave(form),
    );

    refreshRequests("اطلاعات صفحه معرفی طرح برای بررسی کمیته ارسال شد.");
    setMode("select");
  };

  if (mode === "edit" && selectedRequest) {
    const isSubmitted =
      selectedRequest.status === SITE_PUBLICATION_STATUS.SUBMITTED_TO_COMMITTEE;
    const isPublished =
      selectedRequest.status === SITE_PUBLICATION_STATUS.PUBLISHED;
    const isLocked = isSubmitted || isPublished;

    return (
      <section className="submit-plan site-publication">
        <div className="submit-plan__header site-publication__header">
          <div>
            <span>طرح‌های معرفی‌شده</span>
            <h2>تکمیل اطلاعات طرح معرفی‌شده</h2>
            <p>
              اطلاعات این فرم بعد از بررسی و تأیید کمیته، بر اساس نوع معرفی در
              پنل همکار تجاری یا سایت نمایش داده می‌شود.
            </p>
          </div>

          <button
            type="button"
            className="site-publication__back-button"
            onClick={openList}
          >
            ← بازگشت به انتخاب طرح
          </button>
        </div>

        <div className="submit-plan__panel site-publication__editor-panel">
          <div className="submit-plan__panel-header">
            <div>
              <span>
                {selectedRequest.trackingCode || selectedRequest.planId}
              </span>
              <h3>{selectedRequest.planTitle}</h3>
            </div>

            <span
              className={`submit-plan__status submit-plan__status--${getSitePublicationStatusClass(
                selectedRequest.status,
              )}`}
            >
              {selectedRequest.status}
            </span>
          </div>

          <div className="site-publication__meta-grid">
            <article>
              <span>نوع معرفی</span>
              <strong>
                {selectedRequest.publicationType || selectedRequest.destination}
              </strong>
            </article>
            <article>
              <span>فناور</span>
              <strong>{selectedRequest.innovatorName}</strong>
            </article>
            <article>
              <span>فراخوان</span>
              <strong>{selectedRequest.callTitle || "ثبت نشده"}</strong>
            </article>
            <article>
              <span>آخرین به‌روزرسانی</span>
              <strong>
                {selectedRequest.updatedAt || selectedRequest.createdAt}
              </strong>
            </article>
          </div>

          {selectedRequest.committeeFeedback && (
            <div className="submit-plan__feedbacks site-publication__feedback-box">
              <article>
                <strong>بازخورد کمیته برای اصلاح</strong>
                <p>{selectedRequest.committeeFeedback}</p>
              </article>
            </div>
          )}

          {isSubmitted && (
            <p className="submit-plan__success-message">
              این اطلاعات برای کمیته ارسال شده و تا اعلام نتیجه، امکان ویرایش
              ندارد.
            </p>
          )}

          {isPublished && (
            <p className="submit-plan__success-message">
              این صفحه توسط کمیته در سایت منتشر شده است.
            </p>
          )}

          <form
            className="submit-plan__upload-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="submit-plan__input-group site-publication__full-row">
              <span>تصویر شاخص پروژه</span>
              <div className="site-publication__image-tools">
                {form.image ? (
                  <img src={form.image} alt="پیش‌نمایش تصویر پروژه" />
                ) : (
                  <div className="site-publication__image-placeholder">
                    هنوز تصویری انتخاب نشده است.
                  </div>
                )}

                <div>
                  <label className="site-publication__upload-button">
                    آپلود تصویر
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLocked}
                    />
                  </label>

                  <button
                    type="button"
                    className="site-publication__ghost-button"
                    onClick={() => updateFormField("image", "")}
                    disabled={isLocked || !form.image}
                  >
                    حذف تصویر
                  </button>
                </div>
              </div>
            </div>

            <label className="submit-plan__input-group">
              <span>عنوان صفحه پروژه / دستاورد</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateFormField("title", event.target.value)
                }
                placeholder="مثلاً سامانه هوشمند مدیریت انرژی"
                disabled={isLocked}
              />
            </label>

            <label className="submit-plan__input-group">
              <span>حوزه پروژه</span>
              <select
                value={form.field}
                onChange={(event) =>
                  updateFormField("field", event.target.value)
                }
                disabled={isLocked}
              >
                <option value="">انتخاب حوزه</option>
                {SITE_PUBLICATION_FIELD_OPTIONS.map((fieldOption) => (
                  <option value={fieldOption} key={fieldOption}>
                    {fieldOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="submit-plan__input-group">
              <span>خلاصه معرفی / توضیح هیرو</span>
              <textarea
                rows="3"
                value={form.summary}
                onChange={(event) =>
                  updateFormField("summary", event.target.value)
                }
                placeholder="این متن در بخش هیرو صفحه داخلی پروژه نمایش داده می‌شود"
                disabled={isLocked}
              />
            </label>

            <div className="submit-plan__input-group site-publication__full-row">
              <span>توضیحات کامل پروژه</span>
              <div className="site-publication__editor-toolbar">
                <button
                  type="button"
                  onClick={() => applyEditorCommand("bold")}
                  disabled={isLocked}
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand("underline")}
                  disabled={isLocked}
                >
                  Underline
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand("formatBlock", "h3")}
                  disabled={isLocked}
                >
                  تیتر
                </button>
                <button
                  type="button"
                  onClick={applyEditorLink}
                  disabled={isLocked}
                >
                  لینک
                </button>
              </div>
              <div
                ref={descriptionEditorRef}
                className="site-publication__rich-editor"
                contentEditable={!isLocked}
                suppressContentEditableWarning
                onInput={syncEditorContent}
                data-placeholder="توضیحات اصلی صفحه داخلی پروژه را وارد کنید"
              />
            </div>

            <div className="site-publication__percent-row site-publication__full-row">
              <div className="submit-plan__input-group site-publication__percent-field">
                <div className="site-publication__percent-head">
                  <span>آمادگی همکاری</span>
                  <strong>{form.collaborationReadinessPercent || 0}%</strong>
                </div>
                <div className="site-publication__percent-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={form.collaborationReadinessPercent || 0}
                    onChange={(event) =>
                      updatePercentField(
                        "collaborationReadinessPercent",
                        event.target.value,
                      )
                    }
                    disabled={isLocked}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    step="1"
                    value={form.collaborationReadinessPercent}
                    onChange={(event) =>
                      updatePercentField(
                        "collaborationReadinessPercent",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      updatePercentField(
                        "collaborationReadinessPercent",
                        event.target.value,
                      )
                    }
                    placeholder="۰ تا ۱۰۰"
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="submit-plan__input-group site-publication__percent-field">
                <div className="site-publication__percent-head">
                  <span>ظرفیت تجاری‌سازی</span>
                  <strong>{form.commercializationPercent || 0}%</strong>
                </div>
                <div className="site-publication__percent-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={form.commercializationPercent || 0}
                    onChange={(event) =>
                      updatePercentField(
                        "commercializationPercent",
                        event.target.value,
                      )
                    }
                    disabled={isLocked}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    step="1"
                    value={form.commercializationPercent}
                    onChange={(event) =>
                      updatePercentField(
                        "commercializationPercent",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      updatePercentField(
                        "commercializationPercent",
                        event.target.value,
                      )
                    }
                    placeholder="۰ تا ۱۰۰"
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>

            <label className="submit-plan__input-group">
              <span>نیاز به سرمایه</span>
              <select
                value={form.investmentNeed}
                onChange={(event) =>
                  updateFormField("investmentNeed", event.target.value)
                }
                disabled={isLocked}
              >
                <option value="">انتخاب وضعیت سرمایه</option>
                {INVESTMENT_NEED_OPTIONS.map((investmentOption) => (
                  <option value={investmentOption} key={investmentOption}>
                    {investmentOption}
                  </option>
                ))}
              </select>
            </label>

            <div className="submit-plan__input-group site-publication__full-row">
              <span>نیازمندی همکاری یا توسعه</span>
              <div className="site-publication__checkbox-grid">
                {COOPERATION_NEED_OPTIONS.map((need) => (
                  <label key={need}>
                    <input
                      type="checkbox"
                      checked={form.cooperationNeedTypes.includes(need)}
                      onChange={() => toggleCooperationNeed(need)}
                      disabled={isLocked}
                    />
                    {need}
                  </label>
                ))}
              </div>
            </div>

            <div className="site-publication__reports site-publication__full-row">
              <div className="site-publication__reports-header">
                <div>
                  <span>گزارش‌ها و مستندات</span>
                  <p>
                    برای هر گزارش می‌توانید توضیح متنی و فایل جداگانه ثبت کنید.
                  </p>
                </div>
                <button type="button" onClick={addReport} disabled={isLocked}>
                  افزودن گزارش
                </button>
              </div>

              {normalizeReportsForForm(form.reports).map((report, index) => (
                <article
                  className="site-publication__report-editor"
                  key={report.id}
                >
                  <div className="site-publication__report-editor-head">
                    <strong>گزارش {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeReport(report.id)}
                      disabled={isLocked}
                    >
                      حذف گزارش
                    </button>
                  </div>

                  <label>
                    عنوان گزارش
                    <input
                      type="text"
                      value={report.title}
                      onChange={(event) =>
                        updateReport(report.id, { title: event.target.value })
                      }
                      disabled={isLocked}
                    />
                  </label>

                  <label>
                    وضعیت گزارش
                    <select
                      value={report.status}
                      onChange={(event) =>
                        updateReport(report.id, { status: event.target.value })
                      }
                      disabled={isLocked}
                    >
                      <option value="تکمیل شده">تکمیل شده</option>
                      <option value="در حال تکمیل">در حال تکمیل</option>
                      <option value="نیازمند بررسی">نیازمند بررسی</option>
                    </select>
                  </label>

                  <label className="site-publication__report-text">
                    متن گزارش
                    <textarea
                      rows="3"
                      value={report.text}
                      onChange={(event) =>
                        updateReport(report.id, { text: event.target.value })
                      }
                      disabled={isLocked}
                    />
                  </label>

                  <div className="site-publication__report-file-row">
                    <label className="site-publication__upload-button">
                      آپلود فایل گزارش
                      <input
                        type="file"
                        onChange={(event) =>
                          handleReportFileUpload(report.id, event)
                        }
                        disabled={isLocked}
                      />
                    </label>
                    {report.fileName ? (
                      <span>{report.fileName}</span>
                    ) : (
                      <span>فایلی انتخاب نشده است.</span>
                    )}
                    <button
                      type="button"
                      className="site-publication__ghost-button"
                      onClick={() =>
                        updateReport(report.id, {
                          fileName: "",
                          fileUrl: "",
                          type: "text",
                        })
                      }
                      disabled={isLocked || !report.fileUrl}
                    >
                      حذف فایل
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="submit-plan__footer-actions site-publication__footer-actions">
              <button
                type="button"
                onClick={openList}
                className="site-publication__secondary-button"
              >
                بازگشت
              </button>

              <button type="button" onClick={handlePreview}>
                پیش‌نمایش
              </button>

              {!isSubmitted && !isPublished && (
                <>
                  <button type="button" onClick={handleSaveDraft}>
                    ذخیره پیش‌نویس
                  </button>

                  <button type="button" onClick={handleSubmitToCommittee}>
                    ارسال برای بررسی کمیته
                  </button>
                </>
              )}
            </div>
          </form>

          {panelMessage && (
            <p className="submit-plan__success-message">{panelMessage}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="submit-plan site-publication">
      <div className="submit-plan__header site-publication__header">
        <div>
          <span>طرح‌های معرفی‌شده</span>
          <h2>انتخاب طرح برای تکمیل اطلاعات معرفی</h2>
          <p>
            این بخش شامل طرح‌هایی است که کمیته برای موقعیت تجاری یا پروژه موفق
            معرفی کرده است. ابتدا یک طرح را انتخاب کنید و بعد اطلاعات لازم را
            تکمیل کنید.
          </p>
        </div>
      </div>

      <div className="submit-plan__panel site-publication__selection-panel">
        <div className="submit-plan__panel-header">
          <div>
            <span>مرحله اول</span>
            <h3>انتخاب از بین طرح‌های معرفی‌شده</h3>
          </div>
        </div>

        {requests.length > 0 ? (
          <div className="site-publication__selection-grid">
            {sortIntroducedPlanRequests(requests).map((request, index) => {
              const hasDraft = hasSitePublicationDraft(request);

              return (
                <article
                  className="site-publication__selection-card"
                  key={request.id}
                >
                  <div className="site-publication__selection-order">
                    {index + 1}
                  </div>

                  <div className="site-publication__selection-content">
                    <div className="site-publication__selection-topline">
                      <span>{request.trackingCode || request.planId}</span>
                      <div className="site-publication__selection-badges">
                        {hasDraft &&
                          request.status ===
                            SITE_PUBLICATION_STATUS.WAITING_FOR_INNOVATOR && (
                            <span className="site-publication__draft-badge">
                              پیش‌نویس
                            </span>
                          )}
                        <span
                          className={`submit-plan__status submit-plan__status--${getSitePublicationStatusClass(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <h4>{request.planTitle}</h4>

                    <dl>
                      <div>
                        <dt>نوع معرفی</dt>
                        <dd>
                          {request.publicationType || request.destination}
                        </dd>
                      </div>
                      <div>
                        <dt>فراخوان</dt>
                        <dd>{request.callTitle || "ثبت نشده"}</dd>
                      </div>
                      <div>
                        <dt>آخرین به‌روزرسانی</dt>
                        <dd>{request.updatedAt || request.createdAt}</dd>
                      </div>
                      <div>
                        <dt>وضعیت نهایی طرح</dt>
                        <dd>{request.finalStatus || "ثبت نشده"}</dd>
                      </div>
                    </dl>

                    {request.committeeFeedback && (
                      <p className="site-publication__selection-feedback">
                        بازخورد کمیته: {request.committeeFeedback}
                      </p>
                    )}
                  </div>

                  <div className="site-publication__selection-actions">
                    <button type="button" onClick={() => openEditor(request)}>
                      {getSitePublicationActionLabel(request.status)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="submit-plan__empty-state site-publication__empty-state">
            <h3>فعلاً طرحی برای تکمیل معرفی نشده است.</h3>
            <p>
              اگر کمیته در مرحله تعیین‌تکلیف، گزینه معرفی به موقعیت تجاری یا
              معرفی برای پروژه‌های موفق را فعال کند، طرح در این بخش نمایش داده
              می‌شود.
            </p>
          </div>
        )}

        {panelMessage && (
          <p className="submit-plan__success-message">{panelMessage}</p>
        )}
      </div>
    </section>
  );
}

function SelectedPlansPanel() {
  const acceptedPlans = getInitialSubmittedPlansForCurrentUser().filter(
    (plan) => ACCEPTED_PLAN_STATUSES.includes(plan.status),
  );

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [projectTasks, setProjectTasks] = useState(() =>
    getInitialSelectedPlanTasksForCurrentUser(),
  );
  const [taskSubmitMessage, setTaskSubmitMessage] = useState("");

  const selectedPlan = acceptedPlans.find((plan) => plan.id === selectedPlanId);
  const selectedPlanTasks = selectedPlan
    ? projectTasks[selectedPlan.id] || []
    : [];
  const selectedTask = selectedPlanTasks.find(
    (task) => task.id === selectedTaskId,
  );

  const openPlan = (planId) => {
    setSelectedPlanId(planId);
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const closePlan = () => {
    setSelectedPlanId(null);
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const reloadProjectTasks = () => {
    setProjectTasks(getInitialSelectedPlanTasksForCurrentUser());
  };

  const updateTask = (planId, taskId, updates) => {
    updateTaskInService(taskId, updates);
    setProjectTasks((currentTasks) => ({
      ...currentTasks,
      [planId]: (currentTasks[planId] || []).map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const openTask = (taskId) => {
    const task = selectedPlanTasks.find((item) => item.id === taskId);

    if (selectedPlan && task?.isNew) {
      markTaskViewed(taskId);
      updateTask(selectedPlan.id, taskId, {
        status: "مشاهده شده",
        isNew: false,
      });
    }

    setSelectedTaskId(taskId);
    setTaskSubmitMessage("");
  };

  const closeTask = () => {
    setSelectedTaskId(null);
    setTaskSubmitMessage("");
  };

  const handleTaskFileChange = (planId, taskId, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateTask(planId, taskId, {
      fileName: file.name,
    });
  };

  const removeTaskFile = (planId, taskId) => {
    updateTask(planId, taskId, {
      fileName: "",
    });
  };

  const saveTaskResponse = (planId, taskId) => {
    const task = (projectTasks[planId] || []).find(
      (item) => item.id === taskId,
    );

    submitTaskResponse(taskId, {
      description: task?.description || "",
      fileName: task?.fileName || "",
    });

    updateTask(planId, taskId, {
      status: "ارسال شده",
      isNew: false,
    });

    setTaskSubmitMessage("پاسخ شما با موفقیت برای مدیر ارسال شد.");

    window.setTimeout(() => {
      reloadProjectTasks();
      setTaskSubmitMessage("");
      setSelectedTaskId(null);
    }, 1100);
  };

  if (selectedPlan && selectedTask) {
    const hasDeadline =
      selectedTask.deadline && selectedTask.status !== "پایان یافته";

    const taskIsLocked = isLockedTaskStatus(selectedTask.status);

    return (
      <section className="selected-plans">
        <div className="selected-plans__panel">
          <div className="selected-plans__panel-header">
            <div>
              <span>جزئیات وظیفه</span>
              <h3>{selectedTask.title}</h3>
              <p>{selectedPlan.title}</p>
            </div>

            <button
              type="button"
              className="selected-plans__back-button"
              onClick={closeTask}
            >
              <BackIcon />
              بازگشت به وظایف
            </button>
          </div>

          <div
            className={`selected-plans__task-detail-hero ${
              hasDeadline ? "" : "selected-plans__task-detail-hero--single"
            }`}
          >
            {hasDeadline && (
              <div>
                <span>ددلاین وظیفه</span>
                <strong>{selectedTask.deadline}</strong>
              </div>
            )}

            <div>
              <span>وضعیت وظیفه</span>
              <b
                className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                  selectedTask.status,
                )}`}
              >
                {selectedTask.status}
              </b>
            </div>
          </div>

          <div className="selected-plans__message-grid">
            <div>
              <span>پیام یا توضیحات مدیر</span>
              <p>{selectedTask.managerMessage || "پیامی ثبت نشده است."}</p>
            </div>

            <div>
              <span>بازخورد مدیر</span>
              <p>
                {selectedTask.managerFeedback ||
                  "هنوز بازخوردی از طرف مدیر ثبت نشده است."}
              </p>
            </div>
          </div>

          <label className="selected-plans__description">
            <span>توضیحات شما</span>
            <textarea
              value={selectedTask.description}
              readOnly={taskIsLocked}
              onChange={(event) =>
                updateTask(selectedPlan.id, selectedTask.id, {
                  description: event.target.value,
                })
              }
              placeholder="توضیحات خود را برای مدیر وارد کنید..."
            />
          </label>

          <div className="selected-plans__upload-row">
            <div className="selected-plans__file-box">
              <span>فایل ارسالی</span>

              {selectedTask.fileName ? (
                <strong>{selectedTask.fileName}</strong>
              ) : (
                <strong>هنوز فایلی بارگذاری نشده است</strong>
              )}
            </div>

            {!taskIsLocked && (
              <div className="selected-plans__task-actions">
                <label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(event) =>
                      handleTaskFileChange(
                        selectedPlan.id,
                        selectedTask.id,
                        event,
                      )
                    }
                  />
                  {selectedTask.fileName ? "ویرایش فایل" : "آپلود فایل"}
                </label>

                {selectedTask.fileName && (
                  <button
                    type="button"
                    onClick={() =>
                      removeTaskFile(selectedPlan.id, selectedTask.id)
                    }
                  >
                    حذف فایل
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    saveTaskResponse(selectedPlan.id, selectedTask.id)
                  }
                >
                  ارسال پاسخ
                </button>
              </div>
            )}
          </div>

          {taskIsLocked && (
            <div className="selected-plans__locked-note">
              این وظیفه قابل ویرایش، حذف فایل یا ارسال مجدد نیست.
            </div>
          )}

          {taskSubmitMessage && (
            <p className="selected-plans__success-message">
              {taskSubmitMessage}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (selectedPlan) {
    const selectedNearestDeadline = getNearestTaskDeadline(selectedPlanTasks);

    return (
      <section className="selected-plans">
        <div className="selected-plans__panel">
          <div className="selected-plans__panel-header">
            <div>
              <span>طرح انتخاب‌شده</span>
              <h3>{selectedPlan.title}</h3>
              <p>{selectedPlan.call}</p>
            </div>

            <button
              type="button"
              className="selected-plans__back-button"
              onClick={closePlan}
            >
              <BackIcon />
              بازگشت به طرح‌ها
            </button>
          </div>

          <div className="selected-plans__summary">
            <div>
              <span>وضعیت طرح</span>
              <StatusBadge
                status={selectedPlan.status}
                className="submit-plan__status--inline"
              />
            </div>

            <div>
              <span>تعداد وظایف</span>
              <strong>{selectedPlanTasks.length} وظیفه</strong>
            </div>

            <div>
              <span>نزدیک‌ترین ددلاین</span>
              <strong>{selectedNearestDeadline}</strong>
            </div>

            <div>
              <span>فایل اصلی طرح</span>
              <a
                href={getDownloadHref(selectedPlan)}
                download={selectedPlan.fileName}
              >
                <DownloadIcon />
                دانلود فایل
              </a>
            </div>
          </div>

          <section className="selected-plans__tasks">
            <div className="selected-plans__section-title">
              <span>وظایف</span>
              <h3>وظایف تعریف‌شده توسط مدیر سامانه</h3>
              <p>
                هر وظیفه شامل ددلاین، وضعیت، توضیحات مدیر، محل بارگذاری فایل و
                توضیحات شما است.
              </p>
            </div>

            <div className="selected-plans__task-card-grid">
              {selectedPlanTasks.map((task) => {
                const hasDeadline =
                  task.deadline && task.status !== "پایان یافته";

                return (
                  <article
                    className="selected-plans__task-preview-card"
                    key={task.id}
                  >
                    <div className="selected-plans__task-preview-top">
                      <div className="selected-plans__task-title-wrap">
                        <h4>
                          <span>{task.title}</span>

                          {task.isNew && (
                            <span className="selected-plans__new-label">
                              جدید
                            </span>
                          )}
                        </h4>
                      </div>

                      <span
                        className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {hasDeadline ? (
                      <div className="selected-plans__deadline-pill">
                        <span>ددلاین</span>
                        <strong>{task.deadline}</strong>
                      </div>
                    ) : (
                      <div
                        className="selected-plans__deadline-placeholder"
                        aria-hidden="true"
                      />
                    )}

                    <p>{task.managerMessage}</p>

                    <button type="button" onClick={() => openTask(task.id)}>
                      مشاهده وظیفه
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="selected-plans">
      <div className="selected-plans__panel">
        <div className="selected-plans__panel-header">
          <div>
            <span>طرح‌های انتخاب‌شده</span>
            <h3>طرح‌های قبول‌شده یا قبول ضعیف</h3>
            <p>
              این بخش فقط شامل طرح‌هایی است که نتیجه نهایی آن‌ها قبول یا قبول
              ضعیف اعلام شده است.
            </p>
          </div>
        </div>

        <div className="selected-plans__grid">
          {acceptedPlans.map((plan) => {
            const planTasks = projectTasks[plan.id] || [];
            const hasNewTask = planTasks.some((task) => task.isNew);
            const nearestDeadline = getNearestTaskDeadline(planTasks);

            return (
              <article className="selected-plans__card" key={plan.id}>
                <div className="selected-plans__card-top">
                  <StatusBadge
                    status={plan.status}
                    className="submit-plan__status--inline"
                  />

                  {hasNewTask && (
                    <span className="selected-plans__project-new-badge">
                      وظیفه جدید
                    </span>
                  )}
                </div>

                <h4>{plan.title}</h4>
                <p>{plan.call}</p>

                <div className="selected-plans__meta">
                  <span>تعداد وظایف: {planTasks.length} وظیفه</span>
                  <span>نزدیک‌ترین ددلاین: {nearestDeadline}</span>
                </div>

                <button type="button" onClick={() => openPlan(plan.id)}>
                  ورود به طرح
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getRegisteredActivityDetails(registration) {
  if (registration.activityType === "event") {
    const activity = getPublicEventById(registration.activityId, {
      includePreview: true,
    });

    return {
      activity,
      typeLabel: "رویداد",
      detailsPath: `/events/${registration.activityId}`,
      dateLabel: activity?.eventDate || activity?.startDate || "تاریخ نامشخص",
      metaLabel: activity?.location || activity?.format || "جزئیات ثبت نشده",
    };
  }

  const activity = getPublicCourseById(registration.activityId, {
    includePreview: true,
  });

  return {
    activity,
    typeLabel: "دوره",
    detailsPath: `/courses/${registration.activityId}`,
    dateLabel: activity?.startDate || "تاریخ نامشخص",
    metaLabel: activity?.instructor || activity?.format || "جزئیات ثبت نشده",
  };
}

function RegisteredActivitiesPanel() {
  const registrations = getCurrentUserActivityRegistrations();

  const registeredActivities = registrations.map((registration) => {
    const details = getRegisteredActivityDetails(registration);
    const notices = getParticipantNoticesForCurrentUserByActivityId(
      registration.activityId,
    );

    return {
      registration,
      ...details,
      notices,
      title: details.activity?.title || registration.activityTitle,
    };
  });

  return (
    <section className="selected-plans">
      <div className="selected-plans__panel">
        <div className="selected-plans__header">
          <div>
            <span>دوره‌ها و رویدادهای من</span>
            <h3>برنامه‌هایی که در آن‌ها ثبت‌نام کرده‌اید</h3>
            <p>
              این بخش فقط برنامه‌هایی را نشان می‌دهد که با حساب کاربری فعلی شما
              ثبت‌نام شده‌اند.
            </p>
          </div>
        </div>

        <div className="selected-plans__grid">
          {registeredActivities.map(
            ({
              registration,
              activity,
              typeLabel,
              detailsPath,
              dateLabel,
              metaLabel,
              title,
              notices,
            }) => (
              <article className="selected-plans__card" key={registration.id}>
                <div>
                  <span>{typeLabel}</span>
                  <h4>{title}</h4>
                  <p>{metaLabel}</p>
                </div>

                <div className="selected-plans__meta">
                  <span>تاریخ ثبت‌نام: {registration.registeredAt}</span>
                  <span>تاریخ برگزاری: {dateLabel}</span>
                  <span>
                    وضعیت:{" "}
                    {activity?.status === "past" ? "برگزار شده" : "ثبت‌نام شده"}
                  </span>
                </div>

                {notices.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      marginTop: "4px",
                      padding: "14px",
                      borderRadius: "16px",
                      background: "rgba(1, 210, 201, 0.08)",
                      border: "1px solid rgba(1, 210, 201, 0.2)",
                    }}
                  >
                    <strong
                      style={{
                        color: "#0a274f",
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      آخرین اطلاعیه‌های مدرس
                    </strong>
                    {notices.slice(0, 3).map((notice) => (
                      <div
                        key={notice.id}
                        style={{
                          display: "grid",
                          gap: "4px",
                          paddingBottom: "8px",
                          borderBottom: "1px solid rgba(10, 39, 79, 0.08)",
                        }}
                      >
                        <span
                          style={{
                            color: "#0a274f",
                            fontSize: "12px",
                            fontWeight: 800,
                          }}
                        >
                          {notice.title}
                        </span>
                        <small
                          style={{
                            color: "#667085",
                            fontSize: "11px",
                            lineHeight: 1.9,
                          }}
                        >
                          {notice.message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to={detailsPath}
                  style={{
                    width: "fit-content",
                    minHeight: "42px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "auto",
                    padding: "0 18px",
                    borderRadius: "14px",
                    color: "#ffffff",
                    background: "#19b4e9",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  مشاهده جزئیات
                </Link>
              </article>
            ),
          )}

          {registeredActivities.length === 0 && (
            <div className="selected-plans__empty">
              هنوز در هیچ دوره یا رویدادی ثبت‌نام نکرده‌اید.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SupportRequestsPanel() {
  const supportRoleName = "فناور";
  const [requests, setRequests] = useState(() =>
    getCurrentUserSupportTickets(supportRoleName),
  );
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const refreshRequests = () => {
    setRequests(getCurrentUserSupportTickets(supportRoleName));
  };

  const selectedRequest = requests.find(
    (request) => String(request.id) === String(selectedRequestId),
  );

  const openNewRequest = () => {
    setMode("new");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
    refreshRequests();
  };

  const openList = () => {
    setMode("list");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
    refreshRequests();
  };

  const openRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setMode("view");
    refreshRequests();
  };

  const deleteRequest = (requestId) => {
    const targetRequest = requests.find(
      (request) => String(request.id) === String(requestId),
    );

    if (!targetRequest || targetRequest.seenBySupport) {
      return;
    }

    const confirmed = window.confirm("آیا از حذف این درخواست مطمئن هستید؟");

    if (!confirmed) {
      return;
    }

    deleteSupportTicket(requestId);
    refreshRequests();
  };

  const submitRequest = (event) => {
    event.preventDefault();

    if (!requestMessage.trim()) {
      return;
    }

    addSupportTicket(
      {
        title: requestTitle.trim() || "درخواست جدید",
        message: requestMessage.trim(),
      },
      supportRoleName,
    );

    openList();
  };

  if (mode === "new") {
    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>درخواست جدید</span>
              <h3>ثبت درخواست پشتیبانی</h3>
              <p>
                درخواست شما برای کمیته/دبیرخانه ثبت می‌شود و پاسخ آن در همین بخش
                و در پیام‌ها نمایش داده خواهد شد.
              </p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <form className="support-requests__form" onSubmit={submitRequest}>
            <label>
              <span>عنوان درخواست</span>
              <input
                type="text"
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                placeholder="مثلاً مشکل در بارگذاری فایل"
              />
            </label>

            <label>
              <span>متن درخواست</span>
              <textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="متن درخواست خود را وارد کنید..."
              />
            </label>

            <div className="support-requests__form-actions">
              <button
                type="button"
                className="support-requests__neutral-button"
                onClick={openList}
              >
                انصراف
              </button>

              <button type="submit" disabled={!requestMessage.trim()}>
                ثبت درخواست
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (mode === "view" && selectedRequest) {
    const hasReply = Boolean(
      selectedRequest.supportReply || selectedRequest.reply,
    );
    const canDelete = !selectedRequest.seenBySupport;

    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>جزئیات درخواست</span>
              <h3>{selectedRequest.title}</h3>
              <p>ارسال شده در {selectedRequest.sentAt}</p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <div className="support-requests__detail-grid support-requests__detail-grid--compact">
            <div>
              <span>زمان ارسال</span>
              <strong>{selectedRequest.sentAt}</strong>
            </div>

            <div>
              <span>زمان پاسخ</span>
              <strong>
                {hasReply ? selectedRequest.repliedAt : "هنوز پاسخ ثبت نشده"}
              </strong>
            </div>
          </div>

          <div className="support-requests__conversation">
            <article className="support-requests__message support-requests__message--user">
              <span>پیام شما</span>
              <p>{selectedRequest.message}</p>
            </article>

            {hasReply ? (
              <article className="support-requests__message support-requests__message--support">
                <span>پاسخ کمیته/دبیرخانه</span>
                <p>{selectedRequest.supportReply || selectedRequest.reply}</p>
              </article>
            ) : (
              <article className="support-requests__empty-reply">
                هنوز پاسخی برای این درخواست ثبت نشده است.
              </article>
            )}
          </div>

          {canDelete && (
            <div className="support-requests__detail-actions">
              <button
                type="button"
                className="support-requests__delete-button"
                onClick={() => {
                  deleteRequest(selectedRequest.id);
                  openList();
                }}
              >
                حذف درخواست
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="support-requests">
      <div className="support-requests__panel">
        <div className="support-requests__panel-header">
          <div>
            <span>درخواست‌ها</span>
            <h3>درخواست‌ها و پشتیبانی</h3>
            <p>
              درخواست‌های شما، وضعیت پیگیری و پاسخ‌های کمیته/دبیرخانه در این بخش
              نمایش داده می‌شود.
            </p>
          </div>

          <button type="button" onClick={openNewRequest}>
            ثبت درخواست جدید
          </button>
        </div>

        <div className="support-requests__list">
          {requests.map((request) => {
            const hasReply = Boolean(request.supportReply || request.reply);
            const canDelete = !request.seenBySupport;

            return (
              <article className="support-requests__card" key={request.id}>
                <div className="support-requests__card-main">
                  <div className="support-requests__card-title">
                    <h4>{request.title}</h4>
                    {hasReply && (
                      <span className="support-requests__reply-badge">
                        پاسخ دریافت شده
                      </span>
                    )}
                    {!hasReply && (
                      <span className="support-requests__waiting-badge">
                        {request.status || "در انتظار پیگیری"}
                      </span>
                    )}
                  </div>

                  <p>{request.message}</p>

                  <div className="support-requests__meta">
                    <span>ارسال: {request.sentAt}</span>
                    <span>
                      پاسخ: {hasReply ? request.repliedAt : "در انتظار پاسخ"}
                    </span>
                  </div>
                </div>

                <div className="support-requests__actions">
                  <button type="button" onClick={() => openRequest(request.id)}>
                    مشاهده
                  </button>

                  {canDelete && (
                    <button
                      type="button"
                      className="support-requests__delete-button"
                      onClick={() => deleteRequest(request.id)}
                    >
                      حذف
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {requests.length === 0 && (
            <div className="support-requests__empty-reply">
              هنوز درخواستی ثبت نشده است.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MessagesPanel() {
  const [messages, setMessages] = useState(() =>
    getNotificationsForCurrentUser(),
  );
  const [filter, setFilter] = useState("all");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const refreshMessages = () => {
    setMessages(getNotificationsForCurrentUser());
  };

  const selectedMessage = messages.find(
    (message) => String(message.id) === String(selectedMessageId),
  );

  const unreadCount = messages.filter((message) => !message.isRead).length;
  const importantCount = messages.filter(
    (message) => message.isImportant,
  ).length;

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.isRead;
    if (filter === "important") return message.isImportant;
    return true;
  });

  const markAllAsRead = () => {
    markAllNotificationsAsReadForCurrentUser();
    refreshMessages();
  };

  const deleteAllMessages = () => {
    if (!window.confirm("آیا از حذف همه پیام‌ها مطمئن هستید؟")) return;
    deleteAllNotificationsForCurrentUser();
    setSelectedMessageId(null);
    refreshMessages();
  };

  const openMessage = (messageId) => {
    markNotificationAsRead(messageId);
    setSelectedMessageId(messageId);
    refreshMessages();
  };

  const removeMessage = (messageId) => {
    deleteNotification(messageId);
    if (String(selectedMessageId) === String(messageId)) {
      setSelectedMessageId(null);
    }
    refreshMessages();
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <div className="messages-panel__panel">
          <div className="messages-panel__panel-header">
            <div>
              <span>جزئیات پیام</span>
              <h3>{selectedMessage.title}</h3>
              <p>
                {selectedMessage.category} / {selectedMessage.sentAt}
              </p>
            </div>

            <button
              type="button"
              className="messages-panel__back-button"
              onClick={() => {
                setSelectedMessageId(null);
                refreshMessages();
              }}
            >
              بازگشت
            </button>
          </div>

          <article className="messages-panel__detail-card">
            {selectedMessage.isImportant && (
              <span className="messages-panel__important-badge">مهم</span>
            )}
            <p>{selectedMessage.body}</p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="messages-panel">
      <div className="messages-panel__panel">
        <div className="messages-panel__panel-header">
          <div>
            <span>پیام‌ها و اعلانات</span>
            <h3>اعلان‌های سامانه</h3>
            <p>
              اعلان‌های مربوط به درخواست‌ها، پاسخ‌ها، وظایف و فعالیت‌های جدید
              اینجا نمایش داده می‌شود.
            </p>
          </div>

          <div className="messages-panel__header-actions">
            <button type="button" onClick={markAllAsRead}>
              خواندن همه
            </button>
            <button
              type="button"
              className="messages-panel__delete-all-button"
              onClick={deleteAllMessages}
              disabled={messages.length === 0}
            >
              ×
            </button>
          </div>
        </div>

        <div className="messages-panel__filters">
          <button
            type="button"
            className={filter === "all" ? "messages-panel__filter--active" : ""}
            onClick={() => setFilter("all")}
          >
            همه پیام‌ها
            <span className="messages-panel__filter-count">
              {messages.length}
            </span>
          </button>

          <button
            type="button"
            className={
              filter === "unread" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("unread")}
          >
            خوانده‌نشده
            <span className="messages-panel__filter-count">{unreadCount}</span>
          </button>

          <button
            type="button"
            className={
              filter === "important" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("important")}
          >
            مهم
            <span className="messages-panel__filter-count">
              {importantCount}
            </span>
          </button>
        </div>

        <div className="messages-panel__list">
          {filteredMessages.map((message) => (
            <article
              className={`messages-panel__card ${
                message.isRead ? "messages-panel__card--read" : ""
              }`}
              key={message.id}
            >
              <div className="messages-panel__card-main">
                <div className="messages-panel__title-row">
                  <h4>{message.title}</h4>
                  {!message.isRead && (
                    <span className="messages-panel__unread-badge">جدید</span>
                  )}
                  {message.isImportant && (
                    <span className="messages-panel__important-badge">مهم</span>
                  )}
                </div>

                <p>{message.body}</p>

                <div className="messages-panel__meta">
                  <span>{message.category}</span>
                  <span>{message.sentAt}</span>
                </div>
              </div>

              <div className="messages-panel__card-actions messages-panel__actions">
                <button
                  type="button"
                  className="messages-panel__view-button"
                  onClick={() => openMessage(message.id)}
                >
                  مشاهده
                </button>
                <button
                  type="button"
                  className="messages-panel__delete-message-button messages-panel__remove-button messages-panel__remove-message"
                  onClick={() => removeMessage(message.id)}
                  aria-label="حذف پیام"
                >
                  ×
                </button>
              </div>
            </article>
          ))}

          {filteredMessages.length === 0 && (
            <div className="messages-panel__empty">
              پیامی برای نمایش وجود ندارد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqPanel() {
  const categories = [
    "همه",
    ...new Set(FAQ_ITEMS.map((item) => item.category)),
  ];

  const [activeCategory, setActiveCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [openQuestionId, setOpenQuestionId] = useState(
    FAQ_ITEMS[0]?.id || null,
  );

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "همه" || item.category === activeCategory;

    const matchesSearch =
      item.question.includes(searchTerm) || item.answer.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? null : questionId,
    );
  };

  return (
    <section className="faq-panel">
      <div className="faq-panel__panel">
        <div className="faq-panel__panel-header">
          <div>
            <span>سوالات متداول</span>
            <h3>راهنمای سریع استفاده از داشبورد</h3>
            <p>
              پاسخ سوالات پرتکرار درباره فراخوان‌ها، طرح‌ها، وظایف، درخواست‌ها و
              پیام‌های سامانه.
            </p>
          </div>
        </div>

        <div className="faq-panel__tools">
          <label>
            <span>جست‌وجو در سوالات</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="عبارت موردنظر را وارد کنید..."
            />
          </label>

          <div className="faq-panel__categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "faq-panel__category--active"
                    : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-panel__list">
          {filteredItems.map((item) => {
            const isOpen = openQuestionId === item.id;

            return (
              <article
                className={`faq-panel__item ${
                  isOpen ? "faq-panel__item--open" : ""
                }`}
                key={item.id}
              >
                <button type="button" onClick={() => toggleQuestion(item.id)}>
                  <span>{item.category}</span>
                  <strong>{item.question}</strong>
                  <i>{isOpen ? "−" : "+"}</i>
                </button>

                {isOpen && <p>{item.answer}</p>}
              </article>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="faq-panel__empty">
              سوالی با این عبارت یا دسته‌بندی پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardHomePanel() {
  const submittedPlans = getInitialSubmittedPlansForCurrentUser();
  const acceptedPlans = submittedPlans.filter((plan) =>
    ACCEPTED_PLAN_STATUSES.includes(plan.status),
  );

  const latestSubmittedPlan = submittedPlans[0] || null;
  const latestSelectedPlan = acceptedPlans[0] || null;
  const participatedCallsCount = new Set(
    submittedPlans.map((plan) => plan.callId),
  ).size;

  const selectedPlanTasksMap = getInitialSelectedPlanTasksForCurrentUser();

  const selectedPlanTasks = latestSelectedPlan
    ? selectedPlanTasksMap[latestSelectedPlan.id] || []
    : [];

  const activeDeadlines = selectedPlanTasks
    .filter((task) => task.deadline && task.status !== "پایان یافته")
    .slice(0, 3);

  const stats = [
    {
      label: "طرح‌های ارسالی",
      value: submittedPlans.length,
      hint: "کل طرح‌های ثبت‌شده",
    },
    {
      label: "طرح‌های قبول‌شده",
      value: acceptedPlans.length,
      hint: "قبول و قبول ضعیف",
    },
    {
      label: "فراخوان‌های شرکت‌کرده",
      value: participatedCallsCount,
      hint: "بر اساس طرح‌های ارسالی",
    },
    {
      label: "حمایت‌های دریافت‌شده",
      value: acceptedPlans.length,
      hint: "حمایت‌های قابل پیگیری",
    },
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-home__stats">
        {stats.map((item) => (
          <article className="dashboard-home__stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </article>
        ))}
      </div>

      <article className="dashboard-home__recent-card">
        {latestSubmittedPlan ? (
          <>
            <div>
              <span>طرح اخیر</span>
              <h3>{latestSubmittedPlan.title}</h3>
              <p>{latestSubmittedPlan.call}</p>
            </div>

            <div className="dashboard-home__recent-meta">
              <StatusBadge
                status={latestSubmittedPlan.status}
                className="submit-plan__status--inline"
              />
              <small>ارسال: {latestSubmittedPlan.date}</small>
            </div>
          </>
        ) : (
          <div>
            <span>طرح اخیر</span>
            <h3>هنوز طرحی ثبت نشده است</h3>
            <p>پس از ارسال اولین طرح، خلاصه آن در این بخش نمایش داده می‌شود.</p>
          </div>
        )}
      </article>

      <div className="dashboard-home__workspace-grid">
        <section className="dashboard-home__selected-plan">
          {latestSelectedPlan ? (
            <>
              <div className="dashboard-home__section-head">
                <span>آخرین طرح انتخاب‌شده</span>
                <h3>{latestSelectedPlan.title}</h3>
                <p>{latestSelectedPlan.call}</p>
              </div>

              <div className="dashboard-home__selected-summary">
                <div>
                  <span>وضعیت</span>
                  <StatusBadge
                    status={latestSelectedPlan.status}
                    className="submit-plan__status--inline"
                  />
                </div>
                <div>
                  <span>تعداد وظایف</span>
                  <strong>{selectedPlanTasks.length} وظیفه</strong>
                </div>
                <div>
                  <span>نزدیک‌ترین ددلاین</span>
                  <strong>{getNearestTaskDeadline(selectedPlanTasks)}</strong>
                </div>
              </div>

              <div className="dashboard-home__task-mini-list">
                {selectedPlanTasks.slice(0, 3).map((task) => (
                  <article key={task.id}>
                    <div>
                      <h4>{task.title}</h4>
                      <span>{task.deadline || "بدون ددلاین فعال"}</span>
                    </div>
                    <b
                      className={`selected-plans__task-status selected-plans__task-status--${getTaskStatusClass(
                        task.status,
                      )}`}
                    >
                      {task.status}
                    </b>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="dashboard-home__empty-selected">
              هنوز طرح انتخاب‌شده‌ای برای نمایش وجود ندارد.
            </div>
          )}
        </section>

        <section className="dashboard-home__desk">
          <div className="dashboard-home__section-head">
            <span>میزکار</span>
            <h3>تقویم ددلاین‌ها و یادآوری‌ها</h3>
            <p>ددلاین‌های فعال و کارهای نزدیک را از این بخش پیگیری کنید.</p>
          </div>

          <div className="dashboard-home__deadline-calendar">
            {activeDeadlines.map((task) => (
              <article key={task.id}>
                <div>
                  <span>ددلاین</span>
                  <strong>{task.deadline}</strong>
                </div>
                <p>{task.title}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-home__reminders">
            {DASHBOARD_REMINDERS.map((reminder) => (
              <article key={reminder.id}>
                <div>
                  <span>{reminder.type}</span>
                  <strong>{reminder.date}</strong>
                </div>
                <p>{reminder.title}</p>
                <small>ساعت {reminder.time}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ProfileAvatar({ profile, size = "normal" }) {
  return profile.avatarPreview ? (
    <img
      className={`profile-panel__avatar profile-panel__avatar--${size}`}
      src={profile.avatarPreview}
      alt={`${profile.firstName} ${profile.lastName}`}
    />
  ) : (
    <span className={`profile-panel__avatar profile-panel__avatar--${size}`}>
      {profile.avatarLetter || profile.firstName?.[0] || "ف"}
    </span>
  );
}

function ProfilePanel({ profile, onEdit }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__card profile-panel__hero-card">
        <ProfileAvatar profile={profile} size="large" />

        <div>
          <span>پروفایل کاربری</span>
          <h3>
            {profile.fullName ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
          </h3>
          <p>{profile.level}</p>
        </div>

        <button type="button" onClick={onEdit}>
          ویرایش پروفایل
        </button>
      </div>

      <div className="profile-panel__info-grid">
        <article>
          <span>نام و نام خانوادگی</span>
          <strong>
            {profile.fullName ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
          </strong>
        </article>
        <article>
          <span>شماره موبایل</span>
          <strong>{profile.mobile}</strong>
        </article>
        <article>
          <span>ایمیل</span>
          <strong>{profile.email}</strong>
        </article>
        <article>
          <span>سطح کاربری</span>
          <strong>{profile.level}</strong>
        </article>
        <article>
          <span>سابقه عضویت</span>
          <strong>
            عضو از سال {profile.memberSince} - به مدت{" "}
            {profile.membershipDuration}
          </strong>
        </article>
      </div>
    </section>
  );
}

function ProfileEditPanel({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("avatarPreview", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setMessage("رمز عبور جدید و تکرار آن یکسان نیست.");
      return;
    }

    const nextProfile = {
      ...formData,
      fullName:
        formData.fullName ||
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
      avatarLetter:
        formData.firstName?.[0] ||
        formData.fullName?.[0] ||
        profile.avatarLetter ||
        "ف",
    };

    try {
      const savedProfile = onSave(nextProfile, passwordData);
      setFormData(savedProfile || nextProfile);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(
        passwordData.newPassword
          ? "اطلاعات پروفایل و رمز عبور با موفقیت ذخیره شد."
          : "تغییرات پروفایل با موفقیت ذخیره شد.",
      );
    } catch (error) {
      setMessage(error?.message || "ذخیره تغییرات با خطا روبه‌رو شد.");
    }
  };

  return (
    <section className="profile-panel">
      <form className="profile-panel__edit-card" onSubmit={handleSubmit}>
        <div className="profile-panel__edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات کاربری و رمز عبور</h3>
          </div>

          <button type="button" onClick={onCancel}>
            بازگشت به پروفایل
          </button>
        </div>

        <div className="profile-panel__avatar-edit">
          <ProfileAvatar profile={formData} size="large" />
          <label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            تغییر تصویر پروفایل
          </label>
        </div>

        <div className="profile-panel__form-grid">
          <label>
            <span>نام</span>
            <input
              type="text"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </label>

          <label>
            <span>نام خانوادگی</span>
            <input
              type="text"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </label>

          <label>
            <span>شماره موبایل</span>
            <input
              type="text"
              value={formData.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
        </div>

        <div className="profile-panel__password-box">
          <div>
            <span>تغییر رمز عبور</span>
            <p>در صورت نیاز، رمز فعلی و رمز جدید را وارد کنید.</p>
          </div>

          <div className="profile-panel__form-grid">
            <label>
              <span>رمز عبور فعلی</span>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
              />
            </label>

            <label>
              <span>تکرار رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div className="profile-panel__form-actions">
          <button type="button" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit">ذخیره تغییرات</button>
        </div>

        {message && <p className="profile-panel__message">{message}</p>}
      </form>
    </section>
  );
}

function GenericDashboardContent({ currentSection, activeSubItem }) {
  const activeSubItemLabel = NAV_ITEMS.flatMap(
    (item) => item.subItems || [],
  ).find((subItem) => subItem.id === activeSubItem)?.label;

  return (
    <>
      <section className="innovator-dashboard__hero">
        <div className="innovator-dashboard__hero-content">
          <span className="innovator-dashboard__hero-chip">
            پنل اختصاصی فناور
          </span>

          <h2>مدیریت متمرکز فراخوان‌ها، درخواست‌ها و مسیر ارتباط با سامانه</h2>

          <p>
            این داشبورد برای مدیریت یکپارچه فعالیت‌های شما طراحی شده است؛ از
            مشاهده فراخوان‌ها و پیگیری درخواست‌ها تا دریافت اعلان‌ها، منابع
            آموزشی و پشتیبانی.
          </p>

          <div className="innovator-dashboard__hero-buttons">
            <button type="button">{currentSection.actionLabel}</button>

            <button type="button" className="innovator-dashboard__ghost-btn">
              سفارشی‌سازی داشبورد
            </button>
          </div>
        </div>

        <div className="innovator-dashboard__hero-side">
          <div className="innovator-dashboard__hero-block">
            <span>کاربر فعال</span>
            <strong>فناور</strong>
          </div>

          <div className="innovator-dashboard__hero-block">
            <span>آخرین ورود</span>
            <strong>امروز</strong>
          </div>

          <div className="innovator-dashboard__hero-block">
            <span>دسترسی فعلی</span>
            <strong>{currentSection.title}</strong>
          </div>
        </div>
      </section>

      <section className="innovator-dashboard__summary-grid">
        {SUMMARY_CARDS.map((card) => (
          <article
            key={card.label}
            className="innovator-dashboard__summary-card"
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="innovator-dashboard__content-grid">
        <div className="innovator-dashboard__panel innovator-dashboard__panel--wide">
          <div className="innovator-dashboard__panel-header">
            <div>
              <span>بخش فعال</span>
              <h3>{currentSection.primaryTitle}</h3>
            </div>

            <button type="button">مشاهده همه</button>
          </div>

          <div className="innovator-dashboard__feature-list">
            {currentSection.primaryItems.map((item) => (
              <article
                key={item.title}
                className="innovator-dashboard__feature-item"
              >
                <div className="innovator-dashboard__feature-text">
                  <h4>{item.title}</h4>
                  <p>{item.meta}</p>
                </div>

                <span className="innovator-dashboard__feature-status">
                  {item.status}
                </span>
              </article>
            ))}
          </div>

          <div className="innovator-dashboard__placeholder-note">
            جزئیات و زیرمنوهای کامل این بخش در مرحله بعدی به داشبورد اضافه
            می‌شوند.
          </div>
        </div>

        <div className="innovator-dashboard__stack">
          <div className="innovator-dashboard__panel">
            <div className="innovator-dashboard__panel-header">
              <div>
                <span>زیرمنوی فعال</span>
                <h3>{activeSubItemLabel || currentSection.sideTitle}</h3>
              </div>
            </div>

            <ul className="innovator-dashboard__quick-list">
              {currentSection.sideItems.map((item) => (
                <li key={item}>
                  <button type="button">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="innovator-dashboard__panel">
            <div className="innovator-dashboard__panel-header">
              <div>
                <span>آخرین فعالیت‌ها</span>
                <h3>رویدادهای اخیر</h3>
              </div>
            </div>

            <ul className="innovator-dashboard__activity-list">
              {RECENT_ACTIVITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function InnovatorDashboardPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const [recentMessages, setRecentMessages] = useState(() =>
    getNotificationsForCurrentUser().slice(0, 3),
  );
  const [userProfile, setUserProfile] = useState(() =>
    getCurrentDashboardProfile(INITIAL_USER_PROFILE),
  );

  const saveUserProfile = (nextProfile, passwordData = {}) => {
    const savedProfile = saveCurrentDashboardProfile(
      nextProfile,
      INITIAL_USER_PROFILE,
      passwordData,
    );
    setUserProfile(savedProfile);
    return savedProfile;
  };

  const currentSection = useMemo(
    () => SECTION_DATA[activeSection],
    [activeSection],
  );

  const unreadMessagesCount = recentMessages.filter(
    (item) => !item.isRead,
  ).length;

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isNotificationOpen]);

  const resetCurrentContent = () => {
    setContentResetKey((currentKey) => currentKey + 1);
  };

  const openInternalPage = (sectionId) => {
    setActiveSection(sectionId);
    setActiveSubItem("");
    setOpenMenuId("");
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
    resetCurrentContent();
  };

  const handleLogout = () => {
    navigate("/auth");
  };

  const handleNavClick = (item) => {
    const hasSubItems = Boolean(item.subItems?.length);
    const isSameOpenMenu = openMenuId === item.id;

    setActiveSection(item.id);
    resetCurrentContent();

    if (!hasSubItems) {
      setOpenMenuId("");
      setActiveSubItem("");
      return;
    }

    if (isSameOpenMenu) {
      setOpenMenuId("");
      setActiveSubItem(item.subItems[0].id);
      return;
    }

    setOpenMenuId(item.id);
    setActiveSubItem(item.subItems[0].id);
  };

  const handleSubNavClick = (parentId, subItemId) => {
    setActiveSection(parentId);
    setOpenMenuId(parentId);
    setActiveSubItem(subItemId);
    resetCurrentContent();
  };

  const refreshRecentMessages = () => {
    setRecentMessages(getNotificationsForCurrentUser().slice(0, 3));
  };

  const markMessageAsRead = (messageId, event) => {
    event?.stopPropagation();
    markNotificationAsRead(messageId);
    refreshRecentMessages();
  };

  const markAllRecentMessagesAsRead = (event) => {
    event?.stopPropagation();
    markAllNotificationsAsReadForCurrentUser();
    refreshRecentMessages();
  };

  const openMessagesCenter = (event) => {
    event?.stopPropagation();
    setIsNotificationOpen(false);
    setActiveSection("messages");
    setActiveSubItem("");
    setOpenMenuId("");
    resetCurrentContent();
  };

  const openNotificationTarget = (message) => {
    markNotificationAsRead(message.id);
    refreshRecentMessages();
    setIsNotificationOpen(false);

    if (message.sourceType === "task" || message.sourceType === "plan") {
      setActiveSection("calls");
      setActiveSubItem("selected-plans");
      setOpenMenuId("calls");
      resetCurrentContent();
      return;
    }

    if (message.sourceType === "support-ticket") {
      openInternalPage("requests");
      return;
    }

    if (message.sourceType === "site-publication-request") {
      setActiveSection("calls");
      setActiveSubItem("site-publication");
      setOpenMenuId("calls");
      resetCurrentContent();
      return;
    }

    openInternalPage("messages");
  };

  const shouldShowSubmitPlan =
    activeSection === "calls" && activeSubItem === "submit-plan";

  const shouldShowSelectedPlans =
    activeSection === "calls" && activeSubItem === "selected-plans";

  const shouldShowSitePublication =
    activeSection === "calls" && activeSubItem === "site-publication";

  const shouldShowDashboard = activeSection === "dashboard";
  const shouldShowMyActivities = activeSection === "my-activities";
  const shouldShowRequests = activeSection === "requests";
  const shouldShowMessages = activeSection === "messages";
  const shouldShowFaq = activeSection === "faq";
  const shouldShowProfile = activeSection === "profile";
  const shouldShowEditProfile = activeSection === "edit-profile";

  return (
    <main
      className={`innovator-dashboard ${
        isSidebarCollapsed ? "innovator-dashboard--collapsed" : ""
      }`}
    >
      <aside className="innovator-dashboard__sidebar">
        <div className="innovator-dashboard__sidebar-top">
          <div className="innovator-dashboard__sidebar-head">
            <button
              type="button"
              className="innovator-dashboard__menu-button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label="باز و بسته کردن منوی داشبورد"
            >
              <MenuIcon />
            </button>

            <Link to="/" className="innovator-dashboard__brand">
              <img src={universityLogo} alt="لوگوی دانشگاه تهران" />

              <div className="innovator-dashboard__brand-text">
                <strong>هاتف</strong>
              </div>
            </Link>
          </div>

          <nav className="innovator-dashboard__nav">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const hasSubItems = Boolean(item.subItems?.length);
              const isOpen = openMenuId === item.id;

              return (
                <div className="innovator-dashboard__nav-group" key={item.id}>
                  <button
                    type="button"
                    className={`innovator-dashboard__nav-item ${
                      isActive ? "innovator-dashboard__nav-item--active" : ""
                    }`}
                    onClick={() => handleNavClick(item)}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="innovator-dashboard__nav-icon">
                      {item.icon}
                    </span>

                    <span className="innovator-dashboard__nav-text">
                      {item.label}
                    </span>

                    {hasSubItems && !isSidebarCollapsed && (
                      <span className="innovator-dashboard__nav-chevron">
                        <ChevronIcon isOpen={isOpen} />
                      </span>
                    )}
                  </button>

                  {hasSubItems && !isSidebarCollapsed && (
                    <div
                      className={`innovator-dashboard__subnav ${
                        isOpen ? "innovator-dashboard__subnav--open" : ""
                      }`}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          type="button"
                          key={subItem.id}
                          className={`innovator-dashboard__subnav-item ${
                            activeSubItem === subItem.id
                              ? "innovator-dashboard__subnav-item--active"
                              : ""
                          }`}
                          onClick={() => handleSubNavClick(item.id, subItem.id)}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <section className="innovator-dashboard__main">
        <header className="innovator-dashboard__topbar">
          <div className="innovator-dashboard__topbar-title">
            <DashboardDateTime />

            <h1>{currentSection.title}</h1>
          </div>

          <div className="innovator-dashboard__topbar-actions">
            <div
              className="innovator-dashboard__notification-menu"
              ref={notificationMenuRef}
            >
              <button
                type="button"
                className="innovator-dashboard__notification-trigger"
                onClick={() => {
                  setIsNotificationOpen((current) => !current);
                  setIsProfileMenuOpen(false);
                }}
                aria-label="نمایش پیام‌های اخیر"
              >
                <BellIcon />

                {unreadMessagesCount > 0 && <span>{unreadMessagesCount}</span>}
              </button>

              {isNotificationOpen && (
                <div className="innovator-dashboard__notification-dropdown">
                  <div className="innovator-dashboard__notification-header">
                    <strong>پیام‌های اخیر</strong>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={openMessagesCenter}
                        title="رفتن به پیام‌ها و اعلانات"
                        style={{
                          width: "30px",
                          height: "30px",
                          border: "0",
                          borderRadius: "999px",
                          background: "#e8f8ff",
                          cursor: "pointer",
                        }}
                      >
                        📨
                      </button>
                      <button
                        type="button"
                        onClick={markAllRecentMessagesAsRead}
                        disabled={unreadMessagesCount === 0}
                        style={{
                          height: "30px",
                          border: "0",
                          borderRadius: "999px",
                          padding: "0 10px",
                          color: unreadMessagesCount ? "#0e7ca8" : "#64748b",
                          background: unreadMessagesCount
                            ? "#e8f8ff"
                            : "#e9edf2",
                          fontFamily: "inherit",
                          fontSize: "10px",
                          fontWeight: 900,
                          cursor: unreadMessagesCount ? "pointer" : "default",
                        }}
                      >
                        خواندن همه
                      </button>
                    </div>
                    <small>{unreadMessagesCount} خوانده‌نشده</small>
                  </div>

                  <div className="innovator-dashboard__notification-list">
                    {recentMessages.map((message) => (
                      <article
                        key={message.id}
                        className={`innovator-dashboard__notification-item ${
                          message.isRead
                            ? "innovator-dashboard__notification-item--read"
                            : ""
                        }`}
                        onClick={() => openNotificationTarget(message)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            openNotificationTarget(message);
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          border: message.isRead
                            ? "1px solid #bbf7d0"
                            : "1px solid transparent",
                          background: message.isRead ? "#f0fdf4" : undefined,
                          opacity: message.isRead ? 1 : undefined,
                        }}
                      >
                        <div>
                          <h4>{message.title}</h4>
                          <p>{message.sentAt}</p>
                        </div>

                        <button
                          type="button"
                          onClick={(event) =>
                            markMessageAsRead(message.id, event)
                          }
                          disabled={message.isRead}
                          style={
                            message.isRead
                              ? { color: "#166534", background: "#dcfce7" }
                              : undefined
                          }
                        >
                          {message.isRead ? "خوانده شد" : "خواندن"}
                        </button>
                      </article>
                    ))}

                    {recentMessages.length === 0 && (
                      <article className="innovator-dashboard__notification-item">
                        <div>
                          <h4>اعلان جدیدی ندارید</h4>
                          <p>همه چیز خوانده شده است.</p>
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="innovator-dashboard__profile-menu">
              <button
                type="button"
                className="innovator-dashboard__profile-trigger"
                onClick={() => {
                  setIsProfileMenuOpen((current) => !current);
                  setIsNotificationOpen(false);
                }}
                aria-expanded={isProfileMenuOpen}
              >
                <span className="innovator-dashboard__profile-text">
                  <strong>
                    {userProfile.fullName ||
                      `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()}
                  </strong>
                  <small>نوع کاربر: {userProfile.level}</small>
                </span>

                {userProfile.avatarPreview ? (
                  <img
                    className="innovator-dashboard__top-avatar"
                    src={userProfile.avatarPreview}
                    alt={userProfile.fullName || "پروفایل کاربر"}
                  />
                ) : (
                  <span className="innovator-dashboard__top-avatar">
                    {userProfile.avatarLetter ||
                      userProfile.firstName?.[0] ||
                      userProfile.fullName?.[0] ||
                      "ف"}
                  </span>
                )}

                <span className="innovator-dashboard__profile-caret">▾</span>
              </button>

              {isProfileMenuOpen && (
                <div className="innovator-dashboard__profile-dropdown">
                  <button
                    type="button"
                    onClick={() => openInternalPage("profile")}
                  >
                    پروفایل
                  </button>
                  <button
                    type="button"
                    onClick={() => openInternalPage("edit-profile")}
                  >
                    ویرایش پروفایل
                  </button>
                  <button
                    type="button"
                    className="innovator-dashboard__profile-logout"
                    onClick={handleLogout}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {shouldShowDashboard ? (
          <DashboardHomePanel key={`dashboard-${contentResetKey}`} />
        ) : shouldShowSubmitPlan ? (
          <SubmitPlanPanel key={`submit-plan-${contentResetKey}`} />
        ) : shouldShowSelectedPlans ? (
          <SelectedPlansPanel key={`selected-plans-${contentResetKey}`} />
        ) : shouldShowSitePublication ? (
          <SitePublicationPanel key={`site-publication-${contentResetKey}`} />
        ) : shouldShowMyActivities ? (
          <RegisteredActivitiesPanel key={`my-activities-${contentResetKey}`} />
        ) : shouldShowRequests ? (
          <SupportRequestsPanel key={`requests-${contentResetKey}`} />
        ) : shouldShowMessages ? (
          <MessagesPanel key={`messages-${contentResetKey}`} />
        ) : shouldShowFaq ? (
          <FaqPanel key={`faq-${contentResetKey}`} />
        ) : shouldShowProfile ? (
          <ProfilePanel
            key={`profile-${contentResetKey}`}
            profile={userProfile}
            onEdit={() => openInternalPage("edit-profile")}
          />
        ) : shouldShowEditProfile ? (
          <ProfileEditPanel
            key={`edit-profile-${contentResetKey}`}
            profile={userProfile}
            onSave={saveUserProfile}
            onCancel={() => openInternalPage("profile")}
          />
        ) : (
          <GenericDashboardContent
            key={`${activeSection}-${activeSubItem}-${contentResetKey}`}
            currentSection={currentSection}
            activeSubItem={activeSubItem}
          />
        )}
      </section>
    </main>
  );
}

export default InnovatorDashboardPage;
