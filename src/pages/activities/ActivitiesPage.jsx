import { Link } from "react-router";

import bannerImage from "../../assets/images/banner.png";

import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import ExpandableArticle from "../../components/activities/ExpandableArticle";

import {
  getPublicActivitiesByStatus,
  getPublicCourseItems,
  getPublicEventItems,
} from "../../services/publicActivityService";

import "./ActivitiesPage.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3v4M17 3v4M3.5 9h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CourseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m3 7.5 9-4 9 4-9 4-9-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M6 9.2V14c0 2 2.7 3.7 6 3.7s6-1.7 6-3.7V9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M21 8v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

const articleParagraphs = [
  "رویدادها و دوره‌های تخصصی برنامه هاتف با هدف توسعه مهارت‌های پژوهشگران، دانشجویان و فعالان حوزه فناوری برگزار می‌شوند. این برنامه‌ها زمینه مناسبی برای تبادل تجربه، یادگیری مهارت‌های کاربردی و توسعه همکاری میان دانشگاه و صنعت فراهم می‌کنند.",
  "محتوای دوره‌ها متناسب با نیازهای روز صنایع، شرکت‌های دانش‌بنیان و مجموعه‌های فناور طراحی شده است و شرکت‌کنندگان را با مفاهیم تجاری‌سازی، مدیریت پروژه، توسعه محصول و ورود به بازار آشنا می‌کند.",
  "رویدادهای تخصصی نیز فرصتی برای معرفی دستاوردهای پژوهشی، ارائه ایده‌های نوآورانه، ارتباط با سرمایه‌گذاران و شکل‌گیری همکاری‌های جدید هستند.",
];

const pageNavigation = [
  {
    id: "combined",
    title: "همه برنامه‌ها",
    description: "دوره‌ها و رویدادها",
    path: "/events",
    Icon: GridIcon,
  },
  {
    id: "events",
    title: "رویدادهای هاتف",
    description: "همایش‌ها و برنامه‌ها",
    path: "/events/all",
    Icon: CalendarIcon,
  },
  {
    id: "courses",
    title: "دوره‌های توانمندسازی",
    description: "آموزش و مهارت‌افزایی",
    path: "/courses/all",
    Icon: CourseIcon,
  },
];

function getPageInformation(mode, courseItems, eventItems) {
  if (mode === "events") {
    return {
      eyebrow: "رویدادهای تخصصی هاتف",
      title: "رویدادهای برتر و سازنده در هاتف",
      subtitle:
        "فرصتی برای ارتباط پژوهشگران، فناوران، دانشگاه، صنعت و سرمایه‌گذاران",
      primaryStat: eventItems.length,
      primaryLabel: "رویداد ثبت‌شده",
      secondaryStat: getPublicActivitiesByStatus(eventItems, "registering")
        .length,
      secondaryLabel: "در حال ثبت‌نام",
    };
  }

  if (mode === "courses") {
    return {
      eyebrow: "آموزش و توانمندسازی",
      title: "دوره‌های توانمندسازی و مهارت‌افزایی هاتف",
      subtitle:
        "آموزش مهارت‌های کاربردی برای توسعه فناوری، مدیریت پروژه و کسب‌وکار",
      primaryStat: courseItems.length,
      primaryLabel: "دوره آموزشی",
      secondaryStat: getPublicActivitiesByStatus(courseItems, "registering")
        .length,
      secondaryLabel: "ثبت‌نام فعال",
    };
  }

  return {
    eyebrow: "مرکز برنامه‌های هاتف",
    title: "رویدادها و دوره‌های تخصصی هاتف",
    subtitle: "مجموعه‌ای از برنامه‌های آموزشی، پژوهشی و فناورانه دانشگاه تهران",
    primaryStat: courseItems.length + eventItems.length,
    primaryLabel: "برنامه تخصصی",
    secondaryStat:
      getPublicActivitiesByStatus(courseItems, "registering").length +
      getPublicActivitiesByStatus(eventItems, "registering").length,
    secondaryLabel: "فرصت ثبت‌نام",
  };
}

function ActivitiesPage({ mode = "combined" }) {
  const courseItems = getPublicCourseItems();
  const eventItems = getPublicEventItems();
  const pageInformation = getPageInformation(mode, courseItems, eventItems);

  const sections = [];

  if (mode === "combined") {
    sections.push(
      {
        id: "events",
        title: "رویدادهای هاتف",
        items: eventItems,
        viewAllPath: "/events/all",
        viewAllLabel: "همه رویدادها",
      },
      {
        id: "courses",
        title: "دوره‌های توانمندسازی",
        items: courseItems,
        viewAllPath: "/courses/all",
        viewAllLabel: "همه دوره‌ها",
      },
    );
  }

  if (mode === "events") {
    sections.push(
      {
        id: "event-registering",
        title: "در حال ثبت‌نام",
        items: getPublicActivitiesByStatus(eventItems, "registering"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
      {
        id: "event-ongoing",
        title: "در حال برگزاری",
        items: getPublicActivitiesByStatus(eventItems, "ongoing"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
      {
        id: "event-past",
        title: "رویدادهای برگزارشده",
        items: getPublicActivitiesByStatus(eventItems, "past"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
    );
  }

  if (mode === "courses") {
    sections.push(
      {
        id: "course-registering",
        title: "در حال ثبت‌نام",
        items: getPublicActivitiesByStatus(courseItems, "registering"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
      {
        id: "course-ongoing",
        title: "در حال برگزاری",
        items: getPublicActivitiesByStatus(courseItems, "ongoing"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
      {
        id: "course-past",
        title: "دوره‌های برگزارشده",
        items: getPublicActivitiesByStatus(courseItems, "past"),
        viewAllPath: "/events",
        viewAllLabel: "همه برنامه‌ها",
      },
    );
  }

  return (
    <div className="activities-page">
      <section className="activities-page__intro">
        <div className="activities-page__container">
          <nav className="activities-page__breadcrumb" aria-label="مسیر صفحه">
            <Link to="/">صفحه اصلی</Link>
            <span>/</span>
            <span>{pageInformation.title}</span>
          </nav>

          <div className="activities-page__hero">
            <img src={bannerImage} alt={pageInformation.title} />

            <div className="activities-page__hero-shade" />

            <div className="activities-page__hero-content">
              <span className="activities-page__eyebrow">
                {pageInformation.eyebrow}
              </span>

              <h1>{pageInformation.title}</h1>

              <p>{pageInformation.subtitle}</p>

              <div className="activities-page__stats">
                <div>
                  <strong>{pageInformation.primaryStat}</strong>
                  <span>{pageInformation.primaryLabel}</span>
                </div>

                <div>
                  <strong>{pageInformation.secondaryStat}</strong>
                  <span>{pageInformation.secondaryLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <nav
            className="activities-page__switcher"
            aria-label="دسته‌بندی برنامه‌ها"
          >
            {pageNavigation.map(({ id, title, description, path, Icon }) => {
              const isActive = id === mode;

              return (
                <Link
                  key={id}
                  to={path}
                  className={`activities-page__switch-card ${
                    isActive ? "activities-page__switch-card--active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="activities-page__switch-icon">
                    <Icon />
                  </span>

                  <span className="activities-page__switch-content">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>

                  <span
                    className="activities-page__switch-arrow"
                    aria-hidden="true"
                  >
                    ←
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <main className="activities-page__content">
        <div className="activities-page__container">
          {sections.map((section) => (
            <ActivitiesCarousel
              key={`${mode}-${section.id}`}
              title={section.title}
              items={section.items}
              viewAllPath={section.viewAllPath}
              viewAllLabel={section.viewAllLabel}
            />
          ))}
        </div>
      </main>

      <ExpandableArticle
        title="درباره رویدادها و دوره‌های هاتف"
        paragraphs={articleParagraphs}
      />
    </div>
  );
}

export default ActivitiesPage;
