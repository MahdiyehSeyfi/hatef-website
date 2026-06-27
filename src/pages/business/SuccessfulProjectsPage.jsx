import { useState } from "react";
import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";
import { allCollaborationProjects } from "../../data/collaborationProjectsData";
import { getPublishedSuccessfulProjectItems } from "../../services/projectPublicationService";

import "./SuccessfulProjectsPage.css";

const successfulProjects = allCollaborationProjects
  .slice(0, 6)
  .map((project, index) => {
    const results = [
      "کاهش ۲۸٪ مصرف انرژی",
      "ورود به مرحله همکاری صنعتی",
      "استفاده در چند پروژه فناورانه",
      "کاهش آلایندگی و هزینه عملیاتی",
      "اتصال تیم فناور به شریک صنعتی",
      "افزایش پایداری فرآیند تولید",
    ];

    return {
      ...project,
      successYear: index < 2 ? "۱۴۰۵" : "۱۴۰۴",
      successResult: results[index],
    };
  });

const achievementStats = [
  {
    id: 1,
    value: "+۳۲",
    label: "پروژه موفق",
  },
  {
    id: 2,
    value: "+۱۸",
    label: "همکاری صنعتی",
  },
  {
    id: 3,
    value: "+۱۲",
    label: "محصول آماده توسعه",
  },
  {
    id: 4,
    value: "۷۵٪",
    label: "میانگین پیشرفت طرح‌ها",
  },
];

const achievementTabs = [
  {
    id: "commercialization",
    title: "تجاری‌سازی",
    heading: "تبدیل طرح‌های پژوهشی به مسیر تجاری",
    description:
      "بخشی از طرح‌های منتخب پس از ارزیابی و راهبری، وارد مسیر تدوین مدل همکاری، بررسی بازار، جذب شریک و آماده‌سازی برای تجاری‌سازی شده‌اند.",
    items: [
      "تدوین مدل کسب‌وکار",
      "بررسی بازار هدف",
      "آماده‌سازی برای جذب شریک",
    ],
  },
  {
    id: "industry",
    title: "اتصال به صنعت",
    heading: "ایجاد ارتباط میان دانشگاه و نیازهای واقعی صنعت",
    description:
      "در این مسیر، پروژه‌ها از حالت صرفاً پژوهشی خارج شده و با نیازهای واقعی صنعت، سرمایه‌گذاران و مجموعه‌های اجرایی پیوند پیدا کرده‌اند.",
    items: [
      "شناسایی نیاز صنعتی",
      "جلسات مشترک با ذی‌نفعان",
      "تعریف مسیر همکاری",
    ],
  },
  {
    id: "technology",
    title: "رشد فناوری",
    heading: "افزایش آمادگی فناوری و بلوغ طرح‌ها",
    description:
      "طرح‌ها از نظر فنی، اجرایی و قابلیت توسعه بررسی شده و در مسیر تکمیل نمونه، اصلاح مستندات و ارتقای سطح آمادگی قرار گرفته‌اند.",
    items: ["افزایش TRL", "تکمیل مستندات فنی", "بهبود مسیر توسعه محصول"],
  },
];

const achievementMilestones = [
  {
    id: 1,
    title: "شناسایی طرح‌های توانمند",
    description:
      "طرح‌هایی که ظرفیت علمی، فنی یا صنعتی بالاتری دارند شناسایی و وارد مسیر بررسی می‌شوند.",
  },
  {
    id: 2,
    title: "راهبری و ارزیابی تخصصی",
    description:
      "طرح‌ها از نظر فنی، بازار، مدل همکاری و امکان تجاری‌سازی بررسی و اصلاح می‌شوند.",
  },
  {
    id: 3,
    title: "اتصال به فرصت‌های همکاری",
    description:
      "طرح‌های آماده‌تر به شبکه همکاران صنعتی، سرمایه‌گذاران یا مشاوران تخصصی متصل می‌شوند.",
  },
  {
    id: 4,
    title: "ثبت خروجی و دستاورد",
    description:
      "نتایج قابل ارائه، پروژه‌های موفق، همکاری‌های شکل‌گرفته و مسیرهای توسعه ثبت می‌شوند.",
  },
];

const articleParagraphs = [
  "دستاوردها و پروژه‌های موفق برنامه هاتف نشان‌دهنده مسیر طی‌شده طرح‌های پژوهشی و فناورانه از مرحله ایده تا توسعه، ارزیابی، همکاری صنعتی و تجاری‌سازی هستند.",
  "در این بخش، پروژه‌هایی معرفی می‌شوند که توانسته‌اند از نظر فنی، اجرایی، اثرگذاری یا ظرفیت همکاری به نتایج قابل توجهی برسند. برخی از این پروژه‌ها وارد مرحله همکاری با صنعت شده‌اند و برخی دیگر در مسیر توسعه محصول، جذب سرمایه یا ورود به بازار قرار گرفته‌اند.",
  "هدف از نمایش این پروژه‌ها، ایجاد شفافیت، معرفی ظرفیت‌های موفق دانشگاهی و نشان‌دادن مسیر واقعی رشد فناوری در برنامه هاتف است.",
];

function SectionHeading({ title, subtitle }) {
  return (
    <div className="successful-projects__section-heading">
      <div className="successful-projects__section-title">
        <span />
        <h2>{title}</h2>
      </div>

      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function AchievementTabs() {
  const [activeTabId, setActiveTabId] = useState(achievementTabs[0].id);

  const activeTab =
    achievementTabs.find((tab) => tab.id === activeTabId) || achievementTabs[0];

  return (
    <div className="successful-projects__tabs">
      <div className="successful-projects__tabs-nav">
        {achievementTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              tab.id === activeTab.id
                ? "successful-projects__tab-button successful-projects__tab-button--active"
                : "successful-projects__tab-button"
            }
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="successful-projects__tab-panel">
        <span>دستاورد منتخب</span>
        <h3>{activeTab.heading}</h3>
        <p>{activeTab.description}</p>

        <ul>
          {activeTab.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AchievementsSection() {
  return (
    <section className="successful-projects__achievements" id="achievements">
      <div className="successful-projects__container">
        <SectionHeading
          title="دستاوردهای کلیدی"
          subtitle="در این بخش، خروجی‌های مهم برنامه هاتف به‌صورت آماری، تعاملی و مرحله‌ای نمایش داده می‌شوند."
        />

        <div className="successful-projects__stats-grid">
          {achievementStats.map((stat) => (
            <article key={stat.id}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>

        <AchievementTabs />

        <div className="successful-projects__milestones">
          {achievementMilestones.map((item) => (
            <article key={item.id}>
              <span>{item.id}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="successful-projects__card">
      <Link
        to={`/business/opportunities/${project.id}`}
        className="successful-projects__card-image"
      >
        <img src={project.image} alt={project.title} />
        <span>پروژه موفق</span>
      </Link>

      <div className="successful-projects__card-body">
        <h3>
          <Link to={`/business/opportunities/${project.id}`}>
            {project.title}
          </Link>
        </h3>

        <ul>
          <li>حوزه: {project.field}</li>
          <li>سال اجرا: {project.successYear}</li>
          <li>نتیجه: {project.successResult}</li>
          <li>وضعیت: {project.level}</li>
        </ul>

        <Link
          to={`/business/opportunities/${project.id}`}
          className="successful-projects__card-button"
        >
          مشاهده جزئیات
        </Link>
      </div>
    </article>
  );
}

function ProjectsSection() {
  const [visibleCount, setVisibleCount] = useState(4);

  const visibleProjects = successfulProjects.slice(0, visibleCount);
  const hasMore = visibleCount < successfulProjects.length;

  const handleShowMore = () => {
    setVisibleCount((current) =>
      Math.min(current + 4, successfulProjects.length),
    );
  };

  return (
    <section className="successful-projects__section" id="successful-projects">
      <div className="successful-projects__container">
        <SectionHeading
          title="پروژه‌های موفق"
          subtitle="نمونه‌هایی از طرح‌هایی که در مسیر توسعه فناوری، همکاری صنعتی یا تجاری‌سازی به نتیجه رسیده‌اند."
        />

        <div className="successful-projects__cards">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {hasMore && (
          <div className="successful-projects__more-wrap">
            <button
              type="button"
              className="successful-projects__more"
              onClick={handleShowMore}
            >
              مشاهده بیشتر
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PublishedIntroducedProjectsSection() {
  const [visibleCount, setVisibleCount] = useState(4);
  const publishedProjects = getPublishedSuccessfulProjectItems().map(
    (project) => ({
      ...project,
      successYear: project.date || "ثبت شده",
      successResult: project.summary || "طرح منتشرشده توسط کمیته هاتف",
    }),
  );

  const visibleProjects = publishedProjects.slice(0, visibleCount);
  const hasMore = visibleCount < publishedProjects.length;

  if (!publishedProjects.length) {
    return null;
  }

  return (
    <section
      className="successful-projects__section"
      id="introduced-successful-projects"
    >
      <div className="successful-projects__container">
        <SectionHeading
          title="طرح‌های منتشرشده هاتف"
          subtitle="طرح‌هایی که پس از تکمیل اطلاعات توسط فناور و تایید کمیته در بخش پروژه‌ها و دستاوردها منتشر شده‌اند."
        />

        <div className="successful-projects__cards">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {hasMore && (
          <div className="successful-projects__more-wrap">
            <button
              type="button"
              className="successful-projects__more"
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + 4, publishedProjects.length),
                )
              }
            >
              مشاهده بیشتر
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SuccessArticle() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="successful-projects__article">
      <div className="successful-projects__container">
        <div className="successful-projects__article-card">
          <span>مسیر موفقیت طرح‌ها</span>

          <h2>پروژه‌های موفق چگونه در برنامه هاتف شکل می‌گیرند؟</h2>

          <div
            className={`successful-projects__article-content ${
              isExpanded
                ? "successful-projects__article-content--expanded"
                : "successful-projects__article-content--collapsed"
            }`}
          >
            {articleParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="successful-projects__article-button"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "بستن مطلب" : "مطالعه بیشتر"}
            <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function SuccessfulProjectsPage() {
  return (
    <main className="successful-projects">
      <section className="successful-projects__hero">
        <img src={bannerImage} alt="" aria-hidden="true" />

        <div className="successful-projects__hero-overlay" />

        <div className="successful-projects__container successful-projects__hero-inner">
          <div className="successful-projects__hero-content">
            <span>همکاری‌های تجاری هاتف</span>

            <h1>دستاوردها و پروژه‌های موفق</h1>

            <p>
              مروری بر خروجی‌های اثرگذار برنامه هاتف؛ از رشد فناوری و اتصال به
              صنعت تا پروژه‌هایی که وارد مسیر همکاری و تجاری‌سازی شده‌اند.
            </p>

            <div className="successful-projects__hero-actions">
              <a href="#achievements">دستاوردهای کلیدی</a>
              <a href="#successful-projects">پروژه‌های موفق</a>
            </div>
          </div>

          <div className="successful-projects__hero-stats">
            {achievementStats.map((stat) => (
              <div key={stat.id}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AchievementsSection />

      <ProjectsSection />

      <PublishedIntroducedProjectsSection />

      <SuccessArticle />
    </main>
  );
}

export default SuccessfulProjectsPage;
