import bannerImage from "../../assets/images/banner-2.png";
import commercializationImage from "../../assets/images/services/commercialization-service.png";

import ContactFormSection from "../../components/common/ContactFormSection";

import "./TechnologyGuidancePage.css";

const processSteps = [
  {
    id: 1,
    number: "۱",
    title: "مرحله اول تدوین نقشه راه",
    description:
      "در این مرحله وضعیت فعلی طرح، سطح آمادگی فناوری، ظرفیت تیم و مسئله اصلی تجاری‌سازی بررسی می‌شود.",
  },
  {
    id: 2,
    number: "۲",
    title: "مرحله دوم تدوین نقشه راه",
    description:
      "بازار هدف، مخاطبان اصلی، مسیر ورود به بازار و نیازهای کلیدی برای توسعه محصول مشخص می‌شود.",
  },
  {
    id: 3,
    number: "۳",
    title: "مرحله سوم تدوین نقشه راه",
    description:
      "مدل درآمدی، مسیر همکاری با صنعت، الزامات اجرایی و منابع موردنیاز برای رشد طرح تحلیل می‌شود.",
  },
  {
    id: 4,
    number: "۴",
    title: "مرحله چهارم تدوین نقشه راه",
    description:
      "در پایان، یک مسیر عملیاتی مرحله‌به‌مرحله برای تبدیل طرح فناورانه به محصول، خدمت یا کسب‌وکار ارائه می‌شود.",
  },
];

const reasons = [
  {
    id: 1,
    title: "شفاف‌سازی مسیر بازار",
    description:
      "تیم فناور متوجه می‌شود محصول یا خدمت او چگونه می‌تواند وارد بازار هدف شود.",
  },
  {
    id: 2,
    title: "کاهش ریسک تجاری",
    description:
      "چالش‌های ورود به بازار، مدل درآمدی و نیازهای اجرایی پیش از اقدام جدی بررسی می‌شوند.",
  },
  {
    id: 3,
    title: "اتصال به فرصت‌ها",
    description:
      "مسیر همکاری با صنعت، سرمایه‌گذاران، نهادهای حمایتی و شرکای تجاری مشخص‌تر می‌شود.",
  },
  {
    id: 4,
    title: "آمادگی برای رشد",
    description:
      "طرح از یک ایده یا نمونه اولیه به سمت محصول قابل ارائه و توسعه‌پذیر حرکت می‌کند.",
  },
];

const benefits = [
  {
    id: 1,
    title: "تحلیل وضعیت تجاری‌سازی",
    description:
      "بررسی جایگاه فعلی طرح از نظر بازار، محصول، مشتری و قابلیت توسعه.",
  },
  {
    id: 2,
    title: "طراحی مسیر ورود به بازار",
    description:
      "مشخص‌کردن گام‌های لازم برای معرفی، عرضه و توسعه محصول یا خدمت.",
  },
  {
    id: 3,
    title: "بررسی مدل درآمدی",
    description:
      "تحلیل روش‌های درآمدزایی، ارزش پیشنهادی و امکان‌پذیری اقتصادی طرح.",
  },
  {
    id: 4,
    title: "تدوین برنامه اقدام",
    description:
      "تهیه مسیر عملیاتی برای توسعه، اعتبارسنجی، همکاری و جذب حمایت.",
  },
  {
    id: 5,
    title: "آمادگی جذب همکاری",
    description:
      "آماده‌سازی طرح برای مذاکره با صنعت، سرمایه‌گذار یا نهادهای حمایتی.",
  },
];

const faqs = [
  {
    id: 1,
    question: "نقشه راه تجاری‌سازی برای چه طرح‌هایی مناسب است؟",
    answer:
      "برای طرح‌هایی مناسب است که از مرحله ایده یا نمونه اولیه عبور کرده‌اند و نیاز دارند مسیر ورود به بازار، توسعه محصول یا جذب همکاری برای آن‌ها مشخص شود.",
  },
  {
    id: 2,
    question: "آیا تدوین نقشه راه به معنی جذب سرمایه قطعی است؟",
    answer:
      "خیر. نقشه راه، مسیر آماده‌سازی و اقدام را مشخص می‌کند؛ اما جذب سرمایه یا همکاری به وضعیت طرح، کیفیت اجرا و ارزیابی طرف‌های همکار بستگی دارد.",
  },
  {
    id: 3,
    question: "چطور درخواست تدوین نقشه راه ثبت می‌شود؟",
    answer:
      "از طریق فرم همین صفحه می‌توانید اطلاعات اولیه طرح را ارسال کنید تا پس از بررسی، مسیر پیگیری مشخص شود.",
  },
];

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

function CommercializationRoadmapPage() {
  return (
    <main className="service-page">
      <section className="service-hero">
        <div className="service-hero__image">
          <img src={commercializationImage} alt="نقشه راه تجاری‌سازی فناوری" />
        </div>

        <div className="service-hero__content">
          <h1>نقشه راه تجاری‌سازی فناوری</h1>

          <p>
            نقشه راه تجاری‌سازی، مسیر تبدیل دستاوردهای پژوهشی و فناورانه به
            محصول، خدمت یا کسب‌وکار قابل ارائه در بازار را مشخص می‌کند.
          </p>

          <p>
            در این فرآیند، وضعیت طرح از نظر بازار، مدل درآمدی، نیازهای اجرایی،
            ظرفیت تیم و مسیر همکاری با صنعت بررسی می‌شود تا مسیر رشد و توسعه آن
            روشن‌تر شود.
          </p>

          <a href="#service-request-form" className="service-hero__button">
            تدوین نقشه راه
          </a>
        </div>
      </section>

      <div className="service-page__container">
        <section className="service-process" id="roadmap-process">
          <SectionTitle>مراحل تدوین نقشه راه</SectionTitle>

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

        <section className="service-reasons" id="why-roadmap">
          <SectionTitle>مزایای طراحی مسیر تجاری‌سازی</SectionTitle>

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

        <section className="service-benefits" id="roadmap-benefits">
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

        <section className="service-cta">
          <img src={bannerImage} alt="" aria-hidden="true" />

          <div className="service-cta__overlay" />

          <div className="service-cta__content">
            <h2>برای تدوین نقشه راه تجاری‌سازی اقدام کنید</h2>

            <p>
              در صورت تمایل به دریافت این خدمت، درخواست خود را ثبت کنید تا پس از
              بررسی اولیه، فرآیند تدوین نقشه راه آغاز شود.
            </p>

            <div className="service-cta__actions">
              <a href="#service-request-form">تدوین نقشه راه</a>
              <a href="#consultation">مشاوره با کارشناسان</a>
            </div>
          </div>
        </section>

        <ContactFormSection
          title="فرم تماس"
          submitLabel="ثبت درخواست"
          statusMessage="درخواست تدوین نقشه راه شما در نسخه نمایشی ثبت شد. ارسال واقعی پس از اتصال به سرور فعال می‌شود."
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

export default CommercializationRoadmapPage;
