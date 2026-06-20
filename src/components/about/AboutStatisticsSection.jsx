import "./AboutStatisticsSection.css";

const statistics = [
  {
    id: 1,
    value: "+۱۲",
    title: "دانشکده‌های شرکت‌کرده",
    description:
      "مشارکت دانشکده‌های مختلف دانشگاه در طرح‌ها و برنامه‌های پژوهشی هاتف",
  },
  {
    id: 2,
    value: "+۲۸",
    title: "طرح‌های پژوهشی منتخب",
    description:
      "طرح‌های علمی و فناورانه منتخب برای ورود به مسیر حمایت و توسعه",
  },
  {
    id: 3,
    value: "+۱۶",
    title: "همکاران صنعتی",
    description:
      "همکاری شرکت‌ها و مجموعه‌های صنعتی در توسعه و تجاری‌سازی فناوری",
  },
  {
    id: 4,
    value: "+۹",
    title: "محصولات توسعه‌یافته",
    description:
      "محصولات و راهکارهای فناورانه توسعه‌یافته با حمایت برنامه هاتف",
  },
];

function AboutStatisticsSection() {
  return (
    <section
      className="about-statistics-section"
      aria-label="آمار فعالیت‌های هاتف"
    >
      <div className="about-statistics-section__container">
        {statistics.map((statistic) => (
          <article
            className="about-statistics-section__item"
            key={statistic.id}
            tabIndex={0}
          >
            <div className="about-statistics-section__main">
              <strong className="about-statistics-section__value" dir="ltr">
                {statistic.value}
              </strong>

              <h3 className="about-statistics-section__title">
                {statistic.title}
              </h3>
            </div>

            <p className="about-statistics-section__description">
              {statistic.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AboutStatisticsSection;
