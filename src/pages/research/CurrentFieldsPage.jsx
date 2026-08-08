import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";

import { getCalls, getPublishedCalls } from "../../services/callService";
import { CALL_STATUS, CALL_STATUS_LABELS } from "../../constants/statuses";

import Button from "../../components/ui/Button/Button";

import "./CurrentFieldsPage.css";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const CURRENT_AXIS_KEYWORDS = [
  "سال جاری",
  "هوش مصنوعی",
  "داده",
  "سلامت دیجیتال",
  "فناوری دیجیتال",
];

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function getCallPath(call) {
  return `/research-support/calls/${call.id}`;
}

function getCallImage(call) {
  return call.image || call.coverImage || call.bannerImage || bannerImage;
}

function getCallCategory(call) {
  return call.field ? `با محوریت ${call.field}` : "فراخوان برنامه هاتف";
}

function getCallDeadline(call) {
  if (!call.deadlineDate && !call.deadlineTime) {
    return "مهلت ارسال مشخص نشده است";
  }

  if (call.deadlineDate && call.deadlineTime) {
    return `مهلت تا: ${call.deadlineDate} ساعت ${call.deadlineTime}`;
  }

  return `مهلت تا: ${call.deadlineDate || call.deadlineTime}`;
}

function getCallStatusLabel(call) {
  if (call.status === CALL_STATUS.PUBLISHED) {
    return "در حال دریافت طرح";
  }

  return CALL_STATUS_LABELS[call.status] || call.statusLabel || "وضعیت نامشخص";
}

function getCallDescription(call) {
  return (
    call.description ||
    call.summary ||
    call.moreDescription ||
    "این فراخوان در راستای محورهای پژوهشی و فناورانه برنامه هاتف منتشر شده است."
  );
}

function getCallTimeValue(call) {
  const possibleDateValues = [
    call.publishedAt,
    call.updatedAt,
    call.createdAt,
    call.startDate,
    call.deadlineDate,
  ];

  for (const value of possibleDateValues) {
    const time = Date.parse(value);

    if (!Number.isNaN(time)) {
      return time;
    }
  }

  return 0;
}

function sortCallsNewestFirst(calls) {
  return [...calls].sort((firstCall, secondCall) => {
    return getCallTimeValue(secondCall) - getCallTimeValue(firstCall);
  });
}

function hasCurrentYearFlag(call) {
  return Boolean(
    call.isCurrentYear ||
    call.isCurrentYearField ||
    call.isCurrentField ||
    call.currentYear ||
    call.currentField ||
    call.showInCurrentFields ||
    call.isCurrentSupportPlan ||
    call.isFeatured ||
    call.featured ||
    call.currentAxis ||
    call.isAnnualPriority,
  );
}

function hasCurrentAxisKeyword(call) {
  const searchableText = [
    call.title,
    call.field,
    call.category,
    call.description,
    call.summary,
  ]
    .filter(Boolean)
    .join(" ");

  return CURRENT_AXIS_KEYWORDS.some((keyword) =>
    searchableText.includes(keyword),
  );
}

function getCurrentAxisCalls(calls) {
  const flaggedCalls = calls.filter(hasCurrentYearFlag);

  if (flaggedCalls.length > 0) {
    return sortCallsNewestFirst(flaggedCalls);
  }

  const keywordCalls = calls.filter(hasCurrentAxisKeyword);

  if (keywordCalls.length > 0) {
    return sortCallsNewestFirst(keywordCalls);
  }

  return sortCallsNewestFirst(calls).slice(0, 1);
}

function getPreviousAxisCalls(calls, currentAxisCalls) {
  const currentCallIds = new Set(currentAxisCalls.map((call) => call.id));

  return sortCallsNewestFirst(calls).filter(
    (call) => !currentCallIds.has(call.id),
  );
}

function getCurrentAxisTitle(currentAxisCalls) {
  const firstCall = currentAxisCalls[0];

  if (!firstCall) {
    return "محور سال جاری";
  }

  return firstCall.field || firstCall.category || "محور سال جاری";
}

function SectionHeading({ title, warning = false }) {
  return (
    <div className="current-fields-page__subheading">
      <div className="current-fields-page__subheading-label">
        <span
          className={`current-fields-page__subheading-dot ${
            warning ? "current-fields-page__subheading-dot--warning" : ""
          }`}
        />

        <h2>{title}</h2>
      </div>

      <span className="current-fields-page__subheading-line" />
    </div>
  );
}

function AxisCallCard({ call, index, compact = false }) {
  const callPath = getCallPath(call);
  const callStatusLabel = getCallStatusLabel(call);

  const isClosed =
    call.status === CALL_STATUS.CLOSED ||
    call.status === "closed" ||
    callStatusLabel.includes("آرشیو") ||
    callStatusLabel.includes("پایان");

  return (
    <article
      className={`current-fields-page__call ${
        compact ? "current-fields-page__call--compact" : ""
      }`}
    >
      <Link to={callPath} className="current-fields-page__call-media">
        <img src={getCallImage(call)} alt={call.title} />

        <div className="current-fields-page__call-overlay">
          <div className="current-fields-page__call-overlay-content">
            <h3>{call.title}</h3>

            <p>{getCallDescription(call)}</p>

            <span>مشاهده جزئیات</span>
          </div>
        </div>

        <span
          className={`current-fields-page__call-badge ${
            isClosed
              ? "current-fields-page__call-badge--closed"
              : "current-fields-page__call-badge--active"
          }`}
        >
          {callStatusLabel}
        </span>

        <span className="current-fields-page__call-deadline">
          {getCallDeadline(call)}
        </span>
      </Link>

      <div className="current-fields-page__call-info">
        <div className="current-fields-page__call-title">
          <span className="current-fields-page__call-number">
            {toPersianNumber(index + 1)}
          </span>

          <Link to={callPath}>{call.title}</Link>

          <span className="current-fields-page__call-category">
            {getCallCategory(call)}
          </span>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ children }) {
  return <p className="current-fields-page__empty">{children}</p>;
}

function CurrentFieldsPage() {
  const allCalls = sortCallsNewestFirst(getCalls());
  const publishedCalls = sortCallsNewestFirst(getPublishedCalls());
  const visibleCalls = publishedCalls.length > 0 ? publishedCalls : allCalls;

  const currentAxisCalls = getCurrentAxisCalls(visibleCalls);
  const previousAxisCalls = getPreviousAxisCalls(
    visibleCalls,
    currentAxisCalls,
  );
  const currentAxisTitle = getCurrentAxisTitle(currentAxisCalls);

  return (
    <main className="current-fields-page">
      <section className="current-fields-page__hero">
        <img src={bannerImage} alt="" aria-hidden="true" />

        <div className="current-fields-page__hero-overlay" />

        <div className="current-fields-page__container current-fields-page__hero-inner">
          <div className="current-fields-page__hero-content">
            <span className="current-fields-page__eyebrow">
              محورهای پژوهشی و فناورانه
            </span>

            <h1>محورهای سال جاری</h1>

            <p>
              در این صفحه، فراخوان‌های مرتبط با محور سال جاری و همچنین محورهای
              سال‌های گذشته برنامه هاتف نمایش داده می‌شوند.
            </p>

            <div className="current-fields-page__hero-actions">
              <Button href="#current-year-axis" variant="inverse" size="md" className="current-fields-page__hero-action">
                مشاهده محور سال جاری
              </Button>
              <Button href="#previous-year-axis" variant="inverse" size="md" className="current-fields-page__hero-action">
                محورهای سال‌های گذشته
              </Button>
            </div>
          </div>

          <div className="current-fields-page__hero-stats">
            <div>
              <strong>{toPersianNumber(currentAxisCalls.length)}</strong>
              <span>فراخوان محور امسال</span>
            </div>

            <div>
              <strong>{toPersianNumber(previousAxisCalls.length)}</strong>
              <span>فراخوان سال‌های گذشته</span>
            </div>

            <div>
              <strong>{toPersianNumber(visibleCalls.length)}</strong>
              <span>کل فراخوان‌ها</span>
            </div>
          </div>
        </div>
      </section>

      <section className="current-fields-page__section" id="current-year-axis">
        <div className="current-fields-page__container">
          <SectionHeading
            title={`فراخوان‌های محور امسال: ${currentAxisTitle}`}
          />

          {currentAxisCalls.length > 0 ? (
            <div className="current-fields-page__current-list">
              {currentAxisCalls.map((call, index) => (
                <AxisCallCard key={call.id} call={call} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState>
              هنوز فراخوانی برای محور سال جاری ثبت یا منتشر نشده است.
            </EmptyState>
          )}
        </div>
      </section>

      <section
        className="current-fields-page__section current-fields-page__section--previous"
        id="previous-year-axis"
      >
        <div className="current-fields-page__container">
          <SectionHeading title="محورهای سال‌های گذشته" warning />

          {previousAxisCalls.length > 0 ? (
            <div className="current-fields-page__previous-list">
              {previousAxisCalls.map((call, index) => (
                <AxisCallCard key={call.id} call={call} index={index} compact />
              ))}
            </div>
          ) : (
            <EmptyState>
              هنوز فراخوانی برای محورهای سال‌های گذشته ثبت نشده است.
            </EmptyState>
          )}
        </div>
      </section>

      <section className="current-fields-page__article">
        <div className="current-fields-page__container">
          <div className="current-fields-page__article-card">
            <div className="current-fields-page__article-heading">
              <span>درباره انتخاب محورها</span>
              <h2>تمرکز بر نیازهای واقعی، اولویت‌های فناورانه و ظرفیت اجرا</h2>
            </div>

            <div className="current-fields-page__article-content">
              <p>
                محورهای سال جاری برنامه هاتف با هدف تمرکز حمایت‌ها بر نیازهای
                واقعی جامعه، صنعت و زیست‌بوم فناوری انتخاب می‌شوند. طرح‌های
                ارسالی باید با این محورها هم‌راستا باشند و ظرفیت تبدیل شدن به
                محصول، خدمت یا راهکار کاربردی را داشته باشند.
              </p>

              <p>
                محورهای سال‌های گذشته نیز در این صفحه نگهداری می‌شوند تا مسیر
                اولویت‌گذاری، تغییر نیازها و روند توسعه فناوری در دوره‌های مختلف
                قابل مشاهده باشد.
              </p>
            </div>

            <Button
              to="/research-support/calls"
              variant="outline"
              size="md"
              className="current-fields-page__article-button"
            >
              مشاهده همه فراخوان‌ها
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CurrentFieldsPage;
