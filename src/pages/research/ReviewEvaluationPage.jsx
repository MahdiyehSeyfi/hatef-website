import { useEffect } from "react";
import { useLocation } from "react-router";

import heroImage from "../../assets/images/banner.png";
import ctaImage from "../../assets/images/banner-2.png";

import "./ResearchSupportPages.css";

const reviewSteps = [
  {
    id: 1,
    number: "۱",
    title: "مرحله اول فرآیند داوری",
    description:
      "در این مرحله اطلاعات اولیه طرح، مدارک و تطابق کلی با محورهای برنامه بررسی می‌شود.",
  },
  {
    id: 2,
    number: "۲",
    title: "مرحله دوم فرآیند داوری",
    description:
      "طرح از نظر فنی، نوآوری، امکان‌پذیری و ظرفیت توسعه توسط ارزیابان بررسی می‌شود.",
  },
  {
    id: 3,
    number: "۳",
    title: "مرحله سوم فرآیند داوری",
    description:
      "معیارهای اجرایی، تیم، منابع موردنیاز و تناسب طرح با اهداف حمایتی تحلیل می‌شود.",
  },
  {
    id: 4,
    number: "۴",
    title: "مرحله چهارم فرآیند داوری",
    description:
      "نتیجه داوری جمع‌بندی شده و طرح‌های واجد شرایط برای مراحل بعدی معرفی می‌شوند.",
  },
];

const principles = [
  {
    id: 1,
    title: "محرمانگی",
    description: "اطلاعات طرح‌ها در فرآیند داوری به صورت محرمانه بررسی می‌شود.",
  },
  {
    id: 2,
    title: "بی‌طرفی",
    description: "داوری بر اساس معیارهای مشخص و بدون جانبداری انجام می‌شود.",
  },
  {
    id: 3,
    title: "شفافیت ارزیابی",
    description: "معیارهای اصلی بررسی طرح برای متقاضیان قابل مشاهده است.",
  },
  {
    id: 4,
    title: "استفاده از داوران متخصص",
    description:
      "طرح‌ها توسط افراد آشنا با حوزه فناوری، پژوهش یا بازار ارزیابی می‌شوند.",
  },
];

const evaluationItems = [
  "سطح نوآوری و تمایز راهکار پیشنهادی",
  "قابلیت اجرا و امکان توسعه طرح",
  "ظرفیت تیم و توانمندی‌های اجرایی",
  "تناسب طرح با محورهای اعلام‌شده",
  "امکان تجاری‌سازی یا اثرگذاری کاربردی",
];

const featureCards = [
  {
    id: 1,
    title: "ارزیابی تخصصی",
    description: "طرح‌ها با توجه به حوزه تخصصی و فناوری مربوطه بررسی می‌شوند.",
  },
  {
    id: 2,
    title: "معیارهای روشن",
    description: "هر طرح بر اساس مجموعه‌ای از معیارهای مشخص ارزیابی می‌شود.",
  },
  {
    id: 3,
    title: "اولویت‌بندی طرح‌ها",
    description:
      "طرح‌های دارای ظرفیت بالاتر برای حمایت در اولویت قرار می‌گیرند.",
  },
  {
    id: 4,
    title: "بازخورد کاربردی",
    description: "نتایج ارزیابی می‌تواند به اصلاح و تکمیل مسیر طرح کمک کند.",
  },
];

const faqs = [
  {
    id: 1,
    question: "چه کسانی طرح‌ها را داوری می‌کنند؟",
    answer:
      "داوری توسط افراد متخصص، ارزیابان حوزه فناوری، کارشناسان پژوهشی و افراد آشنا با مسیر توسعه و تجاری‌سازی انجام می‌شود.",
  },
  {
    id: 2,
    question: "آیا همه طرح‌ها وارد مرحله داوری تخصصی می‌شوند؟",
    answer:
      "طرح‌هایی که اطلاعات و مدارک اولیه آن‌ها کامل باشد و با محورهای برنامه هم‌راستا باشند، وارد مراحل بعدی بررسی می‌شوند.",
  },
  {
    id: 3,
    question: "معیارهای ارزیابی چه نقشی در انتخاب طرح‌ها دارند؟",
    answer:
      "معیارهای ارزیابی مبنای مقایسه، اولویت‌بندی و تصمیم‌گیری درباره طرح‌های قابل حمایت هستند.",
  },
];

function useResearchHashScroll() {
  const location = useLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const hash = decodeURIComponent(location.hash.replace("#", ""));

      if (!hash) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const element = document.getElementById(hash);

      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);
}

function ResearchHero() {
  return (
    <section className="research-hero">
      <img src={heroImage} alt="" aria-hidden="true" />

      <div className="research-hero__overlay" />

      <div className="research-hero__content">
        <h1>همه چیز درباره روند ارزیابی هاتف</h1>

        <p>طراحی مسیر تبدیل دستاوردهای پژوهشی و فناورانه به محصول و بازار</p>

        <div className="research-hero__actions">
          <a href="#review-system">نظام داوری</a>
          <a href="#evaluation-criteria">معیارهای ارزیابی</a>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ children }) {
  return (
    <header className="research-section-title">
      <span />
      <h2>{children}</h2>
      <span />
    </header>
  );
}

function FeatureIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="20"
        height="20"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="16"
        cy="16"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle cx="23" cy="9" r="1.6" fill="currentColor" />
    </svg>
  );
}

function ReviewEvaluationPage() {
  useResearchHashScroll();

  return (
    <main className="research-page">
      <ResearchHero />

      <div className="research-page__container">
        <section className="research-text-section" id="review-system">
          <SectionTitle>نظام داوری</SectionTitle>

          <p>
            در این بخش، ساختار داوری طرح‌های پژوهشی و فناورانه معرفی می‌شود.
            پژوهشگران می‌توانند با توجه به این چارچوب، طرح خود را در راستای
            اولویت‌های تعیین‌شده آماده کنند و با معیارهای بررسی آشنا شوند.
          </p>
        </section>

        <section className="research-process">
          <SectionTitle>مراحل داوری</SectionTitle>

          <div className="research-process__grid">
            {reviewSteps.map((step) => (
              <article className="research-process__item" key={step.id}>
                <strong>{step.number}</strong>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="research-text-section">
          <SectionTitle>اصول داوری</SectionTitle>

          <p>
            فرآیند داوری بر پایه اصول مشخصی انجام می‌شود تا طرح‌ها به صورت
            منصفانه، تخصصی و قابل پیگیری بررسی شوند.
          </p>

          <div className="research-feature-grid">
            {principles.map((item) => (
              <article className="research-feature-card" key={item.id}>
                <div className="research-feature-card__icon">
                  <FeatureIcon />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="research-text-section">
          <SectionTitle>داوران چه کسانی هستند؟</SectionTitle>

          <p>
            داوران از میان متخصصان دانشگاهی، پژوهشگران، کارشناسان حوزه فناوری،
            صنعت و تجاری‌سازی انتخاب می‌شوند تا طرح‌ها از جنبه‌های مختلف بررسی
            شوند.
          </p>

          <ul className="research-bullet-list">
            <li>اعضای هیئت علمی دانشگاه‌ها</li>
            <li>پژوهشگران متخصص</li>
            <li>خبرگان حوزه فناوری و صنعت</li>
          </ul>
        </section>

        <section className="research-text-section" id="evaluation-criteria">
          <SectionTitle>معیارهای ارزیابی</SectionTitle>

          <p>
            معیارهای ارزیابی برای سنجش کیفیت، امکان‌پذیری و ظرفیت توسعه طرح‌ها
            تعریف شده‌اند. این معیارها به داوران کمک می‌کنند تا طرح‌ها را بر
            اساس شاخص‌های روشن بررسی و اولویت‌بندی کنند.
          </p>

          <ul className="research-bullet-list">
            {evaluationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="research-feature-grid">
            {featureCards.map((card) => (
              <article className="research-feature-card" key={card.id}>
                <div className="research-feature-card__icon">
                  <FeatureIcon />
                </div>

                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="research-faq">
          <SectionTitle>سوالات شما</SectionTitle>

          <div className="research-faq__list">
            {faqs.map((faq) => (
              <details className="research-faq__item" key={faq.id}>
                <summary>
                  <span>{faq.question}</span>
                  <i aria-hidden="true">+</i>
                </summary>

                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="research-cta">
          <img src={ctaImage} alt="" aria-hidden="true" />

          <div className="research-cta__overlay" />

          <div className="research-cta__content">
            <h2>دریافت خدمات مشاوره</h2>

            <p>
              درخواست خود را ثبت کنید تا پس از بررسی اولیه، مسیر راهبری و
              ارزیابی طرح شما مشخص شود.
            </p>

            <a href="/services/consulting">مشاوره با کارشناسان</a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ReviewEvaluationPage;
