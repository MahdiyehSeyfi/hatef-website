import { useState } from "react";

import AchievementsSection from "../home/AchievementsSection";
import AboutStatisticsSection from "./AboutStatisticsSection";
import AboutOrganizationSection from "./AboutOrganizationSection";
import AboutGovernanceSection from "./AboutGovernanceSection";
import SectionHeader from "../ui/SectionHeader/SectionHeader";

import "./AboutContentSections.css";

const growthStages = [
  {
    year: "۱۳۹۱",
    title: "شکل‌گیری ایده اولیه هاتف",
    description:
      "ایده اولیه برنامه هاتف با هدف ایجاد ارتباط مؤثر میان ظرفیت‌های پژوهشی دانشگاه، نیازهای فناورانه کشور و حمایت هدفمند از پژوهشگران شکل گرفت.",
  },
  {
    year: "۱۳۹۴",
    title: "آغاز حمایت از طرح‌های پژوهشی",
    description:
      "در این مرحله، فرآیند شناسایی و حمایت از طرح‌های پژوهشی مسئله‌محور آغاز شد و نخستین گروه‌های پژوهشی وارد مسیر توسعه فناوری شدند.",
  },
  {
    year: "۱۳۹۷",
    title: "توسعه همکاری با صنعت",
    description:
      "با گسترش فعالیت‌ها، ارتباط میان دانشگاه و صنایع تقویت شد و طرح‌های منتخب برای تبدیل‌شدن به راهکارهای عملی و محصولات فناورانه آماده شدند.",
  },
  {
    year: "۱۴۰۱",
    title: "تجاری‌سازی دستاوردهای دانشگاهی",
    description:
      "مسیرهای تجاری‌سازی، جذب سرمایه و توسعه بازار برای طرح‌های برگزیده ایجاد شد تا دستاوردهای پژوهشی بتوانند وارد چرخه واقعی اقتصاد شوند.",
  },
  {
    year: "۱۴۰۳",
    title: "توسعه شبکه ملی هاتف",
    description:
      "هاتف با توسعه شبکه پژوهشگران، سرمایه‌گذاران، دانشگاه‌ها و صنایع، فعالیت خود را در مقیاسی گسترده‌تر و با تمرکز بر فناوری‌های آینده ادامه داد.",
  },
];

function AboutContentSections() {
  const [activeGrowthIndex, setActiveGrowthIndex] = useState(
    growthStages.length - 1,
  );

  const activeGrowth = growthStages[activeGrowthIndex];

  const formattedStageNumber = (activeGrowthIndex + 1).toLocaleString("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return (
    <div className="about-content-sections">
      <section className="about-section about-mission" id="mission">
        <div className="about-content-container">
          <div className="about-mission__grid">
            <article className="about-mission__card">
              <header className="about-section-label">
                <span />

                <h2>ماموریت هاتف</h2>
              </header>

              <p>
                ماموریت هاتف، حمایت هدفمند از پژوهشگران و صاحبان ایده برای تبدیل
                دانش و پژوهش به فناوری، محصول و راهکارهای قابل‌استفاده در جامعه
                و صنعت است.
              </p>

              <p>
                هاتف با ارائه حمایت‌های مالی، تخصصی و اجرایی، مسیر توسعه طرح‌های
                فناورانه را کوتاه‌تر و امکان شکل‌گیری همکاری‌های مؤثر میان
                دانشگاه، صنعت و سرمایه‌گذاران را فراهم می‌کند.
              </p>
            </article>

            <article className="about-mission__card">
              <header className="about-section-label">
                <span />

                <h2>چشم‌انداز هاتف</h2>
              </header>

              <p>
                چشم‌انداز هاتف، تبدیل‌شدن به یک شبکه یکپارچه و اثرگذار برای
                هدایت ظرفیت‌های علمی و پژوهشی دانشگاه‌ها به‌سوی حل مسائل واقعی
                کشور است.
              </p>

              <p>
                در این مسیر، هاتف تلاش می‌کند بستری پایدار برای رشد پژوهشگران،
                توسعه فناوری‌های راهبردی و ایجاد کسب‌وکارهای دانش‌بنیان فراهم
                سازد.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-section about-growth" id="history">
        <div className="about-content-container">
          <SectionHeader
            title="مسیر رشد هاتف"
            className="about-growth__heading"
          />

          <div
            className="about-growth__timeline"
            role="tablist"
            aria-label="مراحل رشد هاتف"
          >
            <span className="about-growth__line" />

            {growthStages.map((stage, stageIndex) => {
              const isActive = stageIndex === activeGrowthIndex;

              return (
                <button
                  key={stage.year}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`about-growth__stage ${
                    isActive ? "about-growth__stage--active" : ""
                  }`}
                  onClick={() => setActiveGrowthIndex(stageIndex)}
                >
                  <span className="about-growth__marker">
                    <i />
                  </span>

                  <strong>{stage.year}</strong>
                </button>
              );
            })}
          </div>

          <article className="about-growth__detail" key={activeGrowth.year}>
            <span className="about-growth__detail-number">
              {formattedStageNumber}
            </span>

            <div>
              <h3>{activeGrowth.title}</h3>

              <p>{activeGrowth.description}</p>
            </div>
          </article>
        </div>
      </section>

      <AchievementsSection variant="about" />

      <AboutStatisticsSection />
      <AboutOrganizationSection />
      <AboutGovernanceSection />
    </div>
  );
}

export default AboutContentSections;
