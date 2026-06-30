import { Link, useNavigate } from "react-router";

import bannerImage from "../../assets/images/banner-2.png";
import mentoringImage from "../../assets/images/services/mentoring-service.png";

import ContactFormSection from "../../components/common/ContactFormSection";

import {
  getCurrentUser,
  getCurrentUserDashboardPath,
} from "../../services/authService";

import "./TechnologyGuidancePage.css";

const SERVICE_SCROLL_OFFSET = 118;

const processSteps = [
  {
    id: 1,
    number: "۱",
    title: "مرحله اول فرآیند راهبری",
    description:
      "در این مرحله نیاز فناورانه، وضعیت فعلی ایده و ظرفیت‌های پژوهشی اولیه بررسی می‌شود.",
  },
  {
    id: 2,
    number: "۲",
    title: "مرحله دوم فرآیند راهبری",
    description:
      "مسیر توسعه فناوری، منابع موردنیاز و امکان‌سنجی اولیه برای ورود به فرآیند هدایت مشخص می‌شود.",
  },
  {
    id: 3,
    number: "۳",
    title: "مرحله سوم فرآیند راهبری",
    description:
      "طرح با کمک مشاوران تخصصی اصلاح شده و برنامه عملیاتی برای توسعه محصول تدوین می‌شود.",
  },
  {
    id: 4,
    number: "۴",
    title: "مرحله چهارم فرآیند راهبری",
    description:
      "در مرحله نهایی، مسیر اتصال طرح به حمایت، سرمایه، صنعت یا تجاری‌سازی مشخص می‌شود.",
  },
];

const reasons = [
  {
    id: 1,
    title: "هدایت تخصصی",
    description:
      "طرح‌ها با همراهی متخصصان مسیر دقیق‌تری برای توسعه فناوری طی می‌کنند.",
  },
  {
    id: 2,
    title: "کاهش خطا",
    description:
      "پیش از ورود به مراحل پرهزینه، نقاط ضعف فنی و اجرایی طرح شناسایی می‌شود.",
  },
  {
    id: 3,
    title: "اتصال به شبکه",
    description:
      "پژوهشگران به شبکه‌ای از مشاوران، صنعت و ظرفیت‌های حمایتی متصل می‌شوند.",
  },
  {
    id: 4,
    title: "آمادگی تجاری‌سازی",
    description:
      "طرح‌ها برای تبدیل‌شدن به محصول یا خدمت قابل ارائه در بازار آماده می‌شوند.",
  },
];

const benefits = [
  {
    id: 1,
    title: "تحلیل وضعیت طرح",
    description: "بررسی اولیه ایده، سطح آمادگی فناوری و نیازهای اصلی توسعه.",
  },
  {
    id: 2,
    title: "تدوین مسیر راهبری",
    description:
      "طراحی مسیر مرحله‌به‌مرحله برای رشد ایده تا محصول یا راهکار فناورانه.",
  },
  {
    id: 3,
    title: "مشاوره تخصصی",
    description: "دریافت بازخورد از مشاوران تخصصی متناسب با حوزه فعالیت طرح.",
  },
  {
    id: 4,
    title: "آمادگی جذب حمایت",
    description: "اصلاح و آماده‌سازی طرح برای ورود به فرآیند حمایت و ارزیابی.",
  },
  {
    id: 5,
    title: "اتصال به فرصت‌ها",
    description:
      "معرفی مسیرهای همکاری، سرمایه‌گذاری، توسعه بازار و تجاری‌سازی.",
  },
];

const faqs = [
  {
    id: 1,
    question: "چه طرح‌هایی می‌توانند از خدمات راهبری استفاده کنند؟",
    answer:
      "طرح‌های پژوهشی و فناورانه‌ای که قابلیت توسعه، حل مسئله واقعی یا تبدیل‌شدن به محصول و خدمت دارند، می‌توانند وارد فرآیند راهبری شوند.",
  },
  {
    id: 2,
    question: "آیا راهبری فقط برای طرح‌های آماده تجاری‌سازی است؟",
    answer:
      "خیر. راهبری می‌تواند از مراحل اولیه ایده تا آماده‌سازی برای حمایت، توسعه محصول و تجاری‌سازی انجام شود.",
  },
  {
    id: 3,
    question: "چطور درخواست راهبری ثبت می‌شود؟",
    answer:
      "از طریق فرم درخواست همین صفحه می‌توانید اطلاعات اولیه طرح را ارسال کنید تا بررسی و پیگیری شود.",
  },
];

function scrollToServiceSection(hash, event) {
  event?.preventDefault();

  const sectionId = hash.replace("#", "");
  const targetElement = document.getElementById(sectionId);

  if (!targetElement) {
    return;
  }

  window.history.pushState(null, "", hash);

  const targetTop =
    targetElement.getBoundingClientRect().top +
    window.scrollY -
    SERVICE_SCROLL_OFFSET;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    left: 0,
    behavior: "smooth",
  });
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

function SectionTitle({ children }) {
  return (
    <header className="service-page__section-title">
      <span />
      <h2>{children}</h2>
      <span />
    </header>
  );
}

function TechnologyGuidancePage() {
  const navigate = useNavigate();

  const handleProtectedRequest = (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const targetPath = currentUser ? getCurrentUserDashboardPath() : "/auth";

    navigate(targetPath || "/auth");
  };

  return (
    <main className="service-page">
      <section className="service-hero">
        <div className="service-hero__image">
          <img src={mentoringImage} alt="راهبری و هدایت فناور" />
        </div>

        <div className="service-hero__content">
          <h1>راهبری و هدایت فناور</h1>

          <p>
            خدمات راهبری هاتف با هدف همراهی پژوهشگران، صاحبان ایده و تیم‌های
            فناور طراحی شده است تا مسیر تبدیل دانش و پژوهش به محصول، خدمت یا
            راهکار کاربردی کوتاه‌تر و دقیق‌تر طی شود.
          </p>

          <p>
            در این فرآیند، طرح‌ها از نظر فنی، اجرایی، بازار، مدل توسعه و قابلیت
            دریافت حمایت بررسی می‌شوند و مسیر مناسب برای رشد آن‌ها مشخص می‌شود.
          </p>

          <a
            href="#technology-guidance-request-form"
            className="service-hero__button"
            onClick={(event) =>
              scrollToServiceSection("#technology-guidance-request-form", event)
            }
          >
            ثبت درخواست
          </a>
        </div>
      </section>

      <div className="service-page__container">
        <section className="service-process" id="guidance-process">
          <SectionTitle>فرآیند راهبری</SectionTitle>

          <div className="service-process__grid">
            {processSteps.map((step) => (
              <article className="service-process__item" key={step.id}>
                <strong>{step.number}</strong>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-reasons" id="why-guidance">
          <SectionTitle>چرا راهبری؟</SectionTitle>

          <div className="service-reasons__grid">
            {reasons.map((reason) => (
              <article className="service-reason-card" key={reason.id}>
                <div className="service-reason-card__icon">
                  <FeatureIcon />
                </div>

                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-benefits" id="guidance-benefits">
          <SectionTitle>شما دریافت می‌کنید</SectionTitle>

          <div className="service-benefits__grid">
            {benefits.map((benefit) => (
              <article className="service-benefit-card" key={benefit.id}>
                <div className="service-benefit-card__icon">
                  <FeatureIcon />
                </div>

                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-cta" id="technology-guidance-action">
          <img src={bannerImage} alt="" aria-hidden="true" />

          <div className="service-cta__overlay" />

          <div className="service-cta__content">
            <h2>دریافت خدمات راهبری فناوری</h2>

            <p>
              درخواست خود را ثبت کنید تا پس از بررسی اولیه، فرآیند راهبری و
              هدایت فناوری برای طرح شما آغاز شود.
            </p>

            <div className="service-cta__actions">
              <a href="/auth" onClick={handleProtectedRequest}>
                ثبت درخواست
              </a>

              <Link to="/services/consulting">مشاوره با کارشناسان</Link>
            </div>
          </div>
        </section>

        <ContactFormSection
          id="technology-guidance-request-form"
          title="فرم تماس"
          submitLabel="ثبت درخواست"
          sourceType="service"
          sourceTitle="راهبری و هدایت فناور"
          statusMessage="درخواست راهبری و هدایت فناور شما ثبت شد و برای بررسی به دبیرخانه ارسال شد."
        />

        <section className="service-faq" id="service-faq">
          <SectionTitle>سوالات شما</SectionTitle>

          <div className="service-faq__list">
            {faqs.map((faq) => (
              <details className="service-faq__item" key={faq.id}>
                <summary>
                  <span>{faq.question}</span>
                  <i aria-hidden="true">+</i>
                </summary>

                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default TechnologyGuidancePage;
