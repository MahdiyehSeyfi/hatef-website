import { useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";

import "./CallsPage.css";

const activeCall = {
  id: 1,
  number: "۲",
  title: "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵",
  category: "با محوریت هوش مصنوعی",
  deadline: "مهلت تا: ۱۴۰۵/۰۵/۰۵",
  status: "در حال دریافت طرح‌ها",
};

const previousCalls = [
  {
    id: 2,
    number: "۲",
    title: "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵",
    category: "با محوریت انرژی‌های تجدیدپذیر",
    deadline: "مهلت تا: ۱۴۰۵/۰۵/۰۵",
    status: "پایان مهلت ارسال طرح",
  },
  {
    id: 3,
    number: "۲",
    title: "فراخوان حمایت از توسعه محصولات فناورانه دانشگاهی",
    category: "با محوریت تجاری‌سازی",
    deadline: "مهلت تا: ۱۴۰۴/۱۲/۲۰",
    status: "پایان مهلت ارسال طرح",
  },
  {
    id: 4,
    number: "۱",
    title: "فراخوان جذب ایده‌های پژوهشی مسئله‌محور و کاربردی",
    category: "با محوریت پژوهش کاربردی",
    deadline: "مهلت تا: ۱۴۰۴/۱۱/۱۵",
    status: "پایان مهلت ارسال طرح",
  },
  {
    id: 5,
    number: "۱",
    title: "فراخوان توسعه فناوری‌های سبز و محیط‌زیستی",
    category: "با محوریت فناوری سبز",
    deadline: "مهلت تا: ۱۴۰۴/۱۰/۳۰",
    status: "پایان مهلت ارسال طرح",
  },
  {
    id: 6,
    number: "۱",
    title: "فراخوان حمایت از طرح‌های هوشمندسازی صنعتی",
    category: "با محوریت هوش مصنوعی",
    deadline: "مهلت تا: ۱۴۰۴/۰۹/۲۵",
    status: "پایان مهلت ارسال طرح",
  },
  {
    id: 7,
    number: "۱",
    title: "فراخوان توسعه راهکارهای فناورانه برای صنایع بزرگ",
    category: "با محوریت صنعت و دانشگاه",
    deadline: "مهلت تا: ۱۴۰۴/۰۸/۱۵",
    status: "پایان مهلت ارسال طرح",
  },
];

const articleParagraphs = [
  "فراخوان‌های برنامه هاتف با هدف شناسایی، ارزیابی و حمایت از طرح‌های پژوهشی و فناورانه طراحی شده‌اند. این فراخوان‌ها فرصتی فراهم می‌کنند تا پژوهشگران، تیم‌های فناور و صاحبان ایده بتوانند طرح‌های خود را در مسیر توسعه، راهبری، ارزیابی و تجاری‌سازی قرار دهند.",
  "در هر فراخوان، محورهای اولویت‌دار، شرایط شرکت، مدارک موردنیاز، زمان‌بندی ارسال طرح و شیوه بررسی مشخص می‌شود. متقاضیان می‌توانند با مطالعه دقیق اطلاعات هر فراخوان، طرح خود را آماده کرده و در بازه اعلام‌شده ارسال کنند.",
  "طرح‌هایی که از نظر نوآوری، قابلیت اجرا، ظرفیت توسعه و ارتباط با نیازهای واقعی جامعه یا صنعت امتیاز مناسبی دریافت کنند، وارد مراحل بعدی بررسی و حمایت می‌شوند. این مسیر می‌تواند شامل داوری تخصصی، مشاوره، راهبری فناوری و اتصال به فرصت‌های همکاری باشد.",
  "برنامه هاتف تلاش می‌کند ارتباط میان دانشگاه، پژوهشگران، صنعت و نهادهای حمایتی را تقویت کند. به همین دلیل، فراخوان‌ها فقط یک اطلاعیه ساده نیستند؛ بلکه نقطه شروع یک مسیر هدفمند برای رشد فناوری و تبدیل دستاوردهای پژوهشی به راهکارهای کاربردی محسوب می‌شوند.",
];

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
          {call.status}
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
              <strong>۱</strong>
              <span>فراخوان فعال</span>
            </div>

            <div>
              <strong>۶</strong>
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

          <CallCard call={activeCall} isActive />
        </section>

        <section className="calls-page__section" id="previous-calls">
          <CallsSubheading title="دوره‌های پیشین" warning showLine={false} />

          <div className="calls-page__previous-list">
            {visiblePreviousCalls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>

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
