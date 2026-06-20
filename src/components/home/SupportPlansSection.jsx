import bannerImage from "../../assets/images/banner.png";
import "./SupportPlansSection.css";

const previousPlans = [
  {
    id: 1,
    title: "عنوان فراخوان دوره قبل ۱۴۰۳",
    description:
      "فراخوان حمایت از طرح‌های نوآورانه و توسعه محصولات فناورانه دانشگاهی",
  },
  {
    id: 2,
    title: "عنوان فراخوان دوره قبل ۱۴۰۳",
    description:
      "فراخوان حمایت از طرح‌های نوآورانه و توسعه محصولات فناورانه دانشگاهی",
  },
  {
    id: 3,
    title: "عنوان فراخوان دوره قبل ۱۴۰۳",
    description:
      "فراخوان حمایت از طرح‌های نوآورانه و توسعه محصولات فناورانه دانشگاهی",
  },
];

function SupportPlansSection() {
  return (
    <section className="support-plans" id="calls">
      <div className="container">
        <header className="support-plans__header">
          <span className="support-plans__header-line" />
          <h2>طرح حمایتی هاتف</h2>
          <span className="support-plans__header-line" />
        </header>

        <div className="support-plans__subheading">
          <span className="support-plans__subheading-dot" />
          <h3>محورهای سال جاری</h3>
        </div>

        <article className="current-plan">
          <img
            className="current-plan__image"
            src={bannerImage}
            alt="فراخوان حمایت از توسعه فناوری"
          />

          <div className="current-plan__information">
            <div className="current-plan__title">
              <span className="current-plan__number">۲</span>

              <h3>
                فراخوان اولین دوره هدایت اعتبارات توسعه فناوری (هاتف) ۱۴۰۴–۱۴۰۵
              </h3>
            </div>

            <div className="current-plan__details">
              <span className="current-plan__category">
                با محوریت هوش مصنوعی
              </span>

              <span className="current-plan__deadline">
                مهلت تا: ۱۴۰۵/۰۵/۰۵
              </span>

              <span className="current-plan__status">در حال دریافت طرح‌ها</span>
            </div>
          </div>
        </article>

        <div className="support-plans__subheading support-plans__subheading--previous">
          <span className="support-plans__subheading-dot support-plans__subheading-dot--warning" />
          <h3>فراخوان‌های دوره‌های پیشین</h3>
        </div>

        <div className="previous-plans">
          {previousPlans.map((plan) => (
            <article className="previous-plan-card" key={plan.id}>
              <img
                className="previous-plan-card__image"
                src={bannerImage}
                alt={plan.title}
              />

              <div className="previous-plan-card__body">
                <h4>
                  <span className="previous-plan-card__icon">i</span>
                  {plan.title}
                </h4>

                <p>{plan.description}</p>

                <a href="#plan-details" className="previous-plan-card__link">
                  اطلاعات بیشتر
                </a>
              </div>
            </article>
          ))}
        </div>

        <a href="#all-calls" className="support-plans__view-all">
          مشاهده همه
        </a>
      </div>
    </section>
  );
}

export default SupportPlansSection;
