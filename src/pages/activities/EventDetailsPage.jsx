import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import Badge from "../../components/ui/Badge/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Button from "../../components/ui/Button/Button";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";
import ExpandableArticle from "../../components/activities/ExpandableArticle";

import {
  getPublicCourseItems,
  getPublicEventById,
  getPublicEventItems,
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

import "./EventDetailsPage.css";

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
        r="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
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

function PresentationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 20l4-4 4 4M12 16v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
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

const defaultEventHighlights = [
  {
    id: 1,
    title: "ارائه تجربه‌های موفق",
    description:
      "آشنایی با تجربه‌های واقعی پژوهشگران، مدیران و مجموعه‌های فناور.",
  },
  {
    id: 2,
    title: "ارتباط با متخصصان",
    description:
      "فرصتی برای ارتباط مستقیم با سخنرانان، پژوهشگران و فعالان صنعت.",
  },
  {
    id: 3,
    title: "شبکه‌سازی حرفه‌ای",
    description:
      "ایجاد ارتباط میان دانشگاه، شرکت‌های دانش‌بنیان و سرمایه‌گذاران.",
  },
  {
    id: 4,
    title: "دسترسی به محتوای تخصصی",
    description: "دریافت محتوای علمی و کاربردی متناسب با نیازهای حوزه فناوری.",
  },
];

const defaultEventAgenda = [
  {
    id: 1,
    time: "۰۸:۳۰",
    title: "پذیرش و ثبت‌نام شرکت‌کنندگان",
    description: "تحویل کارت ورود، بسته رویداد و راهنمای حضور در برنامه‌ها.",
  },
  {
    id: 2,
    time: "۰۹:۰۰",
    title: "افتتاحیه و معرفی برنامه هاتف",
    description: "معرفی اهداف رویداد، محورهای اصلی و فرصت‌های همکاری.",
  },
  {
    id: 3,
    time: "۱۰:۳۰",
    title: "پنل تخصصی دانشگاه و صنعت",
    description: "گفت‌وگوی مدیران و پژوهشگران درباره تجاری‌سازی فناوری.",
  },
];

const defaultEventSpeakers = [
  {
    id: 1,
    initials: "م س",
    name: "مهدیه سیفی",
    role: "عضو کمیته راهبری هاتف",
    organization: "دانشگاه تهران",
  },
  {
    id: 2,
    initials: "ع ر",
    name: "علی رضایی",
    role: "مدیر توسعه فناوری",
    organization: "مرکز نوآوری دانشگاه تهران",
  },
];

const defaultEventQuestions = [
  {
    id: 1,
    title: "شرکت در رویداد برای چه افرادی مناسب است؟",
    content:
      "پژوهشگران، دانشجویان، مدیران، صاحبان ایده، شرکت‌های دانش‌بنیان و فعالان حوزه فناوری می‌توانند در رویداد شرکت کنند.",
  },
  {
    id: 2,
    title: "آیا شرکت در رویداد نیازمند ثبت‌نام قبلی است؟",
    content:
      "بله، به‌دلیل محدودیت ظرفیت، ثبت‌نام اولیه از طریق سامانه ضروری است.",
  },
  {
    id: 3,
    title: "آیا برای شرکت‌کنندگان گواهی صادر می‌شود؟",
    content:
      "برای افرادی که حضور کامل و تأییدشده در برنامه داشته باشند، گواهی حضور صادر خواهد شد.",
  },
];

const articleParagraphs = [
  "رویدادهای برنامه هاتف بستری برای معرفی توانمندی‌های علمی، پژوهشی و فناورانه دانشگاه و ایجاد ارتباط مؤثر با صنعت فراهم می‌کنند.",
  "در این رویدادها، پژوهشگران و صاحبان ایده می‌توانند دستاوردهای خود را معرفی کرده و از تجربه متخصصان، مدیران و سرمایه‌گذاران استفاده کنند.",
  "هدف اصلی این برنامه‌ها تسهیل همکاری‌های مشترک، توسعه محصولات فناورانه و تبدیل یافته‌های دانشگاهی به راهکارهای قابل استفاده در جامعه و صنعت است.",
];

const socialLinks = [
  { id: 1, label: "فیسبوک", icon: facebookIcon },
  { id: 2, label: "واتساپ", icon: whatsappIcon },
  { id: 3, label: "توییتر", icon: twitterIcon },
  { id: 4, label: "اینستاگرام", icon: instagramIcon },
  { id: 5, label: "تلگرام", icon: telegramIcon },
];

function getStatusLabel(status) {
  if (status === "registering") return "ثبت‌نام فعال";
  if (status === "ongoing") return "در حال برگزاری";
  return "برگزار شده";
}

function getActionLabel(status) {
  if (status === "registering") return "ثبت‌نام در رویداد";
  if (status === "ongoing") return "مشاهده اطلاعات رویداد";
  return "مشاهده گزارش رویداد";
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
    String(name || "سخنران")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join(" ") || "س"
  );
}

function getCapacityLabel(capacity) {
  return capacity ? `${capacity} نفر` : "تعیین نشده";
}

function getTimeRange(eventItem) {
  const startTime = eventItem.startTime || "";
  const endTime = eventItem.endTime || "";

  if (startTime && endTime) {
    return `${startTime} تا ${endTime}`;
  }

  return startTime || endTime || "تعیین نشده";
}

function getRegistrationMessage(reason) {
  const messageMap = {
    created: "ثبت‌نام شما با موفقیت ثبت شد.",
    duplicate: "شما قبلاً برای این رویداد ثبت‌نام کرده‌اید.",
    capacity_full: "ظرفیت این رویداد تکمیل شده است.",
    login_required: "برای ثبت‌نام ابتدا وارد حساب کاربری شوید.",
    activity_not_found: "رویداد موردنظر پیدا نشد.",
  };

  return messageMap[reason] || "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.";
}

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get("preview") === "committee";
  const includePreview =
    isPreviewMode && isPreviewAllowedForInstructorActivity();

  const eventItem = getPublicEventById(eventId, { includePreview });
  const currentUser = getCurrentUser();
  const [openQuestion, setOpenQuestion] = useState(null);
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [registrationVersion, setRegistrationVersion] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [eventId]);

  useEffect(() => {
    if (!registrationNotice) return undefined;
    const timer = window.setTimeout(() => setRegistrationNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [registrationNotice]);

  useEffect(() => {
    if (!eventItem || !currentUser || isPreviewMode) {
      return;
    }

    if (!consumePendingActivityRegistrationForActivity(eventItem)) {
      return;
    }

    const result = addActivityRegistration(eventItem);
    setRegistrationNotice(getRegistrationMessage(result.reason));

    if (result.success) {
      setRegistrationVersion((current) => current + 1);
    }
  }, [eventItem, currentUser, isPreviewMode]);

  const registrationStats = useMemo(
    () => getActivityRegistrationStats(eventItem || {}),
    [eventItem, registrationVersion],
  );
  const alreadyRegistered = eventItem
    ? isRegisteredForActivity(eventItem)
    : false;
  const canRegister =
    eventItem?.status === "registering" &&
    !isPreviewMode &&
    !registrationStats.isFull;

  if (!eventItem) {
    return <Navigate to="/events/all" replace />;
  }

  const handleEventRegistration = () => {
    if (!currentUser) {
      savePendingActivityRegistration(eventItem, `/events/${eventItem.id}`);
      navigate("/auth");
      return;
    }

    const result = addActivityRegistration(eventItem);

    setRegistrationNotice(getRegistrationMessage(result.reason));

    if (result.success) {
      setRegistrationVersion((current) => current + 1);
    }
  };

  const allEvents = getPublicEventItems({ includePreview });
  const relatedEvents = allEvents
    .filter((item) => item.id !== eventItem.id)
    .slice(0, 8);
  const relatedCourses = getPublicCourseItems({ includePreview }).slice(0, 8);

  const statusLabel = getStatusLabel(eventItem.status);
  const actionLabel = getActionLabel(eventItem.status);
  const summaryParagraphs = splitParagraphs(eventItem.summary, [
    "این رویداد با هدف ایجاد ارتباط میان پژوهشگران، صاحبان ایده، مدیران فناوری و فعالان صنعت برگزار می‌شود.",
    "شرکت‌کنندگان می‌توانند با تازه‌ترین دستاوردهای پژوهشی آشنا شوند و فرصت‌های همکاری جدیدی ایجاد کنند.",
  ]);
  const introParagraphs = splitParagraphs(eventItem.introText, [
    "این رویداد بر توسعه فناوری‌های نوآورانه، تجاری‌سازی دستاوردهای دانشگاهی و ایجاد همکاری میان پژوهشگران و صنعت تمرکز دارد.",
    "شرکت‌کنندگان می‌توانند طرح‌ها و توانمندی‌های خود را معرفی کرده و از تجربه مدیران، متخصصان و سرمایه‌گذاران بهره‌مند شوند.",
  ]);
  const eventAudiences = normalizeItems(eventItem.audiences, [
    { title: "پژوهشگران" },
    { title: "دانشجویان" },
    { title: "مدیران" },
    { title: "فعالان صنعت" },
  ]);
  const eventHighlights = normalizeItems(
    eventItem.highlights,
    defaultEventHighlights,
  );
  const eventAgenda = normalizeItems(eventItem.agenda, defaultEventAgenda);
  const eventSpeakers = normalizeItems(
    eventItem.speakers,
    defaultEventSpeakers,
  );
  const eventQuestions = normalizeItems(eventItem.faqs, defaultEventQuestions);

  const eventMeta = [
    {
      id: 1,
      title: "مدت رویداد",
      value: eventItem.duration || "تعیین نشده",
      Icon: ClockIcon,
    },
    {
      id: 2,
      title: "تاریخ برگزاری",
      value: eventItem.eventDate || eventItem.startDate || "تعیین نشده",
      Icon: CalendarIcon,
    },
    {
      id: 3,
      title: "نوع برگزاری",
      value: eventItem.format || "تعیین نشده",
      Icon: PresentationIcon,
    },
    {
      id: 4,
      title: "محل برگزاری",
      value: eventItem.location || "تعیین نشده",
      Icon: LocationIcon,
    },
    {
      id: 5,
      title: "دبیر رویداد",
      value: eventItem.secretaryName || eventItem.instructor || "دبیر رویداد",
      Icon: UsersIcon,
    },
  ];

  return (
    <div className="event-details-page">
      <section className="event-details-hero">
        <div className="event-details-page__container">
          <Breadcrumb
            className="event-details__breadcrumb"
            items={[
              { label: "صفحه اصلی", to: "/" },
              { label: "رویدادهای هاتف", to: "/events/all" },
              { label: eventItem.title },
            ]}
          />

          <div className="event-details-hero__grid">
            <div className="event-details-hero__media">
              <img src={eventItem.image} alt={eventItem.title} />

              <div className="event-details-hero__badges">
                <Badge tone="success">{statusLabel}</Badge>
                <Badge tone="brand">
                  {eventItem.eventDate || eventItem.startDate}
                </Badge>
              </div>
            </div>

            <div className="event-details-hero__content">
              <Badge tone="info" className="event-details-hero__eyebrow">
                رویداد تخصصی هاتف
              </Badge>

              <h1>{eventItem.title}</h1>

              {summaryParagraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <Button
                href="#event-registration"
                variant="primary"
                size="md"
                width="wide"
                className="event-details-hero__button"
              >
                {actionLabel}
              </Button>
            </div>
          </div>

          <div className="event-details-meta">
            {eventMeta.map(({ id, title, value, Icon }) => (
              <article className="event-details-meta__item" key={id}>
                <span className="event-details-meta__icon">
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

      <section className="event-details-content">
        <div className="event-details-page__container">
          <div className="event-details-content__grid">
            <aside className="event-details-sidebar">
              <div className="event-registration-card" id="event-registration">
                <div className="event-registration-card__header">
                  <Badge tone="success">{statusLabel}</Badge>
                  <Badge tone="warning">ظرفیت محدود</Badge>
                </div>

                <h2>{eventItem.title}</h2>

                <dl className="event-registration-card__details">
                  <div>
                    <dt>دبیر رویداد:</dt>
                    <dd>{eventItem.secretaryName || eventItem.instructor}</dd>
                  </div>
                  <div>
                    <dt>برگزارکننده:</dt>
                    <dd>{eventItem.organizer}</dd>
                  </div>
                  <div>
                    <dt>تاریخ برگزاری:</dt>
                    <dd>{eventItem.eventDate || eventItem.startDate}</dd>
                  </div>
                  <div>
                    <dt>ساعت برگزاری:</dt>
                    <dd>{getTimeRange(eventItem)}</dd>
                  </div>
                  <div>
                    <dt>نوع برگزاری:</dt>
                    <dd>{eventItem.format || "تعیین نشده"}</dd>
                  </div>
                  <div>
                    <dt>محل برگزاری:</dt>
                    <dd>{eventItem.location || "تعیین نشده"}</dd>
                  </div>
                </dl>

                <div className="event-registration-card__audience">
                  <h3>مناسب برای:</h3>
                  <div>
                    {eventAudiences.map((audience, index) => (
                      <span key={`${audience.title}-${index}`}>
                        <CheckIcon />
                        {audience.title}
                      </span>
                    ))}
                  </div>
                </div>

                {registrationNotice && (
                  <p className="event-registration-card__notice" role="status">
                    {registrationNotice}
                  </p>
                )}

                {eventItem.status === "registering" && !isPreviewMode ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    fullWidth
                    className="event-registration-card__button"
                    onClick={handleEventRegistration}
                    disabled={!canRegister || alreadyRegistered}
                  >
                    {registrationStats.isFull
                      ? "ظرفیت تکمیل شده"
                      : alreadyRegistered
                        ? "قبلاً ثبت‌نام کرده‌اید"
                        : actionLabel}
                  </Button>
                ) : (
                  <Button
                    href="#event-registration"
                    variant="outline"
                    size="md"
                    fullWidth
                    className="event-registration-card__button"
                  >
                    {isPreviewMode
                      ? "پیش‌نمایش ثبت‌نام غیرفعال است"
                      : actionLabel}
                  </Button>
                )}
              </div>

              <div className="event-details-share">
                <span>به اشتراک‌گذاری این رویداد:</span>
                <div>
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href="#share-event"
                      aria-label={social.label}
                    >
                      <img src={social.icon} alt="" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <main className="event-details-article">
              <section className="event-content-section">
                <SectionHeader
                  eyebrow="معرفی رویداد"
                  title={eventItem.introTitle || "محورهای پژوهشی سال جاری"}
                  variant="subsection"
                  className="event-content-section__heading"
                />
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>

              <section className="event-content-section">
                <SectionHeader
                  eyebrow="مزایای حضور"
                  title="چرا در این رویداد شرکت کنیم؟"
                  variant="subsection"
                  className="event-content-section__heading"
                />
                <div className="event-highlights">
                  {eventHighlights.map((highlight, index) => (
                    <article
                      className="event-highlight"
                      key={`${getItemTitle(highlight)}-${index}`}
                    >
                      <span>
                        <CheckIcon />
                      </span>
                      <div>
                        <h3>{getItemTitle(highlight, "مزیت حضور")}</h3>
                        <p>{getItemDescription(highlight)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <SectionHeader
                  eyebrow="برنامه رویداد"
                  title="جدول زمان‌بندی برنامه‌ها"
                  variant="subsection"
                  className="event-content-section__heading"
                />
                <div className="event-agenda">
                  {eventAgenda.map((agenda, index) => (
                    <article
                      className="event-agenda__item"
                      key={`${getItemTitle(agenda)}-${index}`}
                    >
                      <time>{agenda.time || "--:--"}</time>
                      <span className="event-agenda__marker" />
                      <div>
                        <h3>{getItemTitle(agenda, "عنوان برنامه")}</h3>
                        <p>{getItemDescription(agenda)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <SectionHeader
                  eyebrow="تیم علمی رویداد"
                  title="سخنرانان و اعضای پنل"
                  variant="subsection"
                  className="event-content-section__heading"
                />
                <div className="event-speakers">
                  {eventSpeakers.map((speaker, index) => (
                    <article
                      className="event-speaker"
                      key={`${speaker.name}-${index}`}
                    >
                      <span className="event-speaker__avatar">
                        {speaker.initials || createInitials(speaker.name)}
                      </span>
                      <div>
                        <h3>{speaker.name || "سخنران رویداد"}</h3>
                        <p>{speaker.role || "سخنران"}</p>
                        <span>
                          {speaker.organization || eventItem.organizer}
                        </span>
                        <a href="#speaker-profile">مشاهده صفحه در دانشگاه</a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="event-content-section">
                <SectionHeader
                  eyebrow="راهنمای حضور"
                  title="پرسش‌های متداول رویداد"
                  variant="subsection"
                  className="event-content-section__heading"
                />
                <div className="event-faq">
                  {eventQuestions.map((question, index) => {
                    const isOpen = openQuestion === index;
                    return (
                      <article
                        className={`event-faq__item ${isOpen ? "event-faq__item--open" : ""}`}
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
                        <div className="event-faq__answer">
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

      <section className="event-related-section">
        <div className="event-details-page__container">
          <ActivitiesCarousel
            title="رویدادهای دیگر"
            items={relatedEvents}
            viewAllPath="/events/all"
            viewAllLabel="همه رویدادها"
          />
        </div>
      </section>

      <section className="event-related-section event-related-section--courses">
        <div className="event-details-page__container">
          <ActivitiesCarousel
            title="دیگر دوره‌های هاتف"
            items={relatedCourses}
            viewAllPath="/courses/all"
            viewAllLabel="همه دوره‌ها"
          />
        </div>
      </section>

      <ExpandableArticle
        title="درباره رویدادهای تخصصی هاتف"
        paragraphs={articleParagraphs}
      />
    </div>
  );
}

export default EventDetailsPage;
