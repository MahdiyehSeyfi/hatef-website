import { useEffect, useState } from "react";
import bannerImage from "../../assets/images/banner.png";
import "./AchievementsSection.css";

const achievements = [
  {
    id: 1,
    image: bannerImage,
    title: "فناوری بومی جذب پیشرفته برای پالایش گازهای خطرناک صنعتی",
    description: [
      "این دستاورد گامی مهم در مسیر توسعه فناوری‌های دوستدار محیط زیست برای صنایع انرژی‌بر و کاهش انتشار آلاینده‌های خطرناک به حساب می‌آید.",
      "این دستاورد گامی مهم در مسیر توسعه فناوری‌های بومی برای صنایع انرژی‌بر و کاهش انتشار آلاینده‌های خطرناک به حساب می‌آید.",
    ],
  },
  {
    id: 2,
    image: bannerImage,
    title: "توسعه راهکارهای نوین برای کاهش آلایندگی صنایع بزرگ",
    description: [
      "این فناوری با هدف افزایش بازده فرایندهای صنعتی و کاهش اثرات زیست‌محیطی طراحی و توسعه یافته است.",
      "استفاده از دانش بومی زمینه مناسبی برای توسعه محصولات فناورانه و همکاری میان دانشگاه و صنعت فراهم می‌کند.",
    ],
  },
  {
    id: 3,
    image: bannerImage,
    title: "تجاری‌سازی فناوری‌های پیشرفته و محصولات دانشگاهی",
    description: [
      "این طرح با هدف تبدیل نتایج پژوهشی به محصولات قابل استفاده در صنایع مختلف اجرا شده است.",
      "توسعه این دستاورد می‌تواند به رشد شرکت‌های دانش‌بنیان و ایجاد فرصت‌های جدید سرمایه‌گذاری کمک کند.",
    ],
  },
  {
    id: 4,
    image: bannerImage,
    title: "راهکارهای هوشمند برای توسعه پایدار صنایع انرژی‌بر",
    description: [
      "این دستاورد در راستای بهینه‌سازی مصرف منابع و بهبود عملکرد سامانه‌های صنعتی توسعه یافته است.",
      "فناوری‌های سبز و هوشمند یکی از محورهای اصلی حمایت برنامه هاتف محسوب می‌شوند.",
    ],
  },
];

function AchievementsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeAchievement = achievements[activeIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % achievements.length;
      });
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex]);

  return (
    <section className="achievements-section" id="achievements">
      <header className="achievements-section__heading">
        <span className="achievements-section__heading-line" />

        <h2>دستاوردهای هاتف</h2>

        <span className="achievements-section__heading-line" />
      </header>

      <div className="achievements-section__body">
        <div className="achievements-section__content">
          <div
            key={`achievement-info-${activeAchievement.id}`}
            className="achievement-information"
          >
            <a
              href="#achievement-details"
              className="achievement-information__title"
            >
              {activeAchievement.title}
            </a>

            <div className="achievement-information__description">
              {activeAchievement.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="achievement-information__footer">
              <a
                className="achievement-information__button"
                href="#all-achievements"
              >
                همه دستاوردها
                <span aria-hidden="true">←</span>
              </a>
            </div>
          </div>

          <div className="achievement-visual">
            <a
              href="#achievement-details"
              className="achievement-visual__media"
            >
              <img
                key={`achievement-image-${activeAchievement.id}`}
                className="achievement-visual__image"
                src={activeAchievement.image}
                alt={activeAchievement.title}
              />

              <span className="achievement-visual__overlay">
                <span className="achievement-visual__view-button">
                  مشاهده دستاورد
                </span>
              </span>
            </a>

            <div
              className="achievement-visual__dots"
              aria-label="انتخاب دستاورد"
            >
              {achievements.map((achievement, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={achievement.id}
                    type="button"
                    className={`achievement-visual__dot ${
                      isActive ? "achievement-visual__dot--active" : ""
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`نمایش دستاورد ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AchievementsSection;
