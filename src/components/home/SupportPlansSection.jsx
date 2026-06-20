import bannerImage from "../../assets/images/banner.png";
import "./SupportPlansSection.css";

const previousPlans = [
  {
    id: 1,
    number: "۳",
    title: "عنوان برگزیده سال ۱۴۰۴–۱۴۰۵",
    description:
      "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) و حمایت از طرح‌های فناورانه",
  },
  {
    id: 2,
    number: "۳",
    title: "عنوان برگزیده سال ۱۴۰۴–۱۴۰۵",
    description:
      "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) و حمایت از طرح‌های فناورانه",
  },
  {
    id: 3,
    number: "۳",
    title: "عنوان برگزیده سال ۱۴۰۴–۱۴۰۵",
    description:
      "فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) و حمایت از طرح‌های فناورانه",
  },
];

function SectionSubheading({ title, warning = false }) {
  return (
    <div className="support-plans__subheading">
      <div className="support-plans__subheading-label">
        <span
          className={`support-plans__subheading-dot ${
            warning ? "support-plans__subheading-dot--warning" : ""
          }`}
        />

        <h3>{title}</h3>
      </div>

      <span className="support-plans__subheading-line" />
    </div>
  );
}

function SupportPlansSection() {
  return (
    <section className="support-plans" id="calls">
      <div className="container">
        <header className="support-plans__header">
          <h2>طرح حمایتی هاتف</h2>
          <span className="support-plans__header-accent" />
        </header>

        <SectionSubheading title="محورهای سال جاری" />

        <article className="current-plan">
          <div className="current-plan__media">
            <img
              className="current-plan__image"
              src={bannerImage}
              alt="فراخوان حمایت از توسعه فناوری"
            />

            <div className="current-plan__overlay">
              <div className="current-plan__overlay-content">
                <h3>فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف)</h3>

                <p>
                  فراخوان اولین دوره هدایت اعتبارات توسعه فناوری و حمایت از
                  توسعه طرح‌ها و محصولات فناورانه دانشگاهی
                </p>

                <div className="current-plan__overlay-actions">
                  <a
                    href="#call-registration"
                    className="current-plan__overlay-primary"
                  >
                    شرکت در هاتف
                  </a>

                  <div className="current-plan__overlay-secondary-actions">
                    <a href="#registration-guide">راهنمای ثبت‌نام</a>
                    <a href="#eligibility-conditions">شرایط احراز</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="current-plan__information">
            <div className="current-plan__title">
              <span className="current-plan__number">۲</span>

              <a href="#call-details" className="current-plan__title-link">
                فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵
              </a>

              <span className="current-plan__category">
                با محوریت هوش مصنوعی
              </span>
            </div>

            <div className="current-plan__details">
              <span className="current-plan__deadline">
                مهلت تا: ۱۴۰۵/۰۵/۰۵
              </span>

              <span className="current-plan__status">در حال دریافت طرح‌ها</span>
            </div>
          </div>
        </article>

        <div className="support-plans__previous-heading">
          <SectionSubheading title="فراخوان‌های دوره‌های پیشین" warning />
        </div>

        <div className="previous-plans">
          {previousPlans.map((plan) => (
            <article className="previous-plan-card" key={plan.id}>
              <a
                href="#previous-call-details"
                className="previous-plan-card__media"
              >
                <img
                  className="previous-plan-card__image"
                  src={bannerImage}
                  alt={plan.title}
                />

                <div className="previous-plan-card__overlay">
                  <h4>{plan.title}</h4>
                  <p>{plan.description}</p>

                  <span className="previous-plan-card__overlay-button">
                    مشاهده
                    <span aria-hidden="true">←</span>
                  </span>
                </div>
              </a>

              <div className="previous-plan-card__body">
                <a
                  href="#previous-call-details"
                  className="previous-plan-card__title"
                >
                  <span className="previous-plan-card__number">
                    {plan.number}
                  </span>

                  <span>{plan.title}</span>
                </a>

                <p>{plan.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="support-plans__footer">
          <a href="#all-calls" className="support-plans__view-all">
            مشاهده همه
            <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default SupportPlansSection;
