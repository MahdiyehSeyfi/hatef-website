import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";

import bannerImage from "../../assets/images/banner.png";

import ActivityCard from "../../components/activities/ActivityCard";
import ActivitiesCarousel from "../../components/activities/ActivitiesCarousel";
import ExpandableArticle from "../../components/activities/ExpandableArticle";

import {
  getPublicCourseItems,
  getPublicEventItems,
} from "../../services/publicActivityService";

import "./ActivitiesPage.css";

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 24;
const PREVIEW_ITEM_LIMIT = 12;

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const PERSIAN_DIGITS_MAP = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

const STATUS_GROWTH_SCORE = {
  registering: 4,
  ongoing: 3,
  "coming-soon": 2,
  past: 1,
};

function toPersianNumber(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function normalizeDigits(value) {
  return String(value || "").replace(/[۰-۹]/g, (digit) => {
    return PERSIAN_DIGITS_MAP[digit] || digit;
  });
}

function parseNumberValue(value) {
  const normalizedValue = normalizeDigits(value);
  const numberMatch = normalizedValue.match(/\d+/);

  return numberMatch ? Number(numberMatch[0]) : 0;
}

function parseActivityDateValue(value) {
  const normalizedValue = normalizeDigits(value).trim();

  if (!normalizedValue) {
    return 0;
  }

  const slashDateMatch = normalizedValue.match(
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
  );

  if (slashDateMatch) {
    const [, year, month, day] = slashDateMatch;

    return Number(year) * 10000 + Number(month) * 100 + Number(day);
  }

  const parsedTime = Date.parse(normalizedValue);

  if (!Number.isNaN(parsedTime)) {
    return parsedTime;
  }

  return 0;
}

function getActivityTimeValue(item = {}) {
  const possibleDateValues = [
    item.publishedAt,
    item.updatedAt,
    item.createdAt,
    item.startDate,
    item.eventDate,
    item.date,
    item.registrationDate,
  ];

  return Math.max(...possibleDateValues.map(parseActivityDateValue), 0);
}

function getActivityPopularityValue(item = {}) {
  const possibleValues = [
    item.popularity,
    item.priority,
    item.viewCount,
    item.views,
    item.registrationCount,
    item.registeredCount,
    item.participantsCount,
    item.capacity,
  ];

  const parsedValues = possibleValues.map(parseNumberValue);

  return Math.max(...parsedValues, 0);
}

function sortLatestActivities(items) {
  return [...items].sort((firstItem, secondItem) => {
    return getActivityTimeValue(secondItem) - getActivityTimeValue(firstItem);
  });
}

function sortPopularActivities(items) {
  return [...items].sort((firstItem, secondItem) => {
    const popularityDifference =
      getActivityPopularityValue(secondItem) -
      getActivityPopularityValue(firstItem);

    if (popularityDifference !== 0) {
      return popularityDifference;
    }

    return getActivityTimeValue(secondItem) - getActivityTimeValue(firstItem);
  });
}

function sortGrowingActivities(items) {
  return [...items].sort((firstItem, secondItem) => {
    const growthDifference =
      (STATUS_GROWTH_SCORE[secondItem.status] || 0) -
      (STATUS_GROWTH_SCORE[firstItem.status] || 0);

    if (growthDifference !== 0) {
      return growthDifference;
    }

    return getActivityTimeValue(secondItem) - getActivityTimeValue(firstItem);
  });
}

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

function getCategoryBasePath(mode) {
  return mode === "courses" ? "/courses/all" : "/events/all";
}

function getCategoryDefinitions(mode, items) {
  const typeLabel = mode === "courses" ? "دوره" : "رویداد";
  const pluralLabel = mode === "courses" ? "دوره‌ها" : "رویدادها";
  const basePath = getCategoryBasePath(mode);

  return [
    {
      id: "latest",
      title: `${pluralLabel}ی جدید`,
      detailTitle: `همه ${pluralLabel}ی جدید`,
      description: `آخرین ${typeLabel}هایی که در برنامه هاتف منتشر شده‌اند.`,
      items: sortLatestActivities(items),
      viewAllPath: `${basePath}?category=latest`,
      emptyMessage: `هنوز ${typeLabel} جدیدی برای نمایش ثبت نشده است.`,
    },
    {
      id: "popular",
      title: `${pluralLabel}ی محبوب`,
      detailTitle: `همه ${pluralLabel}ی محبوب`,
      description: `${typeLabel}هایی که بیشترین ظرفیت، استقبال یا اولویت نمایشی را دارند.`,
      items: sortPopularActivities(items),
      viewAllPath: `${basePath}?category=popular`,
      emptyMessage: `هنوز ${typeLabel} محبوبی برای نمایش ثبت نشده است.`,
    },
    {
      id: "growing",
      title: `${pluralLabel}ی رو به رشد`,
      detailTitle: `همه ${pluralLabel}ی رو به رشد`,
      description: `${typeLabel}هایی که در وضعیت ثبت‌نام فعال، اجرا یا رشد قرار دارند.`,
      items: sortGrowingActivities(items),
      viewAllPath: `${basePath}?category=growing`,
      emptyMessage: `هنوز ${typeLabel} رو به رشدی برای نمایش ثبت نشده است.`,
    },
  ];
}

function getPageInformation(mode, courseItems, eventItems) {
  if (mode === "events") {
    return {
      eyebrow: "رویدادهای تخصصی هاتف",
      title: "رویدادهای هاتف",
      subtitle:
        "فرصتی برای ارتباط پژوهشگران، فناوران، دانشگاه، صنعت و سرمایه‌گذاران",
      primaryStat: eventItems.length,
      primaryLabel: "رویداد ثبت‌شده",
      secondaryStat: eventItems.filter((item) => item.status === "registering")
        .length,
      secondaryLabel: "در حال ثبت‌نام",
    };
  }

  if (mode === "courses") {
    return {
      eyebrow: "آموزش و توانمندسازی",
      title: "دوره‌های توانمندسازی هاتف",
      subtitle:
        "آموزش مهارت‌های کاربردی برای توسعه فناوری، مدیریت پروژه و کسب‌وکار",
      primaryStat: courseItems.length,
      primaryLabel: "دوره آموزشی",
      secondaryStat: courseItems.filter((item) => item.status === "registering")
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
      courseItems.filter((item) => item.status === "registering").length +
      eventItems.filter((item) => item.status === "registering").length,
    secondaryLabel: "فرصت ثبت‌نام",
  };
}

function useInfiniteVisibleCount(mode, categoryId, totalItems) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [mode, categoryId]);

  useEffect(() => {
    if (visibleCount >= totalItems) {
      return undefined;
    }

    const handleScroll = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const currentScrollBottom = window.innerHeight + window.scrollY;
      const distanceToBottom = documentHeight - currentScrollBottom;

      if (distanceToBottom > 520) {
        return;
      }

      setVisibleCount((currentCount) => {
        return Math.min(currentCount + LOAD_MORE_COUNT, totalItems);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visibleCount, totalItems]);

  return visibleCount;
}

function EmptyActivitiesSection({ title, message }) {
  return (
    <section className="activities-page__section">
      <header className="activities-page__section-heading">
        <div>
          <div className="activities-page__section-title">
            <span />
            <h2>{title}</h2>
          </div>
        </div>
      </header>

      <p className="activities-page__empty">{message}</p>
    </section>
  );
}

function ActivitiesListing({ category, items, visibleCount, backPath }) {
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleItems.length < items.length;

  return (
    <section className="activities-page__listing">
      <div className="activities-page__back-row">
        <Link to={backPath} className="activities-page__back-button">
          <span aria-hidden="true">→</span>
          بازگشت به دسته‌بندی‌ها
        </Link>
      </div>

      <header className="activities-page__section-heading activities-page__section-heading--listing">
        <div>
          <div className="activities-page__section-title">
            <span />
            <h2>{category.detailTitle}</h2>
          </div>

          <p>{category.description}</p>
        </div>
      </header>

      <div className="activities-page__listing-grid">
        {visibleItems.map((item) => (
          <ActivityCard
            key={`${category.id}-${item.type}-${item.id || item.slug}`}
            item={item}
          />
        ))}
      </div>

      {hasMore && (
        <p className="activities-page__loading-hint">
          برای نمایش موارد بیشتر، صفحه را به پایین اسکرول کنید.
        </p>
      )}
    </section>
  );
}

function ActivitiesPage({ mode = "combined" }) {
  const location = useLocation();

  const selectedCategoryId = new URLSearchParams(location.search).get(
    "category",
  );

  const courseItems = useMemo(() => {
    return sortLatestActivities(getPublicCourseItems());
  }, []);

  const eventItems = useMemo(() => {
    return sortLatestActivities(getPublicEventItems());
  }, []);

  const pageInformation = getPageInformation(mode, courseItems, eventItems);

  const previewEventItems = eventItems.slice(0, PREVIEW_ITEM_LIMIT);
  const previewCourseItems = courseItems.slice(0, PREVIEW_ITEM_LIMIT);

  const categorySourceItems = mode === "courses" ? courseItems : eventItems;
  const categoryDefinitions = getCategoryDefinitions(mode, categorySourceItems);
  const selectedCategory = categoryDefinitions.find((category) => {
    return category.id === selectedCategoryId;
  });

  const shouldShowCategoryDetail =
    Boolean(selectedCategory) && (mode === "events" || mode === "courses");

  const visibleCount = useInfiniteVisibleCount(
    mode,
    selectedCategory?.id,
    selectedCategory?.items.length || 0,
  );

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
                  <strong>
                    {toPersianNumber(pageInformation.primaryStat)}
                  </strong>
                  <span>{pageInformation.primaryLabel}</span>
                </div>

                <div>
                  <strong>
                    {toPersianNumber(pageInformation.secondaryStat)}
                  </strong>
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
          {mode === "combined" && (
            <>
              {previewEventItems.length > 0 ? (
                <ActivitiesCarousel
                  title="رویدادهای هاتف"
                  items={previewEventItems}
                  viewAllPath="/events/all"
                  viewAllLabel="مشاهده همه"
                />
              ) : (
                <EmptyActivitiesSection
                  title="رویدادهای هاتف"
                  message="هنوز رویدادی برای نمایش ثبت نشده است."
                />
              )}

              {previewCourseItems.length > 0 ? (
                <ActivitiesCarousel
                  title="دوره‌های توانمندسازی"
                  items={previewCourseItems}
                  viewAllPath="/courses/all"
                  viewAllLabel="مشاهده همه"
                />
              ) : (
                <EmptyActivitiesSection
                  title="دوره‌های توانمندسازی"
                  message="هنوز دوره‌ای برای نمایش ثبت نشده است."
                />
              )}
            </>
          )}

          {(mode === "events" || mode === "courses") &&
            !shouldShowCategoryDetail &&
            categoryDefinitions.map((category) =>
              category.items.length > 0 ? (
                <ActivitiesCarousel
                  key={`${mode}-${category.id}`}
                  title={category.title}
                  items={category.items.slice(0, PREVIEW_ITEM_LIMIT)}
                  viewAllPath={category.viewAllPath}
                  viewAllLabel="مشاهده همه"
                />
              ) : (
                <EmptyActivitiesSection
                  key={`${mode}-${category.id}`}
                  title={category.title}
                  message={category.emptyMessage}
                />
              ),
            )}

          {shouldShowCategoryDetail && (
            <ActivitiesListing
              category={selectedCategory}
              items={selectedCategory.items}
              visibleCount={visibleCount}
              backPath={getCategoryBasePath(mode)}
            />
          )}
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
