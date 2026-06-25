import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";

import "./InnovatorDashboardPage.css";
import "./ReviewerDashboardPage.css";

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
    tone: "priority",
  },
  {
    id: "needs-improvement",
    label: "نیازمند بهبود",
    tone: "improvement",
  },
  {
    id: "more-review",
    label: "بررسی بیشتر",
    tone: "review",
  },
];

const REVIEW_PLAN_TITLES = [
  "سامانه هوشمند تشخیص خطای تجهیزات صنعتی",
  "پلتفرم تحلیل مصرف انرژی ساختمان",
  "راهکار پایش کیفیت هوای شهری",
  "دستیار هوشمند ارزیابی پروپوزال",
  "مدل پیش‌بینی خرابی در شبکه توزیع",
  "سامانه مدیریت داده‌های آزمایشگاهی",
  "ابزار بهینه‌سازی مصرف آب در گلخانه",
  "پلتفرم پایش سلامت تجهیزات پزشکی",
  "سیستم هوشمند اولویت‌بندی تعمیرات",
  "راهکار تحلیل ریسک زنجیره تأمین",
  "سامانه تشخیص ناهنجاری در خطوط تولید",
  "پلتفرم مدیریت انرژی در واحدهای صنعتی",
];

const REVIEW_PLAN_FIELDS = [
  "هوش مصنوعی",
  "انرژی و پایداری",
  "سلامت دیجیتال",
  "صنعت و تولید",
];

const REVIEW_PLAN_STATUSES = ["در انتظار بررسی", "بررسی شده"];

const INITIAL_REVIEW_PLANS = Array.from({ length: 36 }, (_, index) => {
  const planNumber = index + 1;
  const hasFeedback = [2, 4, 7, 11, 15, 19, 22, 27, 31, 35].includes(
    planNumber,
  );
  const status =
    hasFeedback || planNumber % 5 === 0 ? "بررسی شده" : "در انتظار بررسی";
  const folderIds =
    planNumber % 9 === 0
      ? ["priority"]
      : planNumber % 7 === 0
        ? ["needs-improvement"]
        : planNumber % 6 === 0
          ? ["more-review"]
          : [];

  return {
    id: planNumber,
    trackingId: `HTF-1405-${String(planNumber).padStart(4, "0")}`,
    title: REVIEW_PLAN_TITLES[index % REVIEW_PLAN_TITLES.length],
    field: REVIEW_PLAN_FIELDS[index % REVIEW_PLAN_FIELDS.length],
    call: "فراخوان هدایت اعتبارات توسعه فناوری",
    innovator: {
      name: ["مهدیه سیفی", "رضا احمدی", "سارا محمدی", "علی رضوانی"][index % 4],
      organization: [
        "دانشگاه تهران",
        "شرکت فناوران نوآور",
        "هسته پژوهشی داده‌محور",
        "مرکز رشد فناوری‌های نو",
      ][index % 4],
      phone: `0912${String(3000000 + index * 3179).slice(0, 7)}`,
      email: `innovator${planNumber}@example.com`,
    },
    sentAt: `۱۴۰۵/۰۳/${String((planNumber % 24) + 1).padStart(
      2,
      "0",
    )} - ساعت ${String((planNumber % 8) + 9).padStart(2, "0")}:۳۰`,
    deadline: `۱۴۰۵/۰۴/${String((planNumber % 20) + 5).padStart(
      2,
      "0",
    )} - ساعت ۱۸:۰۰`,
    status,
    proposalFile: `${String(planNumber).padStart(2, "0")}-proposal.pdf`,
    folders: folderIds,
    score: hasFeedback ? ((planNumber % 5) + 1) * 15 : "",
    recommendation: hasFeedback
      ? planNumber % 2 === 0
        ? "قابل بررسی در مرحله بعد"
        : "نیازمند اصلاح"
      : "",
    feedback: hasFeedback
      ? {
          text: "طرح از نظر مسئله‌محوری قابل توجه است، اما برای تصمیم‌گیری دقیق‌تر لازم است مسیر اعتبارسنجی، شاخص‌های فنی و برنامه اجرای پایلوت شفاف‌تر شود.",
          createdAt: `۱۴۰۵/۰۳/${String((planNumber % 20) + 2).padStart(
            2,
            "0",
          )} - ساعت ۱۲:۱۵`,
        }
      : null,
  };
});

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

const REVIEWER_PROFILE = {
  firstName: "مهدی",
  lastName: "رضایی",
  phone: "09123450657",
  email: "reviewer@example.com",
  role: "داور",
  memberSince: "عضو از سال ۱۴۰۴ (به مدت ۱ سال)",
};

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
  if (plan.id % 3 === 0) return "۱۴۰۳";
  if (plan.id % 2 === 0) return "۱۴۰۴";
  return "۱۴۰۵";
}

function getHistoryCallType(plan) {
  if (plan.field === "سلامت دیجیتال") return "فراخوان سلامت دیجیتال";
  if (plan.field === "انرژی و پایداری") return "فراخوان انرژی و پایداری";
  return "فراخوان هاتف";
}

function ReviewerStatusBadge({ status }) {
  return (
    <span
      className={`reviewer-dashboard__status reviewer-dashboard__status--${getStatusClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function DashboardPanel({ plans, onOpenFolder }) {
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
          <article key={item.label} className="reviewer-dashboard__stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.hint}</p>
          </article>
        ))}
      </div>

      <div className="reviewer-dashboard__dashboard-folders">
        {REVIEW_FOLDERS.map((folder) => (
          <button
            type="button"
            key={folder.id}
            className={`reviewer-dashboard__folder-card reviewer-dashboard__folder-card--${folder.tone}`}
            onDoubleClick={() => onOpenFolder(folder.id)}
            title="برای ورود به پوشه دوبار کلیک کنید"
          >
            <span className="reviewer-dashboard__folder-icon">
              <FolderIcon />
            </span>
            <span>{folder.label}</span>
            <strong>
              {plans.filter((plan) => plan.folders.includes(folder.id)).length}
            </strong>
            <small>برای ورود به پوشه دوبار کلیک کنید</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function CurrentPlansPanel({ plans, setPlans, initialFolderFilter = "all" }) {
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

    const createdAt = new Date().toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
              status: "بررسی شده",
              recommendation,
              score,
              feedback: {
                text: feedbackText.trim(),
                createdAt: `${createdAt} - ثبت امروز`,
              },
            }
          : plan,
      ),
    );
  };

  const deleteFeedback = () => {
    if (!selectedPlan || !selectedPlan.feedback) return;

    const confirmed = window.confirm("آیا از حذف بازخورد این طرح مطمئن هستید؟");

    if (!confirmed) return;

    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
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
      <section className="reviewer-dashboard__panel reviewer-dashboard__review-detail">
        <div className="reviewer-dashboard__detail-header">
          <div>
            <span>جزئیات طرح</span>
            <h3>{selectedPlan.title}</h3>
            <p>شناسه طرح: {selectedPlan.trackingId}</p>
          </div>

          <button type="button" onClick={closePlan}>
            <BackIcon />
            بازگشت به لیست
          </button>
        </div>

        <div className="reviewer-dashboard__detail-grid">
          <article>
            <span>فناور</span>
            <strong>{selectedPlan.innovator.name}</strong>
            <small>{selectedPlan.innovator.organization}</small>
          </article>

          <article>
            <span>حوزه</span>
            <strong>{selectedPlan.field}</strong>
            <small>{selectedPlan.call}</small>
          </article>

          <article>
            <span>تاریخ ارسال</span>
            <strong>{selectedPlan.sentAt}</strong>
            <small>ددلاین: {selectedPlan.deadline}</small>
          </article>

          <article>
            <span>وضعیت</span>
            <ReviewerStatusBadge status={selectedPlan.status} />
            {selectedPlan.feedback && <small>بازخورد ثبت شده است</small>}
          </article>
        </div>

        <div className="reviewer-dashboard__review-layout">
          <div className="reviewer-dashboard__info-stack">
            <div className="reviewer-dashboard__info-card">
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
            </div>

            <div className="reviewer-dashboard__info-card">
              <h4>پوشه‌های داور</h4>
              <div className="reviewer-dashboard__folder-actions">
                {REVIEW_FOLDERS.map((folder) => (
                  <button
                    type="button"
                    key={folder.id}
                    className={
                      selectedPlan.folders.includes(folder.id)
                        ? `reviewer-dashboard__folder-toggle reviewer-dashboard__folder-toggle--${folder.tone} reviewer-dashboard__folder-toggle--active`
                        : `reviewer-dashboard__folder-toggle reviewer-dashboard__folder-toggle--${folder.tone}`
                    }
                    onClick={() => toggleFolder(selectedPlan.id, folder.id)}
                  >
                    {selectedPlan.folders.includes(folder.id)
                      ? `حذف از ${folder.label}`
                      : `افزودن به ${folder.label}`}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={getDownloadHref(selectedPlan)}
              download={selectedPlan.proposalFile}
              className="reviewer-dashboard__download-link"
            >
              <DownloadIcon />
              دانلود پروپوزال
            </a>
          </div>

          <div className="reviewer-dashboard__feedback-card">
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
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                placeholder="بازخورد تخصصی خود را درباره طرح وارد کنید..."
              />
            </label>

            <div className="reviewer-dashboard__feedback-fields">
              <label>
                <span>پیشنهاد داور</span>
                <select
                  value={recommendation}
                  onChange={(event) => setRecommendation(event.target.value)}
                >
                  <option>قابل بررسی در مرحله بعد</option>
                  <option>نیازمند اصلاح</option>
                  <option>دارای اولویت</option>
                  <option>عدم پیشنهاد برای ادامه</option>
                </select>
              </label>

              <label>
                <span>امتیاز</span>
                <input
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
              <div className="reviewer-dashboard__previous-feedback">
                <span>آخرین بازخورد</span>
                <p>{selectedPlan.feedback.text}</p>
                <small>{selectedPlan.feedback.createdAt}</small>
              </div>
            )}

            <div className="reviewer-dashboard__feedback-actions">
              {selectedPlan.feedback && (
                <button
                  type="button"
                  className="reviewer-dashboard__delete-feedback"
                  onClick={deleteFeedback}
                >
                  حذف بازخورد
                </button>
              )}

              <button
                type="button"
                className="reviewer-dashboard__save-feedback"
                onClick={saveFeedback}
                disabled={!feedbackText.trim()}
              >
                {selectedPlan.feedback
                  ? "ذخیره ویرایش بازخورد"
                  : "ذخیره بازخورد"}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reviewer-dashboard__panel reviewer-dashboard__plans-panel">
      <div className="reviewer-dashboard__panel-header">
        <div>
          <span>طرح‌های جاری</span>
          <h3>طرح‌های اختصاص‌یافته برای بررسی</h3>
        </div>
      </div>

      <div className="reviewer-dashboard__folders-board">
        <button
          type="button"
          className={
            folderFilter === "all"
              ? "reviewer-dashboard__folder-card reviewer-dashboard__folder-card--all reviewer-dashboard__folder-card--active"
              : "reviewer-dashboard__folder-card reviewer-dashboard__folder-card--all"
          }
          onClick={() => {
            setFolderFilter("all");
            setCurrentPage(1);
          }}
        >
          <span className="reviewer-dashboard__folder-icon">
            <FolderIcon />
          </span>
          <span>همه طرح‌ها</span>
          <strong>{plans.length}</strong>
          <small>نمایش کل طرح‌های اختصاص‌یافته</small>
        </button>

        {REVIEW_FOLDERS.map((folder) => (
          <button
            type="button"
            key={folder.id}
            className={
              folderFilter === folder.id
                ? `reviewer-dashboard__folder-card reviewer-dashboard__folder-card--${folder.tone} reviewer-dashboard__folder-card--active`
                : `reviewer-dashboard__folder-card reviewer-dashboard__folder-card--${folder.tone}`
            }
            onDoubleClick={() => {
              setFolderFilter(folder.id);
              setCurrentPage(1);
            }}
            title="برای ورود به پوشه دوبار کلیک کنید"
          >
            <span className="reviewer-dashboard__folder-icon">
              <FolderIcon />
            </span>
            <span>{folder.label}</span>
            <strong>
              {plans.filter((plan) => plan.folders.includes(folder.id)).length}
            </strong>
            <small>برای ورود به پوشه دوبار کلیک کنید</small>
          </button>
        ))}
      </div>

      {folderFilter !== "all" && (
        <div className="reviewer-dashboard__folder-view-note">
          <span>
            در حال مشاهده پوشه «{getFolderLabel(folderFilter)}». برای حذف یک طرح
            از این پوشه، روی ضربدر کنار نام پوشه در کارت طرح بزنید.
          </span>
          <button
            type="button"
            onClick={() => {
              setFolderFilter("all");
              setCurrentPage(1);
            }}
          >
            خروج از پوشه
          </button>
        </div>
      )}

      <div className="reviewer-dashboard__toolbar">
        <label className="reviewer-dashboard__search">
          <span>جستجو</span>
          <input
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
          <div>
            <button
              type="button"
              className={statusFilter === "all" ? "is-active" : ""}
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
            >
              همه
            </button>
            <button
              type="button"
              className={statusFilter === "waiting" ? "is-active" : ""}
              onClick={() => {
                setStatusFilter("waiting");
                setCurrentPage(1);
              }}
            >
              بررسی نشده‌ها
            </button>
            <button
              type="button"
              className={statusFilter === "reviewed" ? "is-active" : ""}
              onClick={() => {
                setStatusFilter("reviewed");
                setCurrentPage(1);
              }}
            >
              بررسی شده‌ها
            </button>
            <button
              type="button"
              className={statusFilter === "no-feedback" ? "is-active" : ""}
              onClick={() => {
                setStatusFilter("no-feedback");
                setCurrentPage(1);
              }}
            >
              بدون بازخورد
            </button>
          </div>
        </div>

        <label className="reviewer-dashboard__page-size">
          <span>تعداد نمایش</span>
          <select
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
          </select>
        </label>
      </div>

      <div className="reviewer-dashboard__plans-list">
        {currentPagePlans.map((plan) => (
          <article
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
                    <span
                      key={folderId}
                      className={`reviewer-dashboard__folder-tag reviewer-dashboard__folder-tag--${getFolderTone(
                        folderId,
                      )}`}
                    >
                      <strong>در فولدر:</strong>
                      <span>{getFolderLabel(folderId)}</span>
                      {folderFilter === folderId && (
                        <button
                          type="button"
                          onClick={() => toggleFolder(plan.id, folderId)}
                          aria-label={`حذف از پوشه ${getFolderLabel(folderId)}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ReviewerStatusBadge status={plan.status} />

            <div className="reviewer-dashboard__plan-actions">
              <button type="button" onClick={() => openPlan(plan.id)}>
                {plan.feedback
                  ? "مشاهده / ویرایش بازخورد"
                  : "مشاهده و ثبت بازخورد"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="reviewer-dashboard__pagination">
        <span>
          نمایش {currentPagePlans.length} طرح از {filteredPlans.length} مورد
        </span>

        <div>
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            قبلی
          </button>

          <strong>
            صفحه {safeCurrentPage} از {totalPages}
          </strong>

          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            بعدی
          </button>
        </div>
      </div>
    </section>
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
      <section className="reviewer-dashboard__panel reviewer-dashboard__history-detail">
        <div className="reviewer-dashboard__detail-header">
          <div>
            <span>مشاهده تاریخچه</span>
            <h3>{selectedHistoryPlan.title}</h3>
            <p>شناسه طرح: {selectedHistoryPlan.trackingId}</p>
          </div>

          <button type="button" onClick={() => setSelectedHistoryPlanId(null)}>
            <BackIcon />
            بازگشت به تاریخچه
          </button>
        </div>

        <div className="reviewer-dashboard__detail-grid">
          <article>
            <span>فناور</span>
            <strong>{selectedHistoryPlan.innovator.name}</strong>
            <small>{selectedHistoryPlan.innovator.organization}</small>
          </article>
          <article>
            <span>نوع فراخوان</span>
            <strong>{getHistoryCallType(selectedHistoryPlan)}</strong>
            <small>سال {getHistoryYear(selectedHistoryPlan)}</small>
          </article>
          <article>
            <span>حوزه</span>
            <strong>{selectedHistoryPlan.field}</strong>
            <small>{selectedHistoryPlan.call}</small>
          </article>
          <article>
            <span>وضعیت</span>
            <ReviewerStatusBadge status={selectedHistoryPlan.status} />
            <small>این طرح مربوط به گذشته است و امکان ثبت بازخورد ندارد.</small>
          </article>
        </div>

        <a
          href={getDownloadHref(selectedHistoryPlan)}
          download={selectedHistoryPlan.proposalFile}
          className="reviewer-dashboard__download-link reviewer-dashboard__history-download"
        >
          <DownloadIcon />
          دانلود پروپوزال
        </a>

        <div className="reviewer-dashboard__history-feedback-view">
          <span>بازخورد ثبت‌شده</span>
          <p>
            {selectedHistoryPlan.feedback?.text ||
              "برای این طرح بازخورد متنی ثبت نشده است."}
          </p>
          {selectedHistoryPlan.feedback?.createdAt && (
            <small>{selectedHistoryPlan.feedback.createdAt}</small>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="reviewer-dashboard__panel reviewer-dashboard__history">
      <div className="reviewer-dashboard__panel-header">
        <div>
          <span>تاریخچه</span>
          <h3>طرح‌های بررسی‌شده گذشته</h3>
        </div>
      </div>

      <div className="reviewer-dashboard__history-filters">
        <label>
          <span>سال</span>
          <select
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
          </select>
        </label>

        <label>
          <span>نوع فراخوان</span>
          <select
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
          </select>
        </label>

        <label>
          <span>تعداد نمایش</span>
          <select
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
          </select>
        </label>
      </div>

      <div className="reviewer-dashboard__history-list">
        {currentHistoryPlans.map((plan) => (
          <article key={plan.id}>
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
              <button
                type="button"
                onClick={() => setSelectedHistoryPlanId(plan.id)}
              >
                مشاهده
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="reviewer-dashboard__pagination reviewer-dashboard__history-pagination">
        <span>
          نمایش {currentHistoryPlans.length} طرح از{" "}
          {filteredHistoryPlans.length} مورد
        </span>

        <div>
          <button
            type="button"
            disabled={safeHistoryPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            قبلی
          </button>

          <strong>
            صفحه {safeHistoryPage} از {totalHistoryPages}
          </strong>

          <button
            type="button"
            disabled={safeHistoryPage === totalHistoryPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalHistoryPages, page + 1))
            }
          >
            بعدی
          </button>
        </div>
      </div>
    </section>
  );
}

function TicketsPanel() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [mode, setMode] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  const openList = () => {
    setMode("list");
    setSelectedTicketId(null);
    setTicketTitle("");
    setTicketMessage("");
  };

  const submitTicket = (event) => {
    event.preventDefault();

    if (!ticketMessage.trim()) return;

    setTickets((currentTickets) => [
      {
        id: Date.now(),
        title: ticketTitle.trim() || "درخواست جدید",
        message: ticketMessage.trim(),
        sentAt: getCurrentPersianDateTime(),
        status: "در انتظار پیگیری",
        seenBySupport: false,
        supportReply: "",
        repliedAt: "",
      },
      ...currentTickets,
    ]);

    openList();
  };

  const deleteTicket = (ticketId) => {
    const targetTicket = tickets.find((ticket) => ticket.id === ticketId);

    if (!targetTicket || targetTicket.seenBySupport) return;

    setTickets((currentTickets) =>
      currentTickets.filter((ticket) => ticket.id !== ticketId),
    );
  };

  if (mode === "new") {
    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>تیکت جدید</span>
              <h3>ثبت تیکت پشتیبانی</h3>
              <p>درخواست پشتیبانی شما به واحد مربوطه ارسال می‌شود.</p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت
            </button>
          </div>

          <form className="support-requests__form" onSubmit={submitTicket}>
            <label>
              <span>عنوان</span>
              <input
                type="text"
                value={ticketTitle}
                onChange={(event) => setTicketTitle(event.target.value)}
                placeholder="عنوان تیکت"
              />
            </label>

            <label>
              <span>متن تیکت</span>
              <textarea
                value={ticketMessage}
                onChange={(event) => setTicketMessage(event.target.value)}
                placeholder="متن پیام خود را وارد کنید..."
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
              <button type="submit" disabled={!ticketMessage.trim()}>
                ثبت تیکت
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (mode === "view" && selectedTicket) {
    const hasReply = Boolean(selectedTicket.supportReply);
    const canDelete = !selectedTicket.seenBySupport;

    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>جزئیات تیکت</span>
              <h3>{selectedTicket.title}</h3>
              <p>ارسال شده در {selectedTicket.sentAt}</p>
            </div>

            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت
            </button>
          </div>

          <div className="support-requests__conversation">
            <article className="support-requests__message support-requests__message--user">
              <span>پیام شما</span>
              <p>{selectedTicket.message}</p>
            </article>

            {hasReply ? (
              <article className="support-requests__message support-requests__message--support">
                <span>پاسخ پشتیبان</span>
                <p>{selectedTicket.supportReply}</p>
              </article>
            ) : (
              <article className="support-requests__empty-reply">
                هنوز پاسخی ثبت نشده است.
              </article>
            )}
          </div>

          {canDelete && (
            <div className="support-requests__detail-actions">
              <button
                type="button"
                className="support-requests__delete-button"
                onClick={() => {
                  deleteTicket(selectedTicket.id);
                  openList();
                }}
              >
                حذف تیکت
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
            <h3>تیکت‌ها و پشتیبانی</h3>
            <p>
              تیکت‌های قبلی، وضعیت بررسی و پاسخ‌های پشتیبان نمایش داده می‌شوند.
            </p>
          </div>

          <button type="button" onClick={() => setMode("new")}>
            ثبت تیکت جدید
          </button>
        </div>

        <div className="support-requests__list">
          {tickets.map((ticket) => {
            const hasReply = Boolean(ticket.supportReply);
            const canDelete = !ticket.seenBySupport;

            return (
              <article className="support-requests__card" key={ticket.id}>
                <div className="support-requests__card-main">
                  <div className="support-requests__card-title">
                    <h4>{ticket.title}</h4>
                    {hasReply && (
                      <span className="support-requests__reply-badge">
                        پاسخ دریافت شده
                      </span>
                    )}
                    {!hasReply && (
                      <span className="support-requests__waiting-badge">
                        در انتظار پیگیری
                      </span>
                    )}
                  </div>

                  <p>{ticket.message}</p>

                  <div className="support-requests__meta">
                    <span>ارسال: {ticket.sentAt}</span>
                    <span>
                      پاسخ: {hasReply ? ticket.repliedAt : "در انتظار پاسخ"}
                    </span>
                  </div>
                </div>

                <div className="support-requests__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setMode("view");
                    }}
                  >
                    مشاهده
                  </button>

                  {canDelete && (
                    <button
                      type="button"
                      className="support-requests__delete-button"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      حذف
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
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

function MessagesPanel() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [filter, setFilter] = useState("all");

  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId,
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

  const openMessage = (messageId) => {
    setSelectedMessageId(messageId);
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message,
      ),
    );
  };

  const markAllAsRead = () => {
    setMessages((currentMessages) =>
      currentMessages.map((message) => ({ ...message, isRead: true })),
    );
  };

  const deleteMessage = (messageId) => {
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );
    setSelectedMessageId(null);
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <div className="messages-panel__panel">
          <div className="messages-panel__panel-header">
            <div>
              <span>{selectedMessage.category}</span>
              <h3>{selectedMessage.title}</h3>
              <p>{selectedMessage.sentAt}</p>
            </div>

            <button
              type="button"
              className="messages-panel__neutral-button"
              onClick={() => setSelectedMessageId(null)}
            >
              بازگشت به پیام‌ها
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
            <h3>لیست پیام‌های سامانه</h3>
          </div>

          <div className="messages-panel__header-actions">
            <button type="button" onClick={markAllAsRead}>
              خواندن همه
            </button>
            <button
              type="button"
              className="messages-panel__delete-all"
              onClick={() => setMessages([])}
            >
              حذف همه
            </button>
          </div>
        </div>

        <div className="messages-panel__filters">
          <button
            type="button"
            className={filter === "all" ? "messages-panel__filter--active" : ""}
            onClick={() => setFilter("all")}
          >
            همه پیام‌ها <strong>{messages.length}</strong>
          </button>

          <button
            type="button"
            className={
              filter === "unread" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("unread")}
          >
            خوانده‌نشده <strong>{unreadCount}</strong>
          </button>

          <button
            type="button"
            className={
              filter === "important" ? "messages-panel__filter--active" : ""
            }
            onClick={() => setFilter("important")}
          >
            مهم <strong>{importantCount}</strong>
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

              <div className="messages-panel__card-actions">
                <button type="button" onClick={() => openMessage(message.id)}>
                  مشاهده پیام
                </button>
                <button
                  type="button"
                  className="messages-panel__remove-message"
                  onClick={() => deleteMessage(message.id)}
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

  return (
    <section className="faq-panel">
      <div className="faq-panel__panel">
        <div className="faq-panel__panel-header">
          <div>
            <span>سوالات متداول</span>
            <h3>راهنمای داوری و استفاده از داشبورد</h3>
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
                <button
                  type="button"
                  onClick={() =>
                    setOpenQuestionId((currentId) =>
                      currentId === item.id ? null : item.id,
                    )
                  }
                >
                  <span>{item.category}</span>
                  <strong>{item.question}</strong>
                  <i>{isOpen ? "−" : "+"}</i>
                </button>

                {isOpen && <p>{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProfilePanel({ profile, onEdit }) {
  return (
    <section className="reviewer-dashboard__profile-panel">
      <div className="reviewer-dashboard__profile-card">
        <button type="button" onClick={onEdit}>
          ویرایش پروفایل
        </button>

        <div className="reviewer-dashboard__profile-head">
          <span>پروفایل کاربری</span>
          <div className="reviewer-dashboard__profile-avatar">د</div>
          <h3>
            {profile.firstName} {profile.lastName}
          </h3>
          <p>{profile.role}</p>
        </div>

        <div className="reviewer-dashboard__profile-grid">
          <article>
            <span>نام</span>
            <strong>{profile.firstName}</strong>
          </article>
          <article>
            <span>نام خانوادگی</span>
            <strong>{profile.lastName}</strong>
          </article>
          <article>
            <span>ایمیل</span>
            <strong>{profile.email}</strong>
          </article>
          <article>
            <span>شماره موبایل</span>
            <strong>{profile.phone}</strong>
          </article>
          <article>
            <span>سطح کاربری</span>
            <strong>{profile.role}</strong>
          </article>
          <article>
            <span>سابقه عضویت</span>
            <strong>{profile.memberSince}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

function EditProfilePanel({ profile, onCancel }) {
  const [formValues, setFormValues] = useState(profile);

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="reviewer-dashboard__profile-panel">
      <div className="reviewer-dashboard__profile-card reviewer-dashboard__profile-card--edit">
        <div className="reviewer-dashboard__profile-edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات کاربری</h3>
          </div>

          <button type="button" onClick={onCancel}>
            انصراف
          </button>
        </div>

        <div className="reviewer-dashboard__profile-form-grid">
          <label>
            <span>نام</span>
            <input
              type="text"
              value={formValues.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </label>

          <label>
            <span>نام خانوادگی</span>
            <input
              type="text"
              value={formValues.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </label>

          <label>
            <span>شماره موبایل</span>
            <input
              type="text"
              value={formValues.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
        </div>

        <div className="reviewer-dashboard__password-box">
          <div>
            <span>تغییر رمز عبور</span>
            <p>برای تغییر رمز، رمز فعلی و رمز جدید را وارد کنید.</p>
          </div>

          <div className="reviewer-dashboard__profile-form-grid">
            <label>
              <span>رمز عبور فعلی</span>
              <input type="password" />
            </label>
            <label>
              <span>رمز عبور جدید</span>
              <input type="password" />
            </label>
            <label>
              <span>تکرار رمز عبور جدید</span>
              <input type="password" />
            </label>
          </div>
        </div>

        <div className="reviewer-dashboard__profile-actions">
          <button type="button" onClick={onCancel}>
            انصراف
          </button>
          <button type="button">ذخیره تغییرات</button>
        </div>
      </div>
    </section>
  );
}

function ReviewerDashboardPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState(
    INITIAL_MESSAGES.slice(0, 3),
  );
  const [reviewPlans, setReviewPlans] = useState(INITIAL_REVIEW_PLANS);
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

  const markMessageAsRead = (messageId) => {
    setRecentMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message,
      ),
    );
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
        <DashboardPanel
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
          initialFolderFilter={initialFolderFilter}
        />
      );
    }

    if (activeSection === "requests") {
      return <TicketsPanel key={`requests-${contentResetKey}`} />;
    }

    if (activeSection === "messages") {
      return <MessagesPanel key={`messages-${contentResetKey}`} />;
    }

    if (activeSection === "faq") {
      return <FaqPanel key={`faq-${contentResetKey}`} />;
    }

    if (activeSection === "profile") {
      return (
        <ProfilePanel
          key={`profile-${contentResetKey}`}
          profile={REVIEWER_PROFILE}
          onEdit={openEditProfile}
        />
      );
    }

    if (activeSection === "edit-profile") {
      return (
        <EditProfilePanel
          key={`edit-profile-${contentResetKey}`}
          profile={REVIEWER_PROFILE}
          onCancel={openProfile}
        />
      );
    }

    return (
      <DashboardPanel plans={reviewPlans} onOpenFolder={openReviewerFolder} />
    );
  };

  return (
    <main
      className={`innovator-dashboard reviewer-dashboard ${
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

            <h1>{currentTitle}</h1>
          </div>

          <div className="innovator-dashboard__topbar-actions">
            <div className="innovator-dashboard__notification-menu">
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
                      >
                        <div>
                          <h4>{message.title}</h4>
                          <p>{message.sentAt}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => markMessageAsRead(message.id)}
                          disabled={message.isRead}
                        >
                          {message.isRead ? "خوانده شد" : "Read"}
                        </button>
                      </article>
                    ))}
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
                    {REVIEWER_PROFILE.firstName} {REVIEWER_PROFILE.lastName}
                  </strong>
                  <small>نوع کاربر: {REVIEWER_PROFILE.role}</small>
                </span>

                <span className="innovator-dashboard__top-avatar">د</span>

                <span className="innovator-dashboard__profile-caret">▾</span>
              </button>

              {isProfileMenuOpen && (
                <div className="innovator-dashboard__profile-dropdown">
                  <button type="button" onClick={openProfile}>
                    پروفایل
                  </button>
                  <button type="button" onClick={openEditProfile}>
                    ویرایش پروفایل
                  </button>
                  <button
                    type="button"
                    className="innovator-dashboard__profile-logout"
                    onClick={() => navigate("/auth")}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {renderContent()}
      </section>
    </main>
  );
}

export default ReviewerDashboardPage;
