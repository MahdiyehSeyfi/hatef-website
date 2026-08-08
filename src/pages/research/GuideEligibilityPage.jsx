import { useEffect } from "react";
import { useLocation } from "react-router";

import heroImage from "../../assets/images/banner.png";
import ctaImage from "../../assets/images/banner-2.png";

import Button from "../../components/ui/Button/Button";

import "./ResearchSupportPages.css";

const guideBlocks = [
  {
    id: 1,
    title: "مرحله اول ثبت‌نام",
    description:
      "در این مرحله متقاضی باید اطلاعات اولیه طرح، مشخصات تیم و حوزه فعالیت خود را در سامانه ثبت کند.",
  },
  {
    id: 2,
    title: "مرحله دوم ثبت‌نام",
    description:
      "پس از ثبت اطلاعات اولیه، مدارک تکمیلی، مستندات فنی و فایل‌های مربوط به طرح بارگذاری می‌شود.",
  },
  {
    id: 3,
    title: "مرحله سوم ثبت‌نام",
    description:
      "در پایان، اطلاعات توسط دبیرخانه بررسی شده و در صورت تکمیل بودن وارد فرآیند ارزیابی می‌شود.",
  },
];

const eligibilityItems = [
  "طرح باید دارای ماهیت پژوهشی، فناورانه یا محصول‌محور باشد.",
  "تیم متقاضی باید توانایی اجرای اولیه یا توسعه طرح را داشته باشد.",
  "طرح باید قابلیت توسعه، تجاری‌سازی یا حل یک مسئله واقعی را نشان دهد.",
  "مدارک و مستندات اولیه طرح باید به صورت کامل ارائه شود.",
];

const featureCards = [
  {
    id: 1,
    title: "شفافیت مسیر",
    description: "متقاضی قبل از ارسال طرح با الزامات و مراحل اصلی آشنا می‌شود.",
  },
  {
    id: 2,
    title: "کاهش خطا",
    description:
      "ثبت صحیح اطلاعات باعث کاهش خطا در بررسی و ارزیابی اولیه می‌شود.",
  },
  {
    id: 3,
    title: "تکمیل مدارک",
    description:
      "مدارک موردنیاز و قالب‌های پیشنهادی برای ارسال طرح مشخص می‌شوند.",
  },
  {
    id: 4,
    title: "آمادگی ارزیابی",
    description:
      "طرح پس از تکمیل اطلاعات، آمادگی بیشتری برای ورود به داوری دارد.",
  },
];

const faqs = [
  {
    id: 1,
    question: "چه کسانی می‌توانند در طرح حمایتی شرکت کنند؟",
    answer:
      "پژوهشگران، تیم‌های فناور، اعضای دانشگاهی و صاحبان طرح‌هایی که قابلیت توسعه فناورانه یا تجاری‌سازی دارند، می‌توانند درخواست خود را ثبت کنند.",
  },
  {
    id: 2,
    question: "آیا ثبت‌نام به معنی پذیرش قطعی طرح است؟",
    answer:
      "خیر. ثبت‌نام فقط به معنی ورود اطلاعات و مدارک اولیه است و پذیرش نهایی پس از بررسی و ارزیابی انجام می‌شود.",
  },
  {
    id: 3,
    question: "آیا امکان اصلاح اطلاعات پس از ثبت وجود دارد؟",
    answer:
      "در صورت فعال بودن بازه اصلاح اطلاعات، متقاضی می‌تواند برخی از اطلاعات یا مستندات طرح را تکمیل یا اصلاح کند.",
  },
];

const proposalFiles = [
  {
    id: 1,
    title: "درخواست فوری برای محکومیت و توقف حملات به موسسات آموزشی و پژوهشی",
  },
  {
    id: 2,
    title: "درخواست فوری برای محکومیت و توقف حملات به موسسات آموزشی و پژوهشی",
  },
  {
    id: 3,
    title: "درخواست فوری برای محکومیت و توقف حملات به موسسات آموزشی و پژوهشی",
  },
  {
    id: 4,
    title: "درخواست فوری برای محکومیت و توقف حملات به موسسات آموزشی و پژوهشی",
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
        <h1>همه چیز درباره طرح حمایتی</h1>

        <p>طراحی مسیر تبدیل دستاوردهای پژوهشی و فناورانه به محصول و بازار</p>

        <div className="research-hero__actions">
          <Button href="#registration-guide" variant="inverse" size="md" className="research-hero__action">راهنمای ثبت‌نام</Button>
          <Button href="#eligibility" variant="inverse" size="md" className="research-hero__action">شرایط احراز</Button>
          <Button href="#proposal-guideline" variant="inverse" size="md" className="research-hero__action">شیوه‌نامه تدوین پروپوزال</Button>
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

function GuideEligibilityPage() {
  useResearchHashScroll();

  return (
    <main className="research-page">
      <ResearchHero />

      <div className="research-page__container">
        <section className="research-text-section" id="registration-guide">
          <SectionTitle>راهنمای ثبت‌نام</SectionTitle>

          <p>
            در این بخش، راهنمای ثبت‌نام در طرح حمایتی هاتف ارائه می‌شود.
            متقاضیان می‌توانند با توجه به توضیحات این بخش، اطلاعات اولیه، مدارک
            تکمیلی و مستندات موردنیاز را آماده کنند و فرآیند ارسال طرح را با دقت
            بیشتری انجام دهند.
          </p>

          {guideBlocks.map((block) => (
            <article className="research-guide-block" key={block.id}>
              <div className="research-guide-block__placeholder" />

              <div>
                <h3>{block.title}</h3>
                <p>{block.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="research-text-section" id="eligibility">
          <SectionTitle>شرایط احراز</SectionTitle>

          <p>
            شرایط احراز برای اطمینان از هم‌راستایی طرح با اهداف برنامه حمایتی
            تعریف شده است. طرح‌های ارسالی باید از نظر ماهیت، قابلیت اجرا، سطح
            آمادگی و ظرفیت توسعه، حداقل معیارهای ورود به فرآیند بررسی را داشته
            باشند.
          </p>

          <ul className="research-bullet-list">
            {eligibilityItems.map((item) => (
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
              درخواست خود را ثبت کنید تا پس از بررسی اولیه، فرآیند راهبری و
              هدایت فناوری آغاز شود.
            </p>

            <Button href="/services/consulting" variant="secondary" size="md" className="research-cta__action">مشاوره با کارشناسان</Button>
          </div>
        </section>

        <section className="research-text-section" id="proposal-guideline">
          <SectionTitle>شیوه‌نامه تدوین پروپوزال</SectionTitle>

          <p>
            پروپوزال طرح باید تصویر روشنی از مسئله، راهکار پیشنهادی، سطح آمادگی
            فناوری، مزیت رقابتی، تیم اجرایی، منابع موردنیاز و مسیر توسعه ارائه
            دهد. در این بخش، ساختار پیشنهادی برای تدوین پروپوزال و فایل‌های
            نمونه قابل دریافت است.
          </p>

          <ul className="research-bullet-list">
            <li>شرح مسئله و ضرورت اجرای طرح</li>
            <li>معرفی راهکار فناورانه و مزیت آن</li>
            <li>برنامه اجرایی، زمان‌بندی و منابع موردنیاز</li>
            <li>خروجی‌های مورد انتظار و مسیر توسعه</li>
          </ul>

          <div className="research-files">
            <h3>پروپوزال‌های نمونه</h3>

            {proposalFiles.map((file) => (
              <div className="research-file-row" key={file.id}>
                <span>{file.title}</span>

                <div>
                  <Button href="#download" variant="outline" size="sm">نسخه PDF</Button>
                  <Button href="#download" variant="outline" size="sm">نسخه Docx</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default GuideEligibilityPage;
