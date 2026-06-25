import bannerImage from "../../assets/images/banner-2.png";
import consultingImage from "../../assets/images/services/consulting-service.png";

import ContactFormSection from "../../components/common/ContactFormSection";

import "./TechnologyGuidancePage.css";

const processSteps = [
  {
    id: 1,
    number: "۱",
    title: "مرحله اول فرآیند مشاوره",
    description:
      "در این مرحله نیاز اصلی، مسئله فناورانه و وضعیت فعلی طرح یا کسب‌وکار بررسی می‌شود.",
  },
  {
    id: 2,
    number: "۲",
    title: "مرحله دوم فرآیند مشاوره",
    description:
      "مشاوران تخصصی، مسیرهای ممکن برای حل مسئله، توسعه طرح یا بهبود تصمیم‌گیری را پیشنهاد می‌کنند.",
  },
  {
    id: 3,
    number: "۳",
    title: "مرحله سوم فرآیند مشاوره",
    description:
      "راهکارهای پیشنهادی اولویت‌بندی می‌شوند و برنامه اجرایی متناسب با ظرفیت تیم تدوین می‌شود.",
  },
  {
    id: 4,
    number: "۴",
    title: "مرحله چهارم فرآیند مشاوره",
    description:
      "در پایان، مسیر اقدام، منابع موردنیاز و گام‌های بعدی برای پیگیری و اجرای پیشنهادها مشخص می‌شود.",
  },
];

const reasons = [
  {
    id: 1,
    title: "تصمیم‌گیری دقیق‌تر",
    description:
      "مشاوره تخصصی کمک می‌کند تصمیم‌های فنی، اجرایی و تجاری با خطای کمتر گرفته شوند.",
  },
  {
    id: 2,
    title: "بررسی چندجانبه",
    description:
      "طرح از جنبه‌های فناوری، بازار، مدل اجرا، منابع و قابلیت توسعه بررسی می‌شود.",
  },
  {
    id: 3,
    title: "کاهش ریسک",
    description:
      "پیش از ورود به مسیرهای پرهزینه، ضعف‌ها و ریسک‌های اصلی شناسایی می‌شوند.",
  },
  {
    id: 4,
    title: "دسترسی به تجربه",
    description:
      "تیم‌ها می‌توانند از تجربه متخصصان، مشاوران و شبکه همکاری هاتف استفاده کنند.",
  },
];

const benefits = [
  {
    id: 1,
    title: "جلسه ارزیابی اولیه",
    description: "بررسی مسئله، هدف، ظرفیت تیم و وضعیت فعلی طرح یا پروژه.",
  },
  {
    id: 2,
    title: "تحلیل مسیر توسعه",
    description:
      "ارائه مسیر پیشنهادی برای توسعه فناوری، اصلاح مدل اجرا یا آماده‌سازی طرح.",
  },
  {
    id: 3,
    title: "مشاوره تخصصی حوزه‌ای",
    description:
      "دریافت نظر مشاوران متناسب با حوزه علمی، فنی، صنعتی یا تجاری طرح.",
  },
  {
    id: 4,
    title: "پیشنهاد گام‌های عملیاتی",
    description:
      "تدوین اقدامات قابل اجرا برای پیشبرد طرح در کوتاه‌مدت و میان‌مدت.",
  },
  {
    id: 5,
    title: "آمادگی برای حمایت",
    description:
      "آماده‌سازی طرح برای ورود به فرآیند ارزیابی، حمایت، همکاری یا سرمایه‌گذاری.",
  },
];

const faqs = [
  {
    id: 1,
    question: "خدمات مشاوره برای چه کسانی مناسب است؟",
    answer:
      "این خدمات برای پژوهشگران، تیم‌های فناور، صاحبان ایده و مجموعه‌هایی مناسب است که برای توسعه یا تصمیم‌گیری درباره طرح خود نیاز به راهنمایی تخصصی دارند.",
  },
  {
    id: 2,
    question: "آیا مشاوره فقط برای طرح‌های دانشگاهی است؟",
    answer:
      "تمرکز اصلی هاتف بر طرح‌های پژوهشی و فناورانه دانشگاهی است، اما طرح‌هایی که قابلیت ارتباط با دانشگاه، صنعت یا تجاری‌سازی داشته باشند نیز قابل بررسی هستند.",
  },
  {
    id: 3,
    question: "چطور درخواست مشاوره ثبت می‌شود؟",
    answer:
      "از طریق فرم همین صفحه می‌توانید اطلاعات اولیه را ارسال کنید تا پس از بررسی، مسیر پیگیری مشخص شود.",
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

function ConsultingPage() {
  return (
    <main className="service-page">
      <section className="service-hero">
        <div className="service-hero__image">
          <img src={consultingImage} alt="خدمات مشاوره هاتف" />
        </div>

        <div className="service-hero__content">
          <h1>خدمات مشاوره</h1>

          <p>
            خدمات مشاوره هاتف برای کمک به پژوهشگران، تیم‌های فناور و صاحبان ایده
            طراحی شده است تا تصمیم‌های فنی، اجرایی و تجاری خود را با دید
            روشن‌تری اتخاذ کنند.
          </p>

          <p>
            در این مسیر، وضعیت طرح بررسی می‌شود، چالش‌های اصلی شناسایی می‌شوند و
            راهکارهای عملی برای توسعه، اصلاح یا آماده‌سازی طرح ارائه می‌گردد.
          </p>

          <a href="#service-request-form" className="service-hero__button">
            درخواست مشاوره
          </a>
        </div>
      </section>

      <div className="service-page__container">
        <section className="service-process" id="consulting-process">
          <SectionTitle>فرآیند مشاوره</SectionTitle>

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

        <section className="service-reasons" id="why-consulting">
          <SectionTitle>چرا مشاوره؟</SectionTitle>

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

        <section className="service-benefits" id="consulting-benefits">
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
            <h2>دریافت خدمات مشاوره فناوری</h2>

            <p>
              درخواست خود را ثبت کنید تا پس از بررسی اولیه، مسیر مناسب مشاوره و
              پیگیری برای طرح شما مشخص شود.
            </p>

            <div className="service-cta__actions">
              <a href="#service-request-form">ثبت درخواست</a>
              <a href="#consultation">مشاوره با کارشناسان</a>
            </div>
          </div>
        </section>

        <ContactFormSection
          title="فرم تماس"
          submitLabel="ثبت درخواست"
          statusMessage="درخواست مشاوره شما در نسخه نمایشی ثبت شد. ارسال واقعی پس از اتصال به سرور فعال می‌شود."
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

export default ConsultingPage;
