import { useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";

import { getCalls, getPublishedCalls } from "../../services/callService";
import { CALL_STATUS, CALL_STATUS_LABELS } from "../../constants/statuses";

import "./CallsPage.css";

const articleParagraphs = [
  "فراخوان‌های برنامه هاتف با هدف شناسایی، ارزیابی و حمایت از طرح‌های پژوهشی و فناورانه طراحی شده‌اند. این فراخوان‌ها فرصتی فراهم می‌کنند تا پژوهشگران، تیم‌های فناور و صاحبان ایده بتوانند طرح‌های خود را در مسیر توسعه، راهبری، ارزیابی و تجاری‌سازی قرار دهند.",
  "در هر فراخوان، محورهای اولویت‌دار، شرایط شرکت، مدارک موردنیاز، زمان‌بندی ارسال طرح و شیوه بررسی مشخص می‌شود. متقاضیان می‌توانند با مطالعه دقیق اطلاعات هر فراخوان، طرح خود را آماده کرده و در بازه اعلام‌شده ارسال کنند.",
  "طرح‌هایی که از نظر نوآوری، قابلیت اجرا، ظرفیت توسعه و ارتباط با نیازهای واقعی جامعه یا صنعت امتیاز مناسبی دریافت کنند، وارد مراحل بعدی بررسی و حمایت می‌شوند. این مسیر می‌تواند شامل داوری تخصصی، مشاوره، راهبری فناوری و اتصال به فرصت‌های همکاری باشد.",
  "برنامه هاتف تلاش می‌کند ارتباط میان دانشگاه، پژوهشگران، صنعت و نهادهای حمایتی را تقویت کند. به همین دلیل، فراخوان‌ها فقط یک اطلاعیه ساده نیستند؛ بلکه نقطه شروع یک مسیر هدفمند برای رشد فناوری و تبدیل دستاوردهای پژوهشی به راهکارهای کاربردی محسوب می‌شوند.",
];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
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
    return "در حال دریافت طرح‌ها";
  }

  return CALL_STATUS_LABELS[call.status] || "وضعیت نامشخص";
}

function mapCallForCard(call, index) {
  return {
    ...call,
    number: toPersianNumber(index + 1),
    category: getCallCategory(call),
    deadline: getCallDeadline(call),
    statusLabel: getCallStatusLabel(call),
  };
}

function CallsSubheading({ title, warning = false, showLine = true }) {
  return (
    <div className="calls-page__subheading">
      <div className="calls-page__subheading-label">
        <span
          className={`calls-page__subheading-dot ${
            warning ? "calls-page__subheading-dot--warning" : ""
          }`}
        />

        <h2>{title}</h2>
      </div>

      {showLine && <span className="calls-page__subheading-line" />}
    </div>
  );
}

function CallCard({ call, isActive = false }) {
  return (
    <article
      className={`calls-page__call ${
        isActive ? "calls-page__call--active" : ""
      }`}
    >
      <div className="calls-page__call-info">
        <div className="calls-page__call-title">
          <span className="calls-page__call-number">{call.number}</span>

          <Link to={`/research-support/calls/${call.id}`}>{call.title}</Link>

          <span className="calls-page__call-category">{call.category}</span>
        </div>
      </div>

      <Link
        to={`/research-support/calls/${call.id}`}
        className="calls-page__call-media"
      >
        <img src={bannerImage} alt={call.title} />

        <div className="calls-page__call-overlay">
          <div className="calls-page__call-overlay-content">
            <h3>{call.title}</h3>

            <p>
              مشاهده جزئیات فراخوان، محورهای برنامه، شرایط شرکت، زمان‌بندی و
              مدارک موردنیاز
            </p>

            <span>مشاهده جزئیات</span>
          </div>
        </div>

        <div
          className={`calls-page__call-badge ${
            isActive
              ? "calls-page__call-badge--active"
              : "calls-page__call-badge--closed"
          }`}
        >
          {call.statusLabel}
        </div>

        <div className="calls-page__call-deadline">{call.deadline}</div>
      </Link>
    </article>
  );
}

function CallsArticle() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="calls-page__article">
      <div className="calls-page__container">
        <div className="calls-page__article-card">
          <div className="calls-page__article-heading">
            <span>درباره فراخوان‌ها</span>
            <h2>فراخوان‌های برنامه هاتف چگونه عمل می‌کنند؟</h2>
          </div>

          <div
            className={`calls-page__article-content ${
              isExpanded
                ? "calls-page__article-content--expanded"
                : "calls-page__article-content--collapsed"
            }`}
          >
            {articleParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <button
            type="button"
            className="calls-page__article-button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "بستن مطلب" : "مطالعه کامل مطلب"}

            <span
              className={`calls-page__article-arrow ${
                isExpanded ? "calls-page__article-arrow--open" : ""
              }`}
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function CallsPage() {
  const [visiblePreviousCount, setVisiblePreviousCount] = useState(2);

  const allCalls = getCalls();

  const activeCalls = getPublishedCalls().map((call, index) =>
    mapCallForCard(call, index),
  );

  const previousCalls = allCalls
    .filter((call) => call.status !== CALL_STATUS.PUBLISHED)
    .map((call, index) => mapCallForCard(call, index));

  const visiblePreviousCalls = previousCalls.slice(0, visiblePreviousCount);
  const hasMorePreviousCalls = visiblePreviousCount < previousCalls.length;

  const handleShowMore = () => {
    setVisiblePreviousCount((current) =>
      Math.min(current + 2, previousCalls.length),
    );
  };

  return (
    <main className="calls-page">
      <section className="calls-page__hero">
        <img src={bannerImage} alt="" aria-hidden="true" />

        <div className="calls-page__hero-overlay" />

        <div className="calls-page__container calls-page__hero-inner">
          <div className="calls-page__hero-content">
            <span className="calls-page__eyebrow">حمایت پژوهشی هاتف</span>

            <h1>فراخوان‌های برنامه هاتف</h1>

            <p>
              مسیر اطلاع‌رسانی، ثبت‌نام و بررسی طرح‌های پژوهشی و فناورانه در
              برنامه هاتف؛ از فراخوان فعال تا دوره‌های پیشین و جزئیات هر برنامه.
            </p>

            <div className="calls-page__hero-actions">
              <a href="#active-calls">فراخوان‌های فعال</a>
              <a href="#previous-calls">دوره‌های پیشین</a>
            </div>
          </div>

          <div className="calls-page__hero-stats">
            <div>
              <strong>{toPersianNumber(activeCalls.length)}</strong>
              <span>فراخوان فعال</span>
            </div>

            <div>
              <strong>{toPersianNumber(allCalls.length)}</strong>
              <span>دوره ثبت‌شده</span>
            </div>

            <div>
              <strong>۱۴۰۵</strong>
              <span>سال اجرای برنامه</span>
            </div>
          </div>
        </div>
      </section>

      <div className="calls-page__container">
        <section className="calls-page__section" id="active-calls">
          <CallsSubheading title="فراخوان‌های فعال" />

          {activeCalls.length > 0 ? (
            <div className="calls-page__previous-list">
              {activeCalls.map((call) => (
                <CallCard key={call.id} call={call} isActive />
              ))}
            </div>
          ) : (
            <p className="calls-page__empty">
              در حال حاضر فراخوان فعالی منتشر نشده است.
            </p>
          )}
        </section>

        <section className="calls-page__section" id="previous-calls">
          <CallsSubheading title="دوره‌های پیشین" warning showLine={false} />

          {visiblePreviousCalls.length > 0 ? (
            <div className="calls-page__previous-list">
              {visiblePreviousCalls.map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
            </div>
          ) : (
            <p className="calls-page__empty">
              هنوز فراخوان آرشیوشده‌ای ثبت نشده است.
            </p>
          )}

          {hasMorePreviousCalls && (
            <div className="calls-page__footer">
              <button
                type="button"
                className="calls-page__more"
                onClick={handleShowMore}
              >
                بیشتر
              </button>
            </div>
          )}
        </section>
      </div>

      <CallsArticle />
    </main>
  );
}

export default CallsPage;
