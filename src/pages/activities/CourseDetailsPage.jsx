import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import ExpandableArticle from "../../components/activities/ExpandableArticle";

import {
  getPublicCourseById,
  getPublicCourseItems,
  isPreviewAllowedForInstructorActivity,
} from "../../services/publicActivityService";

import {
  addActivityRegistration,
  consumePendingActivityRegistrationForActivity,
  getActivityRegistrationStats,
  isRegisteredForActivity,
  savePendingActivityRegistration,
} from "../../services/activityRegistrationService";
import { getCurrentUser } from "../../services/authService";

import facebookIcon from "../../assets/icons/contact/facebook.svg";
import instagramIcon from "../../assets/icons/contact/instagram.svg";
import telegramIcon from "../../assets/icons/contact/telegram.svg";
import twitterIcon from "../../assets/icons/contact/twitter.svg";
import whatsappIcon from "../../assets/icons/contact/whatsapp.svg";

import "./CourseDetailsPage.css";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5V12l3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M7 3v4M17 3v4M3.5 9h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="9"
        r="2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 19V13M12 19V9M19 19V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 19c.3-4 2.2-6 5.5-6s5.2 2 5.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15 6.2a2.7 2.7 0 0 1 0 5.2M16.5 13.3c2.5.5 3.8 2.4 4 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 12.5 4 4L18 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const defaultLearningOutcomes = [
  {
    id: 1,
    title: "طراحی برنامه مدیریت سبز",
    description:
      "توانایی طراحی یک برنامه اجرایی برای کاهش مصرف منابع و افزایش بهره‌وری.",
    available: true,
  },
  {
    id: 2,
    title: "تحلیل شاخص‌های زیست‌محیطی",
    description: "آشنایی با روش‌های تحلیل داده‌های محیطی و شاخص‌های پایداری.",
    available: true,
  },
  {
    id: 3,
    title: "مدیریت پروژه‌های فناورانه",
    description: "یادگیری برنامه‌ریزی، کنترل و ارزیابی پروژه‌های فناورانه.",
    available: true,
  },
  {
    id: 4,
    title: "تدوین مدل اجرایی",
    description: "تبدیل یافته‌های آموزشی به یک مدل عملیاتی و قابل اجرا.",
    available: false,
  },
];

const defaultCourseModules = [
  {
    id: 1,
    title: "بخش اول: مبانی و اصول مدیریت سبز",
    content:
      "در این بخش، مفاهیم پایه توسعه پایدار، مدیریت منابع، کاهش مصرف انرژی و نقش سازمان‌ها در حفاظت از محیط زیست بررسی می‌شود.",
  },
  {
    id: 2,
    title: "بخش دوم: طراحی و ارزیابی برنامه اجرایی",
    content:
      "شرکت‌کنندگان با تدوین شاخص‌ها، تعیین اهداف قابل اندازه‌گیری، طراحی برنامه عملیاتی و روش‌های ارزیابی عملکرد آشنا می‌شوند.",
  },
  {
    id: 3,
    title: "بخش سوم: پروژه پایانی و ارائه",
    content:
      "در پایان دوره، هر شرکت‌کننده یک پروژه کاربردی متناسب با نیاز سازمان یا مجموعه خود طراحی و ارائه خواهد کرد.",
  },
];

const defaultCourseBenefits = [
  {
    id: 1,
    title: "محتوای کاربردی",
    description:
      "مطالب دوره براساس نیازهای واقعی محیط‌های دانشگاهی و صنعتی طراحی شده‌اند.",
  },
  {
    id: 2,
    title: "مدرس متخصص",
    description:
      "آموزش توسط مدرسان دارای تجربه دانشگاهی و اجرایی ارائه می‌شود.",
  },
  {
    id: 3,
    title: "پروژه عملی",
    description: "در طول دوره یک پروژه واقعی و قابل استفاده تدوین می‌کنید.",
  },
  {
    id: 4,
    title: "گواهی پایان دوره",
    description: "پس از تکمیل دوره و پروژه نهایی، گواهی شرکت صادر می‌شود.",
  },
];

const defaultFrequentlyAskedQuestions = [
  {
    id: 1,
    title: "آیا برای شرکت در دوره پیش‌نیاز خاصی وجود دارد؟",
    content:
      "آشنایی اولیه با مدیریت و مفاهیم توسعه پایدار مفید است، اما الزامی نیست.",
  },
  {
    id: 2,
    title: "آیا جلسات دوره ضبط می‌شوند؟",
    content:
      "دسترسی به فایل جلسات براساس شرایط ثبت‌نام و قوانین برگزاری دوره تعیین می‌شود.",
  },
  {
    id: 3,
    title: "گواهی دوره چگونه صادر می‌شود؟",
    content:
      "شرکت منظم در جلسات و تحویل پروژه پایانی برای دریافت گواهی الزامی است.",
  },
];

const articleParagraphs = [
  "توانمندسازی پژوهشگران و فعالان فناوری یکی از مهم‌ترین مسیرهای توسعه اقتصاد دانش‌بنیان است. دوره‌های هاتف با تمرکز بر مهارت‌های کاربردی، مدیریت فناوری و ارتباط دانشگاه و صنعت طراحی شده‌اند.",
  "در این برنامه آموزشی، شرکت‌کنندگان علاوه بر یادگیری مفاهیم نظری، با تمرین‌ها و پروژه‌های واقعی روبه‌رو می‌شوند تا بتوانند دانش به‌دست‌آمده را در محیط کاری خود اجرا کنند.",
  "محتوای دوره‌ها با همکاری مدرسان دانشگاهی، مدیران اجرایی و متخصصان صنایع تدوین می‌شود و متناسب با تغییرات فناوری به‌روزرسانی خواهد شد.",
];

const socialLinks = [
  { id: 1, label: "فیسبوک", icon: facebookIcon },
  { id: 2, label: "واتساپ", icon: whatsappIcon },
  { id: 3, label: "توییتر", icon: twitterIcon },
  { id: 4, label: "اینستاگرام", icon: instagramIcon },
  { id: 5, label: "تلگرام", icon: telegramIcon },
];

function getStatusLabel(status) {
  if (status === "registering") return "در حال ثبت‌نام";
  if (status === "ongoing") return "در حال برگزاری";
  if (status === "past") return "برگزار شده";
  return "در حال ثبت‌نام";
}

function getActionLabel(status) {
  if (status === "registering") return "شرکت در این دوره";
  if (status === "ongoing") return "مشاهده اطلاعات دوره";
  return "مشاهده گزارش دوره";
}

function splitParagraphs(value, fallbackParagraphs = []) {
  const paragraphs = String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs.length ? paragraphs : fallbackParagraphs;
}

function normalizeItems(items, fallbackItems) {
  return Array.isArray(items) && items.length ? items : fallbackItems;
}

function getItemTitle(item, fallback = "عنوان") {
  return item.title || item.question || item.name || fallback;
}

function getItemDescription(item, fallback = "") {
  return (
    item.description || item.content || item.answer || item.role || fallback
  );
}

function createInitials(name) {
  return (
    String(name || "مدرس")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join(" ") || "م"
  );
}

function getCapacityLabel(capacity) {
  return capacity ? `${capacity} نفر` : "تعیین نشده";
}

function getRegistrationMessage(reason) {
  const messageMap = {
    created: "ثبت‌نام شما با موفقیت ثبت شد.",
    duplicate: "شما قبلاً برای این دوره ثبت‌نام کرده‌اید.",
    capacity_full: "ظرفیت این دوره تکمیل شده است.",
    login_required: "برای ثبت‌نام ابتدا وارد حساب کاربری شوید.",
    activity_not_found: "دوره موردنظر پیدا نشد.",
  };

  return messageMap[reason] || "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.";
}

function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get("preview") === "committee";
  const includePreview =
    isPreviewMode && isPreviewAllowedForInstructorActivity();

  const course = getPublicCourseById(courseId, { includePreview });
  const currentUser = getCurrentUser();

  const [openModule, setOpenModule] = useState(0);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [registrationVersion, setRegistrationVersion] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [courseId]);

  useEffect(() => {
    if (!registrationNotice) return undefined;
    const timer = window.setTimeout(() => setRegistrationNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [registrationNotice]);

  useEffect(() => {
    if (!course || !currentUser || isPreviewMode) {
      return;
    }

    if (!consumePendingActivityRegistrationForActivity(course)) {
      return;
    }

    const result = addActivityRegistration(course);
    setRegistrationNotice(getRegistrationMessage(result.reason));

    if (result.success) {
      setRegistrationVersion((current) => current + 1);
    }
  }, [course, currentUser, isPreviewMode]);

  const registrationStats = useMemo(
    () => getActivityRegistrationStats(course || {}),
    [course, registrationVersion],
  );
  const alreadyRegistered = course ? isRegisteredForActivity(course) : false;
  const canRegister =
    course?.status === "registering" &&
    !isPreviewMode &&
    !registrationStats.isFull;

  if (!course) {
    return <Navigate to="/courses/all" replace />;
  }

  const handleCourseRegistration = () => {
    if (!currentUser) {
      savePendingActivityRegistration(course, `/courses/${course.id}`);
      navigate("/auth");
      return;
    }

    const result = addActivityRegistration(course);

    setRegistrationNotice(getRegistrationMessage(result.reason));

    if (result.success) {
      setRegistrationVersion((current) => current + 1);
    }
  };

  const allCourses = getPublicCourseItems({ includePreview });
  const relatedCourses = allCourses
    .filter((item) => item.id !== course.id)
    .slice(0, 8);

  const statusLabel = getStatusLabel(course.status);
  const actionLabel = getActionLabel(course.status);
  const summaryParagraphs = splitParagraphs(course.summary, [
    "این دوره با هدف توسعه مهارت‌های کاربردی در حوزه مدیریت فناوری، توسعه پایدار و تجاری‌سازی دستاوردهای دانشگاهی طراحی شده است.",
    "شرکت‌کنندگان در طول دوره با تمرین‌های عملی، مطالعات موردی و پروژه‌های واقعی آشنا خواهند شد.",
  ]);
  const introParagraphs = splitParagraphs(course.introText, [
    "این دوره بر موضوعات کاربردی مدیریت سبز، بهینه‌سازی منابع، توسعه فناوری‌های دوستدار محیط زیست و طراحی راهکارهای قابل اجرا تمرکز دارد.",
    "شرکت‌کنندگان می‌آموزند چگونه یک مسئله واقعی را تحلیل کرده و برای آن برنامه‌ای مرحله‌بندی‌شده، قابل سنجش و اجرایی تدوین کنند.",
  ]);
  const courseAudiences = normalizeItems(course.audiences, [
    { title: "پژوهشگران" },
    { title: "دانشجویان" },
    { title: "مدیران" },
    { title: "فعالان فناوری" },
  ]);
  const learningOutcomes = normalizeItems(
    course.outcomes,
    defaultLearningOutcomes,
  );
  const courseModules = normalizeItems(course.modules, defaultCourseModules);
  const courseInstructors = normalizeItems(course.instructors, [
    { name: course.instructor, role: "مدرس دوره" },
  ]);
  const courseBenefits = normalizeItems(course.benefits, defaultCourseBenefits);
  const frequentlyAskedQuestions = normalizeItems(
    course.faqs,
    defaultFrequentlyAskedQuestions,
  );

  const courseMeta = [
    {
      id: 1,
      title: "مدت دوره",
      value: course.duration || "تعیین نشده",
      Icon: ClockIcon,
    },
    {
      id: 2,
      title: "تاریخ برگزاری",
      value: course.startDate || "تعیین نشده",
      Icon: CalendarIcon,
    },
    {
      id: 3,
      title: "نوع برگزاری",
      value: course.format || "تعیین نشده",
      Icon: LocationIcon,
    },
    {
      id: 4,
      title: "سطح دوره",
      value: course.level || "عمومی",
      Icon: LevelIcon,
    },
    {
      id: 5,
      title: "مدرس دوره",
      value: course.instructor || "مدرس هاتف",
      Icon: UsersIcon,
    },
  ];

  return (
    <div className="course-details-page">
      <section className="course-details-hero">
        <div className="course-details-page__container">
          <nav className="course-details__breadcrumb" aria-label="مسیر صفحه">
            <Link to="/">صفحه اصلی</Link>
            <span>/</span>
            <Link to="/courses/all">دوره‌های توانمندسازی</Link>
            <span>/</span>
            <span>{course.title}</span>
          </nav>

          <div className="course-details-hero__grid">
            <div className="course-details-hero__media">
              <img src={course.image} alt={course.title} />

              <div className="course-details-hero__badges">
                <span>{statusLabel}</span>
                <span>{course.startDate}</span>
              </div>
            </div>

            <div className="course-details-hero__content">
              <span className="course-details-hero__eyebrow">
                دوره تخصصی هاتف
              </span>

              <h1>{course.title}</h1>

              {summaryParagraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <a
                href="#course-registration"
                className="course-details-hero__button"
              >
                {actionLabel}
              </a>
            </div>
          </div>

          <div className="course-details-meta">
            {courseMeta.map(({ id, title, value, Icon }) => (
              <article className="course-details-meta__item" key={id}>
                <span className="course-details-meta__icon">
                  <Icon />
                </span>

                <div>
                  <h2>{title}</h2>
                  <p>{value}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="course-details-content">
        <div className="course-details-page__container">
          <div className="course-details-content__grid">
            <aside className="course-details-sidebar">
              <div
                className="course-registration-card"
                id="course-registration"
              >
                <div className="course-registration-card__header">
                  <span>{statusLabel}</span>
                  <span>ظرفیت محدود</span>
                </div>

                <h2>{course.title}</h2>

                <dl className="course-registration-card__details">
                  <div>
                    <dt>مدرس دوره:</dt>
                    <dd>{course.instructor}</dd>
                  </div>
                  <div>
                    <dt>مدت دوره:</dt>
                    <dd>{course.duration || "تعیین نشده"}</dd>
                  </div>
                  <div>
                    <dt>نوع دوره:</dt>
                    <dd>{course.format || "تعیین نشده"}</dd>
                  </div>
                  <div>
                    <dt>سطح دوره:</dt>
                    <dd>{course.level || "عمومی"}</dd>
                  </div>
                  <div>
                    <dt>تاریخ شروع:</dt>
                    <dd>{course.startDate || "تعیین نشده"}</dd>
                  </div>
                  <div>
                    <dt>محل برگزاری:</dt>
                    <dd>{course.location || "تعیین نشده"}</dd>
                  </div>
                </dl>

                <div className="course-registration-card__audience">
                  <h3>مناسب برای:</h3>

                  <div>
                    {courseAudiences.map((audience, index) => (
                      <span key={`${audience.title}-${index}`}>
                        <CheckIcon />
                        {audience.title}
                      </span>
                    ))}
                  </div>
                </div>

                {registrationNotice && (
                  <p
                    style={{
                      margin: "16px 0 0",
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "#f0fdf4",
                      color: "#166534",
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: 1.9,
                    }}
                  >
                    {registrationNotice}
                  </p>
                )}

                {course.status === "registering" && !isPreviewMode ? (
                  <button
                    type="button"
                    className="course-registration-card__button"
                    onClick={handleCourseRegistration}
                    disabled={!canRegister || alreadyRegistered}
                    style={{
                      border: 0,
                      width: "100%",
                      opacity: !canRegister || alreadyRegistered ? 0.55 : 1,
                      cursor:
                        !canRegister || alreadyRegistered
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {registrationStats.isFull
                      ? "ظرفیت تکمیل شده"
                      : alreadyRegistered
                        ? "قبلاً ثبت‌نام کرده‌اید"
                        : actionLabel}
                  </button>
                ) : (
                  <a
                    href="#course-registration"
                    className="course-registration-card__button"
                  >
                    {isPreviewMode
                      ? "پیش‌نمایش ثبت‌نام غیرفعال است"
                      : actionLabel}
                  </a>
                )}
              </div>

              <div className="course-details-share">
                <span>به اشتراک‌گذاری این دوره:</span>

                <div>
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href="#share-course"
                      aria-label={social.label}
                    >
                      <img src={social.icon} alt="" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <main className="course-details-article">
              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  معرفی دوره
                </span>
                <h2>{course.introTitle || "محورهای پژوهشی سال جاری"}</h2>
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>

              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  دستاوردهای آموزشی
                </span>
                <h2>در این دوره چه می‌آموزید؟</h2>

                <div className="course-learning-outcomes">
                  {learningOutcomes.map((outcome, index) => (
                    <article
                      className="course-learning-outcome"
                      key={`${getItemTitle(outcome)}-${index}`}
                    >
                      <span
                        className={`course-learning-outcome__icon ${
                          outcome.available === false
                            ? "course-learning-outcome__icon--unavailable"
                            : ""
                        }`}
                      >
                        <CheckIcon />
                      </span>

                      <div>
                        <h3>{getItemTitle(outcome, "دستاورد آموزشی")}</h3>
                        <p>{getItemDescription(outcome)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  برنامه آموزشی
                </span>
                <h2>سرفصل‌های دوره</h2>

                <div className="course-modules">
                  {courseModules.map((module, index) => {
                    const isOpen = openModule === index;

                    return (
                      <article
                        className={`course-module ${isOpen ? "course-module--open" : ""}`}
                        key={`${getItemTitle(module)}-${index}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenModule(isOpen ? null : index)}
                          aria-expanded={isOpen}
                        >
                          <span>{getItemTitle(module, "سرفصل دوره")}</span>
                          <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                        </button>

                        <div className="course-module__content">
                          <p>{getItemDescription(module)}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  تیم آموزشی
                </span>
                <h2>مدرسان دوره</h2>

                <div className="course-instructors">
                  {courseInstructors.map((instructor, index) => (
                    <article
                      className="course-instructor"
                      key={`${instructor.name}-${index}`}
                    >
                      <span className="course-instructor__avatar">
                        {createInitials(instructor.name)}
                      </span>

                      <div>
                        <h3>{instructor.name || course.instructor}</h3>
                        <p>{instructor.role || "مدرس دوره"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  مزایای شرکت
                </span>
                <h2>چرا این دوره؟</h2>

                <div className="course-benefits">
                  {courseBenefits.map((benefit, index) => (
                    <article
                      className="course-benefit"
                      key={`${getItemTitle(benefit)}-${index}`}
                    >
                      <span>
                        <CheckIcon />
                      </span>
                      <h3>{getItemTitle(benefit, "مزیت دوره")}</h3>
                      <p>{getItemDescription(benefit)}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="course-content-section">
                <span className="course-content-section__eyebrow">
                  سوالات متداول
                </span>
                <h2>پرسش‌های رایج درباره دوره</h2>

                <div className="course-faq">
                  {frequentlyAskedQuestions.map((question, index) => {
                    const isOpen = openQuestion === index;

                    return (
                      <article
                        className={`course-faq__item ${isOpen ? "course-faq__item--open" : ""}`}
                        key={`${getItemTitle(question)}-${index}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenQuestion(isOpen ? null : index)}
                          aria-expanded={isOpen}
                        >
                          <span>{getItemTitle(question, "سوال متداول")}</span>
                          <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                        </button>

                        <div className="course-faq__answer">
                          <p>{getItemDescription(question, "پاسخ سوال")}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>
          </div>
        </div>
      </section>

      <section className="course-related-section">
        <div className="course-details-page__container">
          <ActivitiesCarousel
            title="دوره‌های دیگر هاتف"
            items={relatedCourses}
            viewAllPath="/courses/all"
            viewAllLabel="همه دوره‌ها"
          />
        </div>
      </section>

      <ExpandableArticle
        title="درباره دوره‌های هاتف"
        paragraphs={articleParagraphs}
      />
    </div>
  );
}

export default CourseDetailsPage;
