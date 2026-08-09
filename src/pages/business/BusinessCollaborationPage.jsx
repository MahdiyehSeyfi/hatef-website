import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import ContactFormSection from "../../components/common/ContactFormSection";

import heroImage from "../../assets/images/banner.png";
import shoppingBagIcon from "../../assets/icons/shopping-bag.svg";
import behsazanLogo from "../../assets/logos/behsazan-mellat-logo.jpg";
import mellatBankLogo from "../../assets/logos/mellat-bank-logo.jpg";
import mellatVenturesLogo from "../../assets/logos/mellat-ventures-logo.png";

import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Button from "../../components/ui/Button/Button";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader";

import "./BusinessCollaborationPage.css";

const BUSINESS_SCROLL_OFFSET = 118;

const processSteps = [
  {
    id: 1,
    number: "۱",
    title: "ثبت درخواست همکاری",
    description:
      "در این مرحله، شرکت، سرمایه‌گذار یا نهاد همکار اطلاعات اولیه، حوزه علاقه‌مندی و نوع همکاری موردنظر خود را ثبت می‌کند.",
  },
  {
    id: 2,
    number: "۲",
    title: "بررسی اولیه ظرفیت همکاری",
    description:
      "تیم هاتف ظرفیت همکاری، تناسب نیاز، حوزه فناوری و امکان اتصال به طرح‌ها یا پروژه‌های مناسب را بررسی می‌کند.",
  },
  {
    id: 3,
    number: "۳",
    title: "جلسه شناخت و نیازسنجی",
    description:
      "پس از بررسی اولیه، جلسه‌ای برای شناخت دقیق‌تر نیازها، انتظارات و مدل همکاری میان طرفین برگزار می‌شود.",
  },
  {
    id: 4,
    number: "۴",
    title: "تعریف مدل همکاری",
    description:
      "در این مرحله، چارچوب همکاری، نقش هر طرف، مسیر اجرا، منابع موردنیاز و خروجی‌های مورد انتظار مشخص می‌شود.",
  },
  {
    id: 5,
    number: "۵",
    title: "شروع همکاری اجرایی",
    description:
      "پس از توافق اولیه، همکاری وارد مرحله اجرایی، پایش، توسعه طرح یا اتصال به فرصت‌های تجاری‌سازی می‌شود.",
  },
];

const benefits = [
  {
    id: 1,
    title: "دسترسی به طرح‌های فناورانه",
    description:
      "همکاران تجاری می‌توانند به مجموعه‌ای از طرح‌های پژوهشی، فناورانه و قابل توسعه دسترسی پیدا کنند.",
  },
  {
    id: 2,
    title: "کاهش ریسک همکاری",
    description:
      "طرح‌ها پیش از معرفی، از نظر فنی، اجرایی، سطح آمادگی و ظرفیت توسعه بررسی می‌شوند.",
  },
  {
    id: 3,
    title: "اتصال به دانشگاه و پژوهشگران",
    description:
      "همکاری با هاتف مسیر ارتباط با تیم‌های علمی، پژوهشی و فناور دانشگاهی را کوتاه‌تر می‌کند.",
  },
  {
    id: 4,
    title: "فرصت سرمایه‌گذاری هدفمند",
    description:
      "شرکای تجاری می‌توانند روی طرح‌هایی تمرکز کنند که ظرفیت رشد، تجاری‌سازی یا حل مسئله واقعی دارند.",
  },
  {
    id: 5,
    title: "توسعه محصول و بازار",
    description:
      "همکاری‌ها می‌توانند به توسعه محصول، اعتبارسنجی بازار، تکمیل مدل کسب‌وکار و ورود به بازار کمک کنند.",
  },
  {
    id: 6,
    title: "همکاری منعطف",
    description:
      "مدل همکاری می‌تواند متناسب با نیاز همکار، از مشاوره و حمایت تا سرمایه‌گذاری یا اجرای مشترک تعریف شود.",
  },
];

const partnerStats = [
  {
    id: 1,
    number: "+۱۸",
    label: "همکار تجاری",
    description:
      "مجموعه‌هایی که در مسیر توسعه فناوری، سرمایه‌گذاری یا همکاری صنعتی با هاتف همراه شده‌اند.",
  },
  {
    id: 2,
    number: "+۳۲",
    label: "پروژه قابل همکاری",
    description:
      "طرح‌هایی که ظرفیت اتصال به صنعت، سرمایه‌گذار، مشاور یا بازار هدف را دارند.",
  },
  {
    id: 3,
    number: "+۱۲",
    label: "حوزه فناورانه",
    description:
      "حوزه‌هایی مانند انرژی، هوش مصنوعی، فناوری سبز، پایش صنعتی و تجاری‌سازی.",
  },
  {
    id: 4,
    number: "۷۵٪",
    label: "میانگین آمادگی همکاری",
    description:
      "میانگین تقریبی آمادگی طرح‌های منتخب برای ورود به مسیر همکاری یا توسعه محصول.",
  },
];

const partnerLogos = [
  {
    id: 1,
    image: behsazanLogo,
    alt: "بهسازان ملت",
  },
  {
    id: 2,
    image: mellatVenturesLogo,
    alt: "هلدینگ سرمایه‌گذاری ملت",
  },
  {
    id: 3,
    image: mellatBankLogo,
    alt: "بانک ملت",
  },
];

const frameworks = [
  {
    id: "investment",
    title: "سرمایه‌گذاری روی طرح",
    summary:
      "مناسب برای شرکت‌ها و سرمایه‌گذارانی که می‌خواهند در رشد یک طرح فناورانه مشارکت مالی داشته باشند.",
    items: [
      "بررسی ظرفیت بازار و سطح آمادگی طرح",
      "تعریف مدل سرمایه‌گذاری و سهم مشارکت",
      "پایش پیشرفت طرح در بازه‌های مشخص",
    ],
  },
  {
    id: "joint-development",
    title: "توسعه مشترک محصول",
    summary:
      "مناسب برای مجموعه‌هایی که می‌خواهند همراه با تیم فناور، محصول یا راهکار مشترک توسعه دهند.",
    items: [
      "تعریف نیاز واقعی صنعت یا بازار",
      "تکمیل نمونه یا محصول اولیه",
      "آزمایش، اعتبارسنجی و آماده‌سازی برای ارائه",
    ],
  },
  {
    id: "industrial-partnership",
    title: "همکاری صنعتی",
    summary:
      "مناسب برای صنایع و سازمان‌هایی که نیاز فناورانه مشخص دارند و به دنبال راهکار پژوهشی یا کاربردی هستند.",
    items: [
      "نیازسنجی و تعریف مسئله",
      "انتخاب طرح یا تیم فناور مناسب",
      "اجرای پایلوت یا پروژه کاربردی",
    ],
  },
  {
    id: "consulting",
    title: "مشاوره و راهبری",
    summary:
      "مناسب برای مجموعه‌هایی که نیاز به تحلیل، ارزیابی، راهبری فناوری یا طراحی مسیر تجاری‌سازی دارند.",
    items: [
      "ارزیابی فنی و بازار",
      "تدوین نقشه راه همکاری",
      "مشاوره در تجاری‌سازی و توسعه محصول",
    ],
  },
];

const faqs = [
  {
    id: 1,
    question: "چه نوع مجموعه‌هایی می‌توانند با هاتف همکاری کنند؟",
    answer:
      "شرکت‌ها، صنایع، سرمایه‌گذاران، نهادهای حمایتی، شتاب‌دهنده‌ها و مجموعه‌هایی که به دنبال طرح‌های فناورانه یا همکاری دانشگاه و صنعت هستند، می‌توانند درخواست همکاری ثبت کنند.",
  },
  {
    id: 2,
    question: "آیا همکاری فقط به معنی سرمایه‌گذاری است؟",
    answer:
      "خیر. همکاری می‌تواند شامل سرمایه‌گذاری، توسعه مشترک محصول، اجرای پایلوت، مشاوره، حمایت تخصصی یا اتصال به بازار باشد.",
  },
  {
    id: 3,
    question: "چطور مدل همکاری مشخص می‌شود؟",
    answer:
      "پس از ثبت درخواست و جلسه نیازسنجی، مدل همکاری بر اساس نوع نیاز، ظرفیت طرح، منابع طرفین و خروجی مورد انتظار تعریف می‌شود.",
  },
];

function scrollToBusinessHash(hashValue) {
  const hash = decodeURIComponent(hashValue.replace("#", ""));

  if (!hash) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  const element = document.getElementById(hash);

  if (!element) {
    return;
  }

  const targetTop =
    element.getBoundingClientRect().top +
    window.scrollY -
    BUSINESS_SCROLL_OFFSET;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });
}

function useBusinessHashScroll() {
  const location = useLocation();

  useEffect(() => {
    const firstFrameId = window.requestAnimationFrame(() => {
      const secondFrameId = window.requestAnimationFrame(() => {
        scrollToBusinessHash(location.hash);
      });

      return () => window.cancelAnimationFrame(secondFrameId);
    });

    return () => window.cancelAnimationFrame(firstFrameId);
  }, [location.pathname, location.hash]);
}

function SectionTitle({ children, subtitle }) {
  return (
    <SectionHeader
      title={children}
      description={subtitle}
      className="business-collab__section-heading"
    />
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

function ProcessSection() {
  return (
    <section className="business-collab__section" id="process">
      <div className="business-collab__container">
        <SectionTitle subtitle="از ثبت درخواست تا شروع همکاری اجرایی، مسیر همکاری در چند مرحله مشخص و قابل پیگیری انجام می‌شود.">
          نحوه همکاری
        </SectionTitle>

        <div className="business-collab__process-grid">
          {processSteps.map((step) => (
            <article className="business-collab__process-item" key={step.id}>
              <strong>{step.number}</strong>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="business-collab__section" id="benefits">
      <div className="business-collab__container">
        <SectionTitle subtitle="همکاری با هاتف برای شرکت‌ها، صنایع، سرمایه‌گذاران و نهادهای توسعه فناوری مزایای کاربردی و قابل اجرا ایجاد می‌کند.">
          مزایای همکاری
        </SectionTitle>

        <div className="business-collab__benefits-grid">
          {benefits.map((benefit) => (
            <article className="business-collab__benefit-card" key={benefit.id}>
              <div className="business-collab__benefit-icon">
                <FeatureIcon />
              </div>

              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  return (
    <section className="business-collab__partners" id="partners">
      <div className="business-collab__container">
        <SectionTitle subtitle="همکاران تجاری هاتف، مسیر تبدیل ایده‌های فناورانه به فرصت‌های واقعی همکاری، سرمایه‌گذاری و توسعه محصول را تقویت می‌کنند.">
          همکاران تجاری ما
        </SectionTitle>

        <div className="business-collab__partner-stats">
          {partnerStats.map((item) => (
            <article className="business-collab__partner-stat" key={item.id}>
              <img src={shoppingBagIcon} alt="" aria-hidden="true" />

              <span className="business-collab__partner-divider" />

              <strong>{item.number}</strong>

              <div>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="business-collab__partner-logos">
          {partnerLogos.map((logo) => (
            <img key={logo.id} src={logo.image} alt={logo.alt} />
          ))}
        </div>

        <div className="business-collab__partner-actions">
          <Button
            to="/business/opportunities"
            variant="secondary"
            size="lg"
            className="business-collab__partner-action"
          >
            فرصت‌های همکاری
          </Button>

          <Button
            href="#participation-contact"
            variant="primary"
            size="lg"
            className="business-collab__partner-action"
          >
            ارتباط جهت همکاری
          </Button>
        </div>
      </div>
    </section>
  );
}

function FrameworksSection() {
  const [activeFrameworkId, setActiveFrameworkId] = useState(frameworks[0].id);

  const activeFramework =
    frameworks.find((item) => item.id === activeFrameworkId) || frameworks[0];

  return (
    <section className="business-collab__section" id="frameworks">
      <div className="business-collab__container">
        <SectionTitle subtitle="چارچوب همکاری بر اساس نوع نیاز، سطح آمادگی طرح و نقش همکار تجاری انتخاب می‌شود.">
          چارچوب‌های همکاری
        </SectionTitle>

        <div className="business-collab__framework-tabs">
          <div className="business-collab__framework-nav">
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                type="button"
                className={
                  framework.id === activeFramework.id
                    ? "business-collab__framework-button business-collab__framework-button--active"
                    : "business-collab__framework-button"
                }
                onClick={() => setActiveFrameworkId(framework.id)}
              >
                {framework.title}
              </button>
            ))}
          </div>

          <div className="business-collab__framework-panel">
            <span>مدل همکاری</span>

            <h3>{activeFramework.title}</h3>

            <p>{activeFramework.summary}</p>

            <ul>
              {activeFramework.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="business-collab__faq">
      <div className="business-collab__container">
        <SectionTitle>سوالات رایج همکاری</SectionTitle>

        <div className="business-collab__faq-list">
          {faqs.map((faq) => (
            <details className="business-collab__faq-item" key={faq.id}>
              <summary>
                <span>{faq.question}</span>
                <i aria-hidden="true">+</i>
              </summary>

              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="business-collab__contact" id="participation-contact">
      <div className="business-collab__container">
        <SectionTitle subtitle="برای شروع همکاری، مشارکت صنعتی، سرمایه‌گذاری یا دریافت مشاوره، فرم زیر را تکمیل کنید.">
          ارتباط جهت مشارکت
        </SectionTitle>

        <ContactFormSection
          id="business-collaboration-request-form"
          title="فرم تماس"
          submitLabel="ارسال درخواست"
          sourceType="business-collaboration"
          sourceTitle="همکاری‌های تجاری"
          statusMessage="درخواست همکاری تجاری شما ثبت شد و برای بررسی به دبیرخانه ارسال شد."
        />
      </div>
    </section>
  );
}

function BusinessCollaborationPage() {
  useBusinessHashScroll();

  return (
    <main className="business-collab">
      <div className="business-collab__container business-collab__breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: "صفحه اصلی", to: "/" },
            { label: "همکاری‌های تجاری" },
          ]}
        />
      </div>

      <section className="business-collab__hero" id="collaboration-top">
        <img src={heroImage} alt="" aria-hidden="true" />

        <div className="business-collab__hero-overlay" />

        <div className="business-collab__hero-content">
          <span>همکاری‌های تجاری هاتف</span>

          <h1>مسیر همکاری با هاتف</h1>

          <p>
            در این صفحه، نحوه همکاری، مزایای همکاری، همکاران تجاری و چارچوب‌های
            همکاری در یک مسیر یکپارچه معرفی می‌شوند.
          </p>

          <div className="business-collab__hero-actions">
            <Button href="#process" variant="inverse" size="sm" className="business-collab__hero-action">نحوه همکاری</Button>
            <Button href="#benefits" variant="inverse" size="sm" className="business-collab__hero-action">مزایای همکاری</Button>
            <Button href="#partners" variant="inverse" size="sm" className="business-collab__hero-action">همکاران تجاری</Button>
            <Button href="#frameworks" variant="inverse" size="sm" className="business-collab__hero-action">چارچوب‌ها</Button>
            <Button href="#participation-contact" variant="inverse" size="sm" className="business-collab__hero-action">ارتباط جهت مشارکت</Button>
          </div>
        </div>
      </section>

      <ProcessSection />

      <BenefitsSection />

      <PartnersSection />

      <FrameworksSection />

      <FaqSection />

      <ContactSection />
    </main>
  );
}

export default BusinessCollaborationPage;
