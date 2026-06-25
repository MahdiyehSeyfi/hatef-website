import { Link, useParams } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import ctaBannerImage from "../../assets/images/banner-2.png";

import NewsSidebar from "../../components/news/NewsSidebar";

import "./CallDetailsPage.css";

const callData = {
  id: 1,
  number: "۲",
  title: "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵",
  category: "با محوریت هوش مصنوعی",
  deadline: "مهلت تا: ۱۴۰۵/۰۵/۰۵",
  status: "در حال دریافت طرح‌ها",
  submitStatus: "در حال دریافت طرح",
};

const quickLinks = [
  {
    id: 1,
    label: "راهنمای شرکت در طرح",
    href: "#registration-guide",
  },
  {
    id: 2,
    label: "شرایط احراز و ارسال آثار",
    href: "#eligibility",
  },
  {
    id: 3,
    label: "راهنمای تدوین پروپوزال",
    href: "#proposal-guide",
  },
  {
    id: 4,
    label: "نسخه PDF",
    href: "#download-pdf",
    download: true,
  },
];

const faqItems = [
  {
    id: 1,
    question: "عنوان سند راهبردی شماره ۱",
    answer:
      "توضیحات مربوط به این سوال در این بخش قرار می‌گیرد. این متن می‌تواند شامل شرایط، مدارک لازم و زمان‌بندی ارسال طرح باشد.",
  },
  {
    id: 2,
    question: "عنوان سند راهبردی شماره ۱",
    answer:
      "پاسخ این سوال می‌تواند درباره نحوه ثبت‌نام، بررسی اولیه، داوری تخصصی و مراحل بعدی دریافت حمایت باشد.",
  },
  {
    id: 3,
    question: "عنوان سند راهبردی شماره ۱",
    answer:
      "در این بخش می‌توان توضیحات تکمیلی درباره فرآیند ارسال طرح و پیگیری وضعیت آن را قرار داد.",
  },
];

function CallBadge({ children, variant = "default" }) {
  return (
    <span className={`call-details__badge call-details__badge--${variant}`}>
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <header className="call-details__section-title">
      <span />
      <h2>{children}</h2>
    </header>
  );
}

function QuickActions() {
  return (
    <aside className="call-details__quick-actions">
      {quickLinks.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`call-details__quick-link ${
            item.download ? "call-details__quick-link--download" : ""
          }`}
        >
          {item.download && <span aria-hidden="true">↓</span>}
          {item.label}
        </a>
      ))}

      <a href="#submit-call" className="call-details__submit-button">
        ارسال طرح
      </a>
    </aside>
  );
}

function CallHero() {
  return (
    <section className="call-details__hero">
      <div className="call-details__hero-image">
        <img src={bannerImage} alt={callData.title} />

        <div className="call-details__hero-status">
          <CallBadge variant="active">{callData.submitStatus}</CallBadge>
          <span>{callData.deadline}</span>
        </div>
      </div>

      <div className="call-details__hero-content">
        <QuickActions />

        <div className="call-details__hero-info">
          <div className="call-details__meta">
            <span className="call-details__number">{callData.number}</span>

            <h1>{callData.title}</h1>

            <CallBadge>{callData.category}</CallBadge>
          </div>

          <p>
            در این بخش، اولویت‌های پژوهشی سال جاری معرفی شده‌اند. پژوهشگران
            می‌توانند با توجه به این محورها، طرح‌های پژوهشی و فناورانه خود را در
            راستای اولویت‌های تعیین‌شده ارائه دهند.
          </p>

          <p>
            این فراخوان با هدف حمایت از ایده‌ها و طرح‌های فناورانه دانشگاهی
            طراحی شده و تلاش می‌کند مسیر تبدیل پژوهش به محصول، خدمت یا راهکار
            کاربردی را کوتاه‌تر و دقیق‌تر کند.
          </p>
        </div>
      </div>
    </section>
  );
}

function CallContent() {
  return (
    <article className="call-details__article">
      <section id="registration-guide">
        <SectionTitle>محورهای پژوهشی سال جاری</SectionTitle>

        <p>
          در این بخش، اولویت‌های پژوهشی سال جاری معرفی شده‌اند. پژوهشگران
          می‌توانند با توجه به این محورها، طرح‌های پژوهشی و فناورانه خود را در
          راستای اولویت‌های تعیین‌شده ارائه دهند. در این بخش، پژوهشگران
          می‌توانند با توجه به این محورها، طرح‌های پژوهشی و فناورانه خود را در
          راستای اولویت‌های تعیین‌شده ارائه دهند.
        </p>

        <p>
          هدف از اعلام این محورها، تمرکز بر نیازهای واقعی جامعه، صنعت و زیست‌بوم
          فناوری کشور است. طرح‌های ارسالی باید مسئله‌محور، قابل توسعه و دارای
          ظرفیت تبدیل‌شدن به محصول یا خدمت باشند.
        </p>
      </section>

      <section id="eligibility">
        <SectionTitle>محورهای پژوهشی سال جاری</SectionTitle>

        <p>
          در این بخش، پژوهشگران می‌توانند با توجه به محورهای معرفی‌شده، طرح‌های
          پژوهشی و فناورانه خود را آماده کنند. طرح‌ها پس از ارسال، ابتدا از نظر
          کامل‌بودن مدارک و انطباق با محور فراخوان بررسی می‌شوند.
        </p>

        <p>
          پس از بررسی اولیه، طرح‌های واجد شرایط وارد مرحله ارزیابی تخصصی
          می‌شوند. در این مرحله، معیارهایی مانند نوآوری، امکان اجرا، قابلیت
          توسعه، اثرگذاری و ظرفیت تجاری‌سازی مورد توجه قرار می‌گیرد.
        </p>

        <p>
          پژوهشگران و تیم‌های فناور لازم است اطلاعات طرح، اعضای تیم، سوابق
          مرتبط، برنامه اجرایی و مستندات موردنیاز را با دقت آماده و ارسال کنند.
        </p>
      </section>
    </article>
  );
}

function CallCta() {
  return (
    <section className="call-details__cta" id="submit-call">
      <img src={ctaBannerImage} alt="" aria-hidden="true" />

      <div className="call-details__cta-overlay" />

      <div className="call-details__cta-content">
        <h2>برای تدوین نقشه راه تجاری‌سازی اقدام کنید</h2>

        <p>
          در صورت تمایل به دریافت این خدمت، درخواست خود را ثبت کنید تا پس از
          بررسی اولیه، فرآیند تدوین نقشه راه آغاز شود.
        </p>

        <div className="call-details__cta-actions">
          <a href="#submit-form">تدوین نقشه راه</a>
          <a href="#consultation">مشاوره با کارشناسان</a>
        </div>
      </div>
    </section>
  );
}

function CallFaq() {
  return (
    <section className="call-details__faq">
      <SectionTitle>سوالات شما</SectionTitle>

      <div className="call-details__faq-list">
        {faqItems.map((faq) => (
          <details className="call-details__faq-item" key={faq.id}>
            <summary>
              <span>{faq.question}</span>
              <i aria-hidden="true">+</i>
            </summary>

            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CallDetailsPage() {
  const { callId } = useParams();

  return (
    <main className="call-details">
      <div className="call-details__container">
        <CallHero />

        <div className="call-details__layout">
          <aside className="call-details__sidebar">
            <NewsSidebar />
          </aside>

          <div className="call-details__main">
            <CallContent />
          </div>
        </div>

        <CallCta />

        <CallFaq />

        <div className="call-details__back-wrap">
          <Link to="/research-support/calls" className="call-details__back">
            بازگشت به فهرست فراخوان‌ها
          </Link>

          <span className="call-details__page-id">
            شناسه فراخوان: {callId || callData.id}
          </span>
        </div>
      </div>
    </main>
  );
}

export default CallDetailsPage;
