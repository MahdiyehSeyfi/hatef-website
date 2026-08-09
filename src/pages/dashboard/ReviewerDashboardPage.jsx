import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import { getCurrentUser, getUserById } from "../../services/authService";
import { getCalls } from "../../services/callService";
import { getPlans } from "../../services/planService";
import {
  getReviewerViewedPlanIds,
  markReviewerPlanViewed,
} from "../../services/reviewerActivityService";
import {
  deleteReview,
  getReviewsByReviewerId,
  saveReview,
} from "../../services/reviewService";
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
  PLAN_REVIEW_STATUS,
  REVIEW_RECOMMENDATION,
} from "../../constants/statuses";

import {
  getCurrentDashboardProfile,
  saveCurrentDashboardProfile,
} from "../../services/userProfileService";

import Button from "../../components/ui/Button/Button";
import IconButton from "../../components/ui/IconButton/IconButton";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Textarea from "../../components/ui/Textarea/Textarea";
import {
  DashboardDisclosure,
  DashboardEmptyState,
  DashboardFAQ,
  DashboardReviewFolderBadge,
  DashboardReviewFolderCard,
  DashboardMessages,
  DashboardNotice,
  DashboardNotificationMenu,
  DashboardPagination,
  DashboardPanel as SharedDashboardPanel,
  DashboardProfileEdit,
  DashboardProfileMenu,
  DashboardProfileView,
  DashboardShell,
  DashboardStatCard,
  DashboardStatusBadge,
  DashboardSupportRequests,
  DashboardTabs,
  DashboardToolbar,
} from "../../components/dashboard";

import "./InnovatorDashboardPage.css";
import "./ReviewerDashboardPage.css";
import "../../components/dashboard/DashboardChrome/DashboardChrome.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: "🏠",
  },
  {
    id: "plan-management",
    label: "مدیریت طرح‌ها",
    icon: "🧾",
    subItems: [
      {
        id: "current-plans",
        label: "طرح‌های جاری",
      },
      {
        id: "history",
        label: "تاریخچه",
      },
    ],
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

const REVIEW_FOLDERS = [
  {
    id: "priority",
    label: "دارای اولویت",
    tone: "warning",
  },
  {
    id: "needs-improvement",
    label: "نیازمند بهبود",
    tone: "danger",
  },
  {
    id: "more-review",
    label: "بررسی بیشتر",
    tone: "info",
  },
];

function getReviewerRecommendationText(recommendation) {
  const recommendationMap = {
    [REVIEW_RECOMMENDATION.ACCEPT]: "قابل بررسی در مرحله بعد",
    [REVIEW_RECOMMENDATION.WEAK_ACCEPT]: "قابل بررسی در مرحله بعد",
    [REVIEW_RECOMMENDATION.REJECT]: "عدم پیشنهاد برای ادامه",
    [REVIEW_RECOMMENDATION.WEAK_REJECT]: "عدم پیشنهاد برای ادامه",
    [REVIEW_RECOMMENDATION.NEEDS_REVISION]: "نیازمند اصلاح",
  };

  return recommendationMap[recommendation] || "قابل بررسی در مرحله بعد";
}

function getReviewRecommendationValue(recommendationText) {
  const recommendationMap = {
    "قابل بررسی در مرحله بعد": REVIEW_RECOMMENDATION.WEAK_ACCEPT,
    "نیازمند اصلاح": REVIEW_RECOMMENDATION.NEEDS_REVISION,
    "دارای اولویت": REVIEW_RECOMMENDATION.ACCEPT,
    "عدم پیشنهاد برای ادامه": REVIEW_RECOMMENDATION.REJECT,
  };

  return (
    recommendationMap[recommendationText] || REVIEW_RECOMMENDATION.WEAK_ACCEPT
  );
}

function getReviewFolderIds(review) {
  if (review?.recommendation === REVIEW_RECOMMENDATION.ACCEPT) {
    return ["priority"];
  }

  if (review?.recommendation === REVIEW_RECOMMENDATION.NEEDS_REVISION) {
    return ["needs-improvement"];
  }

  return [];
}

function getPlanFolderIds(plan, review, index) {
  if (review?.recommendation === REVIEW_RECOMMENDATION.ACCEPT) {
    return ["priority"];
  }

  if (review?.recommendation === REVIEW_RECOMMENDATION.NEEDS_REVISION) {
    return ["needs-improvement"];
  }

  if (
    plan.currentReviewStatus === PLAN_REVIEW_STATUS.PENDING &&
    index % 2 === 0
  ) {
    return ["more-review"];
  }

  return [];
}

function getReviewerPlanStatus(plan, review, isViewed = false) {
  if (review || isViewed) {
    return "بررسی شده";
  }

  if (plan.currentReviewStatus === PLAN_REVIEW_STATUS.REVIEWED) {
    return "بررسی شده";
  }

  return "در انتظار بررسی";
}

function getPlanHistoryYear(plan) {
  const submittedAt = String(plan.submittedAt || "");

  if (submittedAt.startsWith("1405") || submittedAt.startsWith("۱۴۰۵")) {
    return "۱۴۰۵";
  }

  if (submittedAt.startsWith("1404") || submittedAt.startsWith("۱۴۰۴")) {
    return "۱۴۰۴";
  }

  return "۱۴۰۵";
}

function getPlanCallType(call) {
  if (!call) {
    return "فراخوان هاتف";
  }

  if (call.field === "سلامت دیجیتال") return "فراخوان سلامت دیجیتال";
  if (call.field === "انرژی و پایداری") return "فراخوان انرژی و پایداری";
  if (call.field === "تجاری‌سازی") return "فراخوان تجاری‌سازی";
  return "فراخوان هاتف";
}

function mapPlanToReviewerCard(
  plan,
  index,
  reviewerReviews,
  calls,
  viewedPlanIds = new Set(),
) {
  const call = calls.find((item) => item.id === plan.callId);
  const review = reviewerReviews.find((item) => item.planId === plan.id);
  const isViewed = viewedPlanIds.has(String(plan.id));
  const innovator = getUserById(plan.innovatorId);
  const serial = index + 1;

  return {
    id: plan.id,
    trackingId: plan.trackingCode,
    title: plan.title,
    field: plan.field,
    call: call?.title || "فراخوان هاتف",
    callType: getPlanCallType(call),
    historyYear: getPlanHistoryYear(plan),
    innovator: {
      name: innovator?.fullName || "فناور ثبت‌شده",
      organization: innovator?.organization || "تیم فناور",
      phone: innovator?.mobile || "-",
      email: innovator?.email || "-",
    },
    sentAt: `${plan.submittedAt || "ثبت نشده"} - ساعت ${String(
      (serial % 8) + 9,
    ).padStart(2, "0")}:۳۰`,
    deadline: call?.deadlineDate
      ? `${call.deadlineDate} - ساعت ${call.deadlineTime || "۱۸:۰۰"}`
      : "ددلاین ثبت نشده",
    status: getReviewerPlanStatus(plan, review, isViewed),
    proposalFile: plan.proposalFileUrl || `${plan.trackingCode || plan.id}.pdf`,
    folders: getPlanFolderIds(plan, review, index),
    reviewId: review?.id || "",
    score: review?.score || "",
    recommendation: review
      ? getReviewerRecommendationText(review.recommendation)
      : "",
    feedback: review
      ? {
          text: review.feedbackText,
          createdAt: `${review.createdAt || "ثبت شده"} - بازخورد داور`,
        }
      : null,
  };
}

function createInitialReviewPlans(reviewerId) {
  const currentReviewerId = reviewerId || "user-reviewer-1";
  const calls = getCalls();
  const reviewerReviews = getReviewsByReviewerId(currentReviewerId);
  const viewedPlanIds = getReviewerViewedPlanIds(currentReviewerId);

  return getPlans().map((plan, index) =>
    mapPlanToReviewerCard(plan, index, reviewerReviews, calls, viewedPlanIds),
  );
}

const INITIAL_TICKETS = [
  {
    id: 1,
    title: "مشکل در مشاهده فایل پروپوزال",
    message:
      "فایل یکی از طرح‌ها برای من باز نمی‌شود و هنگام دانلود پیام خطا دریافت می‌کنم.",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۰:۳۰",
    status: "پاسخ داده شده",
    seenBySupport: true,
    supportReply:
      "دسترسی فایل بررسی شد. لطفاً صفحه را رفرش کنید و دوباره از گزینه دانلود استفاده کنید.",
    repliedAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۱۰",
  },
  {
    id: 2,
    title: "درخواست راهنمایی برای ثبت بازخورد",
    message:
      "برای ثبت بازخورد یک طرح نیاز به راهنمایی دارم. آیا لازم است امتیاز عددی هم وارد شود؟",
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
    title: "۵ طرح جدید برای بررسی به شما اختصاص داده شد.",
    category: "پیام سامانه",
    sentAt: "۱۴۰۵/۰۳/۱۴ - ساعت ۰۹:۱۵",
    isRead: false,
    isImportant: true,
    body: "طرح‌های جدید فراخوان هاتف به لیست طرح‌های جاری شما اضافه شده‌اند. لطفاً تا قبل از ددلاین، بررسی و ثبت بازخورد را انجام دهید.",
  },
  {
    id: 2,
    title: "یادآوری ددلاین ثبت بازخورد",
    category: "یادآوری",
    sentAt: "۱۴۰۵/۰۳/۱۳ - ساعت ۱۵:۴۰",
    isRead: false,
    isImportant: false,
    body: "چند طرح در وضعیت در انتظار بررسی قرار دارند و ددلاین ثبت بازخورد آن‌ها نزدیک است.",
  },
  {
    id: 3,
    title: "راهنمای ارزیابی طرح‌ها به‌روزرسانی شد",
    category: "اطلاعیه",
    sentAt: "۱۴۰۵/۰۳/۱۲ - ساعت ۱۲:۰۰",
    isRead: true,
    isImportant: false,
    body: "نسخه جدید راهنمای ثبت بازخورد و ارزیابی طرح‌ها در سامانه بارگذاری شد.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "ارزیابی",
    question: "چطور برای یک طرح بازخورد ثبت کنم؟",
    answer:
      "از بخش مدیریت طرح‌ها وارد طرح‌های جاری شوید، روی مشاهده و ثبت بازخورد کلیک کنید و متن بازخورد، پیشنهاد نهایی و امتیاز را ثبت کنید.",
  },
  {
    id: 2,
    category: "طرح‌ها",
    question: "بعد از ثبت بازخورد، وضعیت طرح چه تغییری می‌کند؟",
    answer:
      "بعد از ذخیره بازخورد، وضعیت طرح برای داور به بررسی شده تغییر می‌کند و با نماد بازخورد ثبت‌شده نمایش داده می‌شود.",
  },
  {
    id: 3,
    category: "پوشه‌ها",
    question: "پوشه‌های داوری چه کاربردی دارند؟",
    answer:
      "پوشه‌ها برای دسته‌بندی شخصی طرح‌ها هستند. داور می‌تواند طرح‌ها را در پوشه‌های دارای اولویت، نیازمند بهبود یا بررسی بیشتر قرار دهد.",
  },
  {
    id: 4,
    category: "فایل‌ها",
    question: "فایل پروپوزال از کجا دانلود می‌شود؟",
    answer: "فایل پروپوزال فقط داخل صفحه جزئیات هر طرح قابل دانلود است.",
  },
];

function getReviewerProfile(user) {
  return {
    firstName: user?.firstName || "مهدی",
    lastName: user?.lastName || "رضایی",
    mobile: user?.mobile || user?.phone || "09123450657",
    phone: user?.phone || user?.mobile || "09123450657",
    email: user?.email || "reviewer@example.com",
    role: "reviewer",
    level: "داور",
    memberSince: "۱۴۰۴",
    membershipDuration: "۱ سال",
    avatarLetter: user?.avatarLetter || "د",
    avatarPreview: user?.avatarPreview || user?.avatarUrl || user?.avatar_url || "",
  };
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

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 7.5c0-1.1.9-2 2-2h4.1c.7 0 1.3.3 1.7.9l.8 1.1h6.4c1.1 0 2 .9 2 2v7.2c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2V7.5Z"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M3.5 8.2c0-1.1.9-2 2-2h4.1c.7 0 1.3.3 1.7.9l.8 1.1h6.4c1.1 0 2 .9 2 2v6.5c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2V8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getDownloadHref(plan) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `فایل نمونه پروپوزال برای طرح ${plan.trackingId} - ${plan.title}`,
  )}`;
}

function getStatusClass(status) {
  if (status === "بررسی شده") return "reviewed";
  return "waiting";
}

function getFolderLabel(folderId) {
  return REVIEW_FOLDERS.find((folder) => folder.id === folderId)?.label || "";
}

function getFolderTone(folderId) {
  return REVIEW_FOLDERS.find((folder) => folder.id === folderId)?.tone || "";
}

function getHistoryYear(plan) {
  return plan.historyYear || "۱۴۰۵";
}

function getHistoryCallType(plan) {
  return plan.callType || "فراخوان هاتف";
}

function ReviewerStatusBadge({ status }) {
  return <DashboardStatusBadge status={status} />;
}

function ReviewerHomePanel({ plans, onOpenFolder }) {
  const reviewedCount = plans.filter(
    (plan) => plan.status === "بررسی شده",
  ).length;
  const waitingCount = plans.filter(
    (plan) => plan.status === "در انتظار بررسی",
  ).length;
  const feedbackCount = plans.filter((plan) => Boolean(plan.feedback)).length;

  const stats = [
    {
      label: "کل طرح‌های جاری",
      value: plans.length,
      hint: "طرح‌های اختصاص‌یافته به داور",
    },
    {
      label: "در انتظار بررسی",
      value: waitingCount,
      hint: "طرح‌هایی که هنوز مشاهده نشده‌اند",
    },
    {
      label: "بررسی شده",
      value: reviewedCount,
      hint: "طرح‌هایی که وارد بررسی شده‌اند",
    },
    {
      label: "بازخورد ثبت‌شده",
      value: feedbackCount,
      hint: "طرح‌هایی که بازخورد دارند",
    },
  ];

  return (
    <section className="reviewer-dashboard__dashboard">
      <div className="reviewer-dashboard__stats-grid">
        {stats.map((item) => (
          <DashboardStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
          />
        ))}
      </div>

      <div className="reviewer-dashboard__dashboard-folders">
        {REVIEW_FOLDERS.map((folder) => (
          <DashboardReviewFolderCard
            key={folder.id}
            title={folder.label}
            count={plans.filter((plan) => plan.folders.includes(folder.id)).length}
            tone={folder.tone}
            onDoubleClick={() => onOpenFolder(folder.id)}
            aria-label={`ورود به پوشه ${folder.label}`}
          />
        ))}
      </div>
    </section>
  );
}

function CurrentPlansPanel({
  plans,
  setPlans,
  reviewerId,
  initialFolderFilter = "all",
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState(initialFolderFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [recommendation, setRecommendation] = useState(
    "قابل بررسی در مرحله بعد",
  );
  const [score, setScore] = useState("");

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  useEffect(() => {
    setFolderFilter(initialFolderFilter);
    setCurrentPage(1);
  }, [initialFolderFilter]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "reviewed" && plan.status === "بررسی شده") ||
        (statusFilter === "waiting" && plan.status === "در انتظار بررسی") ||
        (statusFilter === "no-feedback" && !plan.feedback);

      const matchesFolder =
        folderFilter === "all" || plan.folders.includes(folderFilter);

      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        plan.title.toLowerCase().includes(normalizedSearch) ||
        plan.trackingId.toLowerCase().includes(normalizedSearch) ||
        plan.innovator.name.toLowerCase().includes(normalizedSearch) ||
        plan.field.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesFolder && matchesSearch;
    });
  }, [folderFilter, plans, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPagePlans = filteredPlans.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const openPlan = (planId) => {
    const plan = plans.find((item) => item.id === planId);

    markReviewerPlanViewed(reviewerId, planId);

    setPlans((currentPlans) =>
      currentPlans.map((item) =>
        item.id === planId ? { ...item, status: "بررسی شده" } : item,
      ),
    );

    setSelectedPlanId(planId);
    setFeedbackText(plan?.feedback?.text || "");
    setRecommendation(plan?.recommendation || "قابل بررسی در مرحله بعد");
    setScore(plan?.score || "");
  };

  const closePlan = () => {
    setSelectedPlanId(null);
    setFeedbackText("");
    setRecommendation("قابل بررسی در مرحله بعد");
    setScore("");
  };

  const toggleFolder = (planId, folderId) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== planId) return plan;

        const hasFolder = plan.folders.includes(folderId);

        return {
          ...plan,
          folders: hasFolder
            ? plan.folders.filter((item) => item !== folderId)
            : [...plan.folders, folderId],
        };
      }),
    );
  };

  const saveFeedback = () => {
    if (!selectedPlan || !feedbackText.trim()) return;

    const savedReview = saveReview({
      planId: selectedPlan.id,
      reviewerId,
      score: Number(score) || 0,
      recommendation: getReviewRecommendationValue(recommendation),
      feedbackText: feedbackText.trim(),
    });

    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== selectedPlan.id) return plan;

        const reviewFolderIds = getReviewFolderIds(savedReview);
        const nextFolders = Array.from(
          new Set([...plan.folders, ...reviewFolderIds]),
        );

        return {
          ...plan,
          status: "بررسی شده",
          reviewId: savedReview.id,
          recommendation: getReviewerRecommendationText(
            savedReview.recommendation,
          ),
          score: savedReview.score,
          folders: nextFolders,
          feedback: {
            text: savedReview.feedbackText,
            createdAt: `${savedReview.createdAt} - بازخورد داور`,
          },
        };
      }),
    );
  };

  const deleteFeedback = () => {
    if (!selectedPlan || !selectedPlan.feedback) return;

    const confirmed = window.confirm("آیا از حذف بازخورد این طرح مطمئن هستید؟");

    if (!confirmed) return;

    if (selectedPlan.reviewId) {
      deleteReview(selectedPlan.reviewId);
    }

    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
              status: "بررسی شده",
              reviewId: "",
              recommendation: "",
              score: "",
              feedback: null,
            }
          : plan,
      ),
    );

    setFeedbackText("");
    setRecommendation("قابل بررسی در مرحله بعد");
    setScore("");
  };

  if (selectedPlan) {
    return (
      <SharedDashboardPanel className="reviewer-dashboard__review-detail" padding="md">
        <div className="innovator-dashboard__panel-header reviewer-dashboard__detail-header">
          <div>
            <span>جزئیات طرح</span>
            <h3>{selectedPlan.title}</h3>
            <p>شناسه طرح: {selectedPlan.trackingId}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            width="content"
            leadingIcon={<BackIcon />}
            onClick={closePlan}
          >
            بازگشت به لیست
          </Button>
        </div>

        <div className="reviewer-dashboard__detail-grid">
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>فناور</span>
            <strong>{selectedPlan.innovator.name}</strong>
            <small>{selectedPlan.innovator.organization}</small>
          </SharedDashboardPanel>

          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>حوزه</span>
            <strong>{selectedPlan.field}</strong>
            <small>{selectedPlan.call}</small>
          </SharedDashboardPanel>

          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>تاریخ ارسال</span>
            <strong>{selectedPlan.sentAt}</strong>
            <small>ددلاین: {selectedPlan.deadline}</small>
          </SharedDashboardPanel>

          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>وضعیت</span>
            <ReviewerStatusBadge status={selectedPlan.status} />
            {selectedPlan.feedback && <small>بازخورد ثبت شده است</small>}
          </SharedDashboardPanel>
        </div>

        <div className="reviewer-dashboard__review-layout">
          <div className="reviewer-dashboard__info-stack">
            <SharedDashboardPanel variant="subtle" padding="sm" className="reviewer-dashboard__info-card">
              <h4>اطلاعات فناور</h4>
              <dl>
                <div>
                  <dt>نام</dt>
                  <dd>{selectedPlan.innovator.name}</dd>
                </div>
                <div>
                  <dt>موبایل</dt>
                  <dd>{selectedPlan.innovator.phone}</dd>
                </div>
                <div>
                  <dt>ایمیل</dt>
                  <dd>{selectedPlan.innovator.email}</dd>
                </div>
              </dl>
            </SharedDashboardPanel>

            <SharedDashboardPanel variant="subtle" padding="sm" className="reviewer-dashboard__info-card">
              <h4>پوشه‌های داور</h4>
              <div className="reviewer-dashboard__folder-actions">
                {REVIEW_FOLDERS.map((folder) => (
                  <Button
                    type="button"
                    key={folder.id}
                    variant={selectedPlan.folders.includes(folder.id) ? "secondary" : "outline"}
                    size="sm"
                    width="content"
                    onClick={() => toggleFolder(selectedPlan.id, folder.id)}
                  >
                    {selectedPlan.folders.includes(folder.id)
                      ? `حذف از ${folder.label}`
                      : `افزودن به ${folder.label}`}
                  </Button>
                ))}
              </div>
            </SharedDashboardPanel>

            <Button
              href={getDownloadHref(selectedPlan)}
              download={selectedPlan.proposalFile}
              variant="outline"
              size="md"
              fullWidth
              leadingIcon={<DownloadIcon />}
            >
              دانلود پروپوزال
            </Button>
          </div>

          <SharedDashboardPanel padding="md" className="reviewer-dashboard__feedback-card">
            <div className="reviewer-dashboard__feedback-head">
              <div>
                <span>بازخورد داور</span>
                <h4>
                  {selectedPlan.feedback ? "ویرایش بازخورد" : "ثبت بازخورد"}
                </h4>
              </div>

              {selectedPlan.feedback && (
                <span
                  className="reviewer-dashboard__feedback-dot reviewer-dashboard__feedback-dot--large"
                  title="بازخورد ثبت‌شده"
                  aria-label="بازخورد ثبت‌شده"
                />
              )}
            </div>

            <label>
              <span>متن بازخورد</span>
              <Textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                placeholder="بازخورد تخصصی خود را درباره طرح وارد کنید..."
              />
            </label>

            <div className="reviewer-dashboard__feedback-fields">
              <label>
                <span>پیشنهاد داور</span>
                <Select
                  value={recommendation}
                  onChange={(event) => setRecommendation(event.target.value)}
                >
                  <option>قابل بررسی در مرحله بعد</option>
                  <option>نیازمند اصلاح</option>
                  <option>دارای اولویت</option>
                  <option>عدم پیشنهاد برای ادامه</option>
                </Select>
              </label>

              <label>
                <span>امتیاز</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  placeholder="از ۰ تا ۱۰۰"
                />
              </label>
            </div>

            {selectedPlan.feedback && (
              <DashboardNotice
                tone="success"
                title="آخرین بازخورد"
                className="reviewer-dashboard__previous-feedback"
              >
                <p>{selectedPlan.feedback.text}</p>
                <small>{selectedPlan.feedback.createdAt}</small>
              </DashboardNotice>
            )}

            <div className="reviewer-dashboard__feedback-actions">
              {selectedPlan.feedback && (
                <Button
                  type="button"
                  variant="danger-soft"
                  size="sm"
                  width="content"
                  onClick={deleteFeedback}
                >
                  حذف بازخورد
                </Button>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={saveFeedback}
                disabled={!feedbackText.trim()}
              >
                {selectedPlan.feedback
                  ? "ذخیره ویرایش بازخورد"
                  : "ذخیره بازخورد"}
              </Button>
            </div>
          </SharedDashboardPanel>
        </div>
      </SharedDashboardPanel>
    );
  }

  return (
    <SharedDashboardPanel className="reviewer-dashboard__plans-panel" padding="md">
      <div className="innovator-dashboard__panel-header">
        <div>
          <span>طرح‌های جاری</span>
          <h3>طرح‌های اختصاص‌یافته برای بررسی</h3>
        </div>
      </div>

      <div className="reviewer-dashboard__folders-board">
        <DashboardReviewFolderCard
          selected={folderFilter === "all"}
          title="همه طرح‌ها"
          count={plans.length}
          tone="brand"
          onClick={() => {
            setFolderFilter("all");
            setCurrentPage(1);
          }}
        />

        {REVIEW_FOLDERS.map((folder) => (
          <DashboardReviewFolderCard
            key={folder.id}
            selected={folderFilter === folder.id}
            title={folder.label}
            count={plans.filter((plan) => plan.folders.includes(folder.id)).length}
            tone={folder.tone}
            onDoubleClick={() => {
              setFolderFilter(folder.id);
              setCurrentPage(1);
            }}
          />
        ))}
      </div>

      {folderFilter !== "all" && (
        <DashboardNotice
          tone="info"
          className="reviewer-dashboard__folder-view-note"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              width="content"
              onClick={() => {
                setFolderFilter("all");
                setCurrentPage(1);
              }}
            >
              خروج از پوشه
            </Button>
          }
        >
          در حال مشاهده پوشه «{getFolderLabel(folderFilter)}». برای حذف یک طرح
          از این پوشه، روی ضربدر کنار نام پوشه در کارت طرح بزنید.
        </DashboardNotice>
      )}

      <DashboardToolbar className="reviewer-dashboard__toolbar">
        <label className="reviewer-dashboard__search">
          <span>جستجو</span>
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="شناسه، عنوان، نام فناور یا حوزه..."
          />
        </label>

        <div className="reviewer-dashboard__filter-group">
          <span>وضعیت</span>
          <DashboardTabs
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            items={[
              { value: "all", label: "همه" },
              { value: "waiting", label: "بررسی نشده‌ها" },
              { value: "reviewed", label: "بررسی شده‌ها" },
              { value: "no-feedback", label: "بدون بازخورد" },
            ]}
            ariaLabel="فیلتر وضعیت طرح‌ها"
          />
        </div>

        <label className="reviewer-dashboard__page-size">
          <span>تعداد نمایش</span>
          <Select
            value={itemsPerPage}
            onChange={(event) => {
              setItemsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>۱۰ عدد</option>
            <option value={20}>۲۰ عدد</option>
            <option value={50}>۵۰ عدد</option>
            <option value={100}>۱۰۰ عدد</option>
          </Select>
        </label>
      </DashboardToolbar>

      <div className="reviewer-dashboard__plans-list">
        {currentPagePlans.map((plan) => (
          <SharedDashboardPanel
            as="article"
            variant="subtle"
            padding="sm"
            className={`reviewer-dashboard__plan-card ${
              plan.feedback ? "reviewer-dashboard__plan-card--has-feedback" : ""
            }`}
            key={plan.id}
          >
            <div className="reviewer-dashboard__plan-id">
              <span>شناسه</span>
              <strong>{plan.trackingId}</strong>
            </div>

            <div className="reviewer-dashboard__plan-info">
              <div className="reviewer-dashboard__plan-title-row">
                {plan.feedback && (
                  <span
                    className="reviewer-dashboard__feedback-dot"
                    title="برای این طرح بازخورد ثبت شده است"
                    aria-label="بازخورد ثبت شده"
                  />
                )}
                <h4>{plan.title}</h4>
              </div>

              <p>{plan.call}</p>

              <div className="reviewer-dashboard__plan-meta">
                <span>فناور: {plan.innovator.name}</span>
                <span>حوزه: {plan.field}</span>
                <span>ارسال: {plan.sentAt}</span>
                <span>ددلاین: {plan.deadline}</span>
              </div>

              {plan.folders.length > 0 && (
                <div className="reviewer-dashboard__folder-tags">
                  {plan.folders.map((folderId) => (
                    <DashboardReviewFolderBadge
                      key={folderId}
                      label={getFolderLabel(folderId)}
                      tone={getFolderTone(folderId)}
                      onRemove={
                        folderFilter === folderId
                          ? () => toggleFolder(plan.id, folderId)
                          : undefined
                      }
                      removeLabel={`حذف از پوشه ${getFolderLabel(folderId)}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <ReviewerStatusBadge status={plan.status} />

            <div className="reviewer-dashboard__plan-actions">
              <Button
                type="button"
                variant="primary"
                size="sm"
                width="content"
                onClick={() => openPlan(plan.id)}
              >
                {plan.feedback
                  ? "مشاهده / ویرایش بازخورد"
                  : "مشاهده و ثبت بازخورد"}
              </Button>
            </div>
          </SharedDashboardPanel>
        ))}
      </div>

      <DashboardPagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        summary={`نمایش ${currentPagePlans.length} طرح از ${filteredPlans.length} مورد`}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() =>
          setCurrentPage((page) => Math.min(totalPages, page + 1))
        }
      />
    </SharedDashboardPanel>
  );
}

function HistoryPanel({ plans }) {
  const [yearFilter, setYearFilter] = useState("all");
  const [callFilter, setCallFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistoryPlanId, setSelectedHistoryPlanId] = useState(null);

  const reviewedPlans = plans.filter((plan) => plan.status === "بررسی شده");

  const years = [...new Set(reviewedPlans.map((plan) => getHistoryYear(plan)))];
  const callTypes = [
    ...new Set(reviewedPlans.map((plan) => getHistoryCallType(plan))),
  ];

  const filteredHistoryPlans = reviewedPlans.filter((plan) => {
    const matchesYear =
      yearFilter === "all" || getHistoryYear(plan) === yearFilter;
    const matchesCall =
      callFilter === "all" || getHistoryCallType(plan) === callFilter;

    return matchesYear && matchesCall;
  });

  const totalHistoryPages = Math.max(
    1,
    Math.ceil(filteredHistoryPlans.length / itemsPerPage),
  );
  const safeHistoryPage = Math.min(currentPage, totalHistoryPages);
  const currentHistoryPlans = filteredHistoryPlans.slice(
    (safeHistoryPage - 1) * itemsPerPage,
    safeHistoryPage * itemsPerPage,
  );

  const selectedHistoryPlan = filteredHistoryPlans.find(
    (plan) => plan.id === selectedHistoryPlanId,
  );

  if (selectedHistoryPlan) {
    return (
      <SharedDashboardPanel className="reviewer-dashboard__history-detail" padding="md">
        <div className="innovator-dashboard__panel-header reviewer-dashboard__detail-header">
          <div>
            <span>مشاهده تاریخچه</span>
            <h3>{selectedHistoryPlan.title}</h3>
            <p>شناسه طرح: {selectedHistoryPlan.trackingId}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            width="content"
            leadingIcon={<BackIcon />}
            onClick={() => setSelectedHistoryPlanId(null)}
          >
            بازگشت به تاریخچه
          </Button>
        </div>

        <div className="reviewer-dashboard__detail-grid">
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>فناور</span>
            <strong>{selectedHistoryPlan.innovator.name}</strong>
            <small>{selectedHistoryPlan.innovator.organization}</small>
          </SharedDashboardPanel>
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>نوع فراخوان</span>
            <strong>{getHistoryCallType(selectedHistoryPlan)}</strong>
            <small>سال {getHistoryYear(selectedHistoryPlan)}</small>
          </SharedDashboardPanel>
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>حوزه</span>
            <strong>{selectedHistoryPlan.field}</strong>
            <small>{selectedHistoryPlan.call}</small>
          </SharedDashboardPanel>
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" className="reviewer-dashboard__detail-metric">
            <span>وضعیت</span>
            <ReviewerStatusBadge status={selectedHistoryPlan.status} />
            <small>این طرح مربوط به گذشته است و امکان ثبت بازخورد ندارد.</small>
          </SharedDashboardPanel>
        </div>

        <Button
          href={getDownloadHref(selectedHistoryPlan)}
          download={selectedHistoryPlan.proposalFile}
          variant="outline"
          size="md"
          width="content"
          leadingIcon={<DownloadIcon />}
          className="reviewer-dashboard__history-download"
        >
          دانلود پروپوزال
        </Button>

        <DashboardNotice
          tone="success"
          title="بازخورد ثبت‌شده"
          className="reviewer-dashboard__history-feedback-view"
        >
          <p>
            {selectedHistoryPlan.feedback?.text ||
              "برای این طرح بازخورد متنی ثبت نشده است."}
          </p>
          {selectedHistoryPlan.feedback?.createdAt && (
            <small>{selectedHistoryPlan.feedback.createdAt}</small>
          )}
        </DashboardNotice>
      </SharedDashboardPanel>
    );
  }

  return (
    <SharedDashboardPanel className="reviewer-dashboard__history" padding="md">
      <div className="innovator-dashboard__panel-header">
        <div>
          <span>تاریخچه</span>
          <h3>طرح‌های بررسی‌شده گذشته</h3>
        </div>
      </div>

      <div className="reviewer-dashboard__history-filters">
        <label>
          <span>سال</span>
          <Select
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">همه سال‌ها</option>
            {years.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>نوع فراخوان</span>
          <Select
            value={callFilter}
            onChange={(event) => {
              setCallFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">همه فراخوان‌ها</option>
            {callTypes.map((callType) => (
              <option value={callType} key={callType}>
                {callType}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>تعداد نمایش</span>
          <Select
            value={itemsPerPage}
            onChange={(event) => {
              setItemsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>۱۰ عدد</option>
            <option value={20}>۲۰ عدد</option>
            <option value={50}>۵۰ عدد</option>
            <option value={100}>۱۰۰ عدد</option>
          </Select>
        </label>
      </div>

      <div className="reviewer-dashboard__history-list">
        {currentHistoryPlans.map((plan) => (
          <SharedDashboardPanel as="article" variant="subtle" padding="sm" key={plan.id}>
            <div>
              <span>{plan.trackingId}</span>
              <h4>{plan.title}</h4>
              <p>
                {getHistoryCallType(plan)} / سال {getHistoryYear(plan)} / فناور:{" "}
                {plan.innovator.name}
              </p>
            </div>

            <div className="reviewer-dashboard__history-actions">
              {plan.feedback && (
                <span
                  className="reviewer-dashboard__feedback-dot"
                  title="برای این طرح بازخورد ثبت شده است"
                />
              )}
              <ReviewerStatusBadge status={plan.status} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                width="content"
                onClick={() => setSelectedHistoryPlanId(plan.id)}
              >
                مشاهده
              </Button>
            </div>
          </SharedDashboardPanel>
        ))}
      </div>

      <DashboardPagination
        currentPage={safeHistoryPage}
        totalPages={totalHistoryPages}
        summary={`نمایش ${currentHistoryPlans.length} طرح از ${filteredHistoryPlans.length} مورد`}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() =>
          setCurrentPage((page) => Math.min(totalHistoryPages, page + 1))
        }
        className="reviewer-dashboard__history-pagination"
      />
    </SharedDashboardPanel>
  );
}

function ReviewerDashboardPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [reviewerProfile, setReviewerProfile] = useState(() =>
    getCurrentDashboardProfile(getReviewerProfile(currentUser)),
  );

  const saveReviewerProfile = (nextProfile, passwordData = {}) => {
    const savedProfile = saveCurrentDashboardProfile(
      nextProfile,
      getReviewerProfile(currentUser),
      passwordData,
    );
    setReviewerProfile(savedProfile);
    return savedProfile;
  };

  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState(() =>
    getNotificationsForCurrentUser().slice(0, 3),
  );
  const [reviewPlans, setReviewPlans] = useState(() =>
    createInitialReviewPlans(currentUser?.id),
  );
  const [initialFolderFilter, setInitialFolderFilter] = useState("all");

  const unreadMessagesCount = recentMessages.filter(
    (item) => !item.isRead,
  ).length;

  const currentTitle = useMemo(() => {
    if (activeSection === "plan-management") {
      return activeSubItem === "history" ? "تاریخچه" : "طرح‌های جاری";
    }

    const titleMap = {
      dashboard: "داشبورد",
      requests: "درخواست‌ها و پشتیبانی",
      messages: "پیام‌ها و اعلانات",
      faq: "سوالات متداول",
      profile: "پروفایل",
      "edit-profile": "ویرایش پروفایل",
    };

    return titleMap[activeSection] || "داشبورد";
  }, [activeSection, activeSubItem]);

  const resetCurrentContent = () => {
    setContentResetKey((currentKey) => currentKey + 1);
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

      if (
        item.id === "plan-management" &&
        item.subItems[0].id === "current-plans"
      ) {
        setInitialFolderFilter("all");
      }

      return;
    }

    setOpenMenuId(item.id);
    setActiveSubItem(item.subItems[0].id);

    if (
      item.id === "plan-management" &&
      item.subItems[0].id === "current-plans"
    ) {
      setInitialFolderFilter("all");
    }
  };

  const handleSubNavClick = (parentId, subItemId) => {
    setActiveSection(parentId);
    setOpenMenuId(parentId);
    setActiveSubItem(subItemId);

    if (parentId === "plan-management" && subItemId === "current-plans") {
      setInitialFolderFilter("all");
    }

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

    if (message.sourceType === "plan" || message.sourceType === "review") {
      setActiveSection("plan-management");
      setActiveSubItem("current-plans");
      setOpenMenuId("plan-management");
      setInitialFolderFilter("all");
      resetCurrentContent();
      return;
    }

    if (message.sourceType === "support-ticket") {
      setActiveSection("requests");
      setActiveSubItem("");
      setOpenMenuId("");
      resetCurrentContent();
      return;
    }

    setActiveSection("messages");
    setActiveSubItem("");
    setOpenMenuId("");
    resetCurrentContent();
  };

  const openProfile = () => {
    setActiveSection("profile");
    setActiveSubItem("");
    setOpenMenuId("");
    setIsProfileMenuOpen(false);
    resetCurrentContent();
  };

  const openEditProfile = () => {
    setActiveSection("edit-profile");
    setActiveSubItem("");
    setOpenMenuId("");
    setIsProfileMenuOpen(false);
    resetCurrentContent();
  };

  const openReviewerFolder = (folderId) => {
    setActiveSection("plan-management");
    setActiveSubItem("current-plans");
    setOpenMenuId("plan-management");
    setInitialFolderFilter(folderId);
    resetCurrentContent();
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <ReviewerHomePanel
          key={`dashboard-${contentResetKey}`}
          plans={reviewPlans}
          onOpenFolder={openReviewerFolder}
        />
      );
    }

    if (activeSection === "plan-management" && activeSubItem === "history") {
      return (
        <HistoryPanel key={`history-${contentResetKey}`} plans={reviewPlans} />
      );
    }

    if (activeSection === "plan-management") {
      return (
        <CurrentPlansPanel
          key={`current-plans-${contentResetKey}-${initialFolderFilter}`}
          plans={reviewPlans}
          setPlans={setReviewPlans}
          reviewerId={currentUser?.id || "user-reviewer-1"}
          initialFolderFilter={initialFolderFilter}
        />
      );
    }

    if (activeSection === "requests") {
      return <DashboardSupportRequests key={`requests-${contentResetKey}`} supportRoleName="داور" />;
    }

    if (activeSection === "messages") {
      return <DashboardMessages key={`messages-${contentResetKey}`} />;
    }

    if (activeSection === "faq") {
      return <DashboardFAQ key={`faq-${contentResetKey}`} items={FAQ_ITEMS} />;
    }

    if (activeSection === "profile") {
      return (
        <DashboardProfileView
          key={`profile-${contentResetKey}`}
          profile={reviewerProfile}
          onEdit={openEditProfile}
        />
      );
    }

    if (activeSection === "edit-profile") {
      return (
        <DashboardProfileEdit
          key={`edit-profile-${contentResetKey}`}
          profile={reviewerProfile}
          onSave={saveReviewerProfile}
          onCancel={openProfile}
        />
      );
    }

    return (
      <DashboardPanel plans={reviewPlans} onOpenFolder={openReviewerFolder} />
    );
  };

  return (
    <DashboardShell
      collapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
      logoSrc={universityLogo}
      navItems={NAV_ITEMS}
      activeSection={activeSection}
      activeSubItem={activeSubItem}
      openMenuId={openMenuId}
      onNavClick={handleNavClick}
      onSubNavClick={handleSubNavClick}
      title={currentTitle}
      className="reviewer-dashboard"
      topbarActions={
        <>
          <DashboardNotificationMenu
            open={isNotificationOpen}
            onOpenChange={setIsNotificationOpen}
            unreadCount={unreadMessagesCount}
            messages={recentMessages}
            onOpenMessages={openMessagesCenter}
            onMarkAllRead={markAllRecentMessagesAsRead}
            onMarkRead={markMessageAsRead}
            onOpenMessage={openNotificationTarget}
            onBeforeOpen={() => setIsProfileMenuOpen(false)}
          />

          <DashboardProfileMenu
            profile={reviewerProfile}
            open={isProfileMenuOpen}
            onOpenChange={setIsProfileMenuOpen}
            onOpenProfile={openProfile}
            onEditProfile={openEditProfile}
            onLogout={() => navigate("/auth")}
            onBeforeOpen={() => setIsNotificationOpen(false)}
          />
        </>
      }
    >
      {renderContent()}
    </DashboardShell>
  );
}

export default ReviewerDashboardPage;
