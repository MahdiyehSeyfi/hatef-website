import bannerImage from "../../assets/images/banner.png";
import "./AchievementsSection.css";

const achievements = [
  {
    id: 1,
    image: bannerImage,
    title: "فناوری بومی جذب پیشرفته برای پالایش گازهای خطرناک صنعتی",
    description: [
      "این دستاورد گامی مهم در مسیر توسعه فناوری‌های دوستدار محیط زیست برای صنایع انرژی‌بر و کاهش انتشار آلاینده‌های خطرناک به حساب می‌آید.",
      "این فناوری با تکیه بر دانش بومی، امکان توسعه راهکارهای مؤثرتر برای کنترل آلاینده‌های صنعتی را فراهم می‌کند.",
    ],
  },
  {
    id: 2,
    image: bannerImage,
    title: "توسعه راهکارهای نوین برای بهبود فرایندهای صنعتی",
    description: [
      "این دستاورد با هدف افزایش بهره‌وری و کاهش هزینه‌های تولید توسعه یافته است.",
      "استفاده از فناوری‌های دانشگاهی زمینه مناسبی برای همکاری میان صنعت و دانشگاه ایجاد می‌کند.",
    ],
  },
  {
    id: 3,
    image: bannerImage,
    title: "تجاری‌سازی فناوری‌های پیشرفته دانشگاهی",
    description: [
      "این طرح با هدف تبدیل نتایج پژوهشی به محصولات و خدمات قابل استفاده در صنعت اجرا شده است.",
      "توسعه این فناوری می‌تواند به ایجاد بازارهای جدید و رشد شرکت‌های دانش‌بنیان کمک کند.",
    ],
  },
  {
    id: 4,
    image: bannerImage,
    title: "راهکارهای فناورانه برای توسعه پایدار",
    description: [
      "این دستاورد در راستای کاهش مصرف منابع و بهبود عملکرد سامانه‌های صنعتی طراحی شده است.",
      "توسعه فناوری‌های سبز یکی از محورهای اصلی حمایت برنامه هاتف محسوب می‌شود.",
    ],
  },
];

function AchievementsSection() {
  const activeAchievement = achievements[0];

  return (
    <section className="achievements-section" id="achievements">
      <header className="achievements-section__heading">
        <span className="achievements-section__heading-line" />

        <h2>دستاوردهای هاتف</h2>

        <span className="achievements-section__heading-line" />
      </header>

      <div className="achievements-section__body">
        <div className="container achievements-section__content">
          <div className="achievement-information">
            <h3>{activeAchievement.title}</h3>

            <div className="achievement-information__description">
              {activeAchievement.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <a
              className="achievement-information__button"
              href="#all-achievements"
            >
              همه دستاوردها
            </a>
          </div>

          <div className="achievement-visual">
            <img
              className="achievement-visual__image"
              src={activeAchievement.image}
              alt={activeAchievement.title}
            />

            <div
              className="achievement-visual__dots"
              aria-label="اسلایدهای دستاوردها"
            >
              {achievements.map((achievement, index) => (
                <span
                  key={achievement.id}
                  className={`achievement-visual__dot ${
                    index === 0 ? "achievement-visual__dot--active" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AchievementsSection;
