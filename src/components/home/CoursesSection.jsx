import { useEffect, useMemo, useState } from "react";

import bannerImage from "../../assets/images/banner.png";
import ViewAllButton from "../common/ViewAllButton";
import ActivityCard from "../activities/ActivityCard";
import CoursesSliderControls from "../activities/CoursesSliderControls";

import "./CoursesSection.css";

const FALLBACK_ACTIVITIES = [
  {
    id: "course-1",
    type: "course",
    title: "دوره جامع مدیریت سبز",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
  {
    id: "event-1",
    type: "event",
    title: "رویداد معرفی فرصت‌های همکاری فناورانه",
    startDate: "۱۴۰۵/۰۵/۱۵",
    instructor: "تیم هاتف",
    organizer: "دبیرخانه هاتف",
    status: "ثبت‌نام فعال",
  },
  {
    id: "course-2",
    type: "course",
    title: "دوره توسعه کسب‌وکارهای دانش‌بنیان",
    startDate: "۱۴۰۵/۰۶/۲۰",
    instructor: "محمد کریمی",
    organizer: "دانشکده کارآفرینی دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: "event-2",
    type: "event",
    title: "نشست تخصصی تجاری‌سازی فناوری",
    startDate: "۱۴۰۵/۰۶/۲۵",
    instructor: "مرکز نوآوری",
    organizer: "برنامه هاتف",
    status: "به‌زودی",
  },
  {
    id: "course-3",
    type: "course",
    title: "دوره آموزش تجاری‌سازی فناوری",
    startDate: "۱۴۰۵/۰۷/۱۰",
    instructor: "علی رضایی",
    organizer: "مرکز نوآوری دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: "event-3",
    type: "event",
    title: "وبینار مسیر ورود طرح‌های دانشگاهی به صنعت",
    startDate: "۱۴۰۵/۰۷/۱۵",
    instructor: "دبیرخانه هاتف",
    organizer: "دانشگاه تهران",
    status: "به‌زودی",
  },
  {
    id: "course-4",
    type: "course",
    title: "دوره ارزیابی طرح‌های دانش‌بنیان",
    startDate: "۱۴۰۵/۰۸/۰۵",
    instructor: "حسین اکبری",
    organizer: "معاونت علمی دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: "event-4",
    type: "event",
    title: "رویداد ارائه نیازهای فناورانه صنعت",
    startDate: "۱۴۰۵/۰۸/۱۲",
    instructor: "شرکای تجاری هاتف",
    organizer: "برنامه هاتف",
    status: "به‌زودی",
  },
];

const ACTIVITY_STORAGE_KEY_PATTERN =
  /(activity|activities|course|courses|event|events|workshop|webinar)/i;

function safeParseJson(value, fallbackValue = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function normalizeText(value, fallback = "") {
  const normalizedValue = String(value || "").trim();

  return normalizedValue || fallback;
}

function normalizeActivityType(value = "") {
  const normalizedValue = String(value || "").toLowerCase();

  if (
    normalizedValue.includes("event") ||
    normalizedValue.includes("رویداد") ||
    normalizedValue.includes("همایش") ||
    normalizedValue.includes("نشست")
  ) {
    return "event";
  }

  return "course";
}

function getActivityType(item = {}) {
  return normalizeActivityType(
    item.type ||
      item.activityType ||
      item.kind ||
      item.mode ||
      item.category ||
      item.activityCategory,
  );
}

function getActivityTitle(item = {}) {
  return normalizeText(
    item.title ||
      item.name ||
      item.courseTitle ||
      item.eventTitle ||
      item.activityTitle,
  );
}

function isVisibleActivity(item = {}) {
  const status = String(item.status || item.state || "").toLowerCase();

  return !["draft", "deleted", "archived", "inactive"].includes(status);
}

function isActivityCandidate(item, sourceKey = "") {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  const title = getActivityTitle(item);

  if (!title) {
    return false;
  }

  const sourceHasSignal = ACTIVITY_STORAGE_KEY_PATTERN.test(sourceKey);

  const activityText = [
    item.type,
    item.activityType,
    item.kind,
    item.mode,
    item.category,
    item.activityCategory,
    item.title,
    item.name,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  const itemHasSignal =
    activityText.includes("course") ||
    activityText.includes("event") ||
    activityText.includes("workshop") ||
    activityText.includes("webinar") ||
    activityText.includes("دوره") ||
    activityText.includes("رویداد") ||
    activityText.includes("کارگاه") ||
    activityText.includes("وبینار");

  return (sourceHasSignal || itemHasSignal) && isVisibleActivity(item);
}

function collectActivityCandidates(value, sourceKey, output) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      collectActivityCandidates(item, sourceKey, output);
    });

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if (isActivityCandidate(value, sourceKey)) {
    output.push(value);
  }

  Object.entries(value).forEach(([key, childValue]) => {
    if (Array.isArray(childValue)) {
      collectActivityCandidates(childValue, `${sourceKey}.${key}`, output);
    }
  });
}

function readStoredActivityItems() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const candidates = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index) || "";

    if (!ACTIVITY_STORAGE_KEY_PATTERN.test(storageKey)) {
      continue;
    }

    const storedValue = window.localStorage.getItem(storageKey);
    const parsedValue = safeParseJson(storedValue, null);

    if (!parsedValue) {
      continue;
    }

    collectActivityCandidates(parsedValue, storageKey, candidates);
  }

  return candidates;
}

function getActivityImage(item = {}) {
  return (
    item.image ||
    item.imageUrl ||
    item.coverImage ||
    item.bannerImage ||
    item.thumbnail ||
    item.poster ||
    bannerImage
  );
}

function getActivityStartDate(item = {}) {
  return normalizeText(
    item.startDate ||
      item.date ||
      item.eventDate ||
      item.courseDate ||
      item.startAt ||
      item.startTime ||
      item.publishedAt ||
      item.createdAt,
    "زمان‌بندی اعلام نشده",
  );
}

function getActivityInstructor(item = {}) {
  const type = getActivityType(item);

  return normalizeText(
    item.instructor ||
      item.teacher ||
      item.presenter ||
      item.speaker ||
      item.lecturer ||
      item.mentor,
    type === "event" ? "ارائه‌دهنده رویداد" : "مدرس دوره",
  );
}

function getActivityOrganizer(item = {}) {
  return normalizeText(
    item.organizer ||
      item.organization ||
      item.host ||
      item.department ||
      item.institution ||
      item.ownerName,
    "برنامه هاتف",
  );
}

function getActivityStatus(item = {}) {
  const rawStatus = normalizeText(
    item.statusLabel ||
      item.registrationStatus ||
      item.statusText ||
      item.status ||
      item.state,
  );

  const normalizedStatus = rawStatus.toLowerCase();

  if (
    normalizedStatus === "published" ||
    normalizedStatus === "active" ||
    normalizedStatus === "open"
  ) {
    return "ثبت‌نام فعال";
  }

  if (normalizedStatus === "upcoming") {
    return "به‌زودی";
  }

  if (normalizedStatus === "closed" || normalizedStatus === "finished") {
    return "پایان‌یافته";
  }

  return rawStatus || "ثبت‌نام فعال";
}

function getActivityTimeValue(item = {}) {
  const possibleDateValues = [
    item.startDate,
    item.date,
    item.eventDate,
    item.courseDate,
    item.startAt,
    item.publishedAt,
    item.updatedAt,
    item.createdAt,
  ];

  for (const value of possibleDateValues) {
    const time = Date.parse(value);

    if (!Number.isNaN(time)) {
      return time;
    }
  }

  return 0;
}

function normalizeActivityItem(item = {}, index = 0) {
  const type = getActivityType(item);
  const fallbackId = `${type}-${index + 1}`;
  const id = normalizeText(item.id || item.slug || item.uuid, fallbackId);

  return {
    id,
    type,
    title: getActivityTitle(item),
    startDate: getActivityStartDate(item),
    instructor: getActivityInstructor(item),
    organizer: getActivityOrganizer(item),
    status: getActivityStatus(item),
    image: getActivityImage(item),
    path:
      item.path ||
      item.url ||
      item.detailsPath ||
      (type === "event" ? `/events/${id}` : `/courses/${id}`),
    buttonLabel: type === "event" ? "مشاهده رویداد" : "مشاهده دوره",
    firstMetaLabel: type === "event" ? "زمان:" : "شروع از:",
    sortValue: getActivityTimeValue(item),
  };
}

function getHomeActivityItems() {
  const storedItems = readStoredActivityItems()
    .map(normalizeActivityItem)
    .filter((item) => item.title);

  const uniqueItems = [];
  const seenKeys = new Set();

  storedItems.forEach((item) => {
    const key = `${item.type}-${item.id}-${item.title}`;

    if (seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    uniqueItems.push(item);
  });

  if (uniqueItems.length > 0) {
    return uniqueItems
      .sort((firstItem, secondItem) => {
        return secondItem.sortValue - firstItem.sortValue;
      })
      .slice(0, 8);
  }

  return FALLBACK_ACTIVITIES.map(normalizeActivityItem);
}

function createActivitySlides(items) {
  const slides = [];

  for (let index = 0; index < items.length; index += 4) {
    slides.push(items.slice(index, index + 4));
  }

  return slides.length > 0 ? slides : [items];
}

function CoursesSection() {
  const [activityItems, setActivityItems] = useState(getHomeActivityItems);

  const activitySlides = useMemo(
    () => createActivitySlides(activityItems),
    [activityItems],
  );

  const pageCount = activitySlides.length;

  const loopSlides = useMemo(() => {
    if (pageCount === 0) {
      return [];
    }

    return [
      activitySlides[pageCount - 1],
      ...activitySlides,
      activitySlides[0],
    ];
  }, [activitySlides, pageCount]);

  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  const activePage =
    pageCount > 0 ? (trackIndex - 1 + pageCount) % pageCount : 0;

  const moveTo = (nextIndex) => {
    if (isMoving || pageCount <= 1) {
      return;
    }

    setTransitionEnabled(true);
    setIsMoving(true);
    setTrackIndex(nextIndex);
  };

  const showNextPage = () => {
    moveTo(trackIndex + 1);
  };

  const showPreviousPage = () => {
    moveTo(trackIndex - 1);
  };

  const showSelectedPage = (pageIndex) => {
    const nextTrackIndex = pageIndex + 1;

    if (nextTrackIndex === trackIndex || isMoving) {
      return;
    }

    moveTo(nextTrackIndex);
  };

  const restoreTransition = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setIsMoving(false);
      });
    });
  };

  const handleTransitionEnd = () => {
    if (trackIndex === 0) {
      setTransitionEnabled(false);
      setTrackIndex(pageCount);
      restoreTransition();
      return;
    }

    if (trackIndex === pageCount + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
      restoreTransition();
      return;
    }

    setIsMoving(false);
  };

  useEffect(() => {
    const refreshActivityItems = () => {
      setActivityItems(getHomeActivityItems());
      setTransitionEnabled(false);
      setIsMoving(false);
      setTrackIndex(1);
      restoreTransition();
    };

    window.addEventListener("storage", refreshActivityItems);

    return () => {
      window.removeEventListener("storage", refreshActivityItems);
    };
  }, []);

  useEffect(() => {
    if (isMoving || pageCount <= 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTransitionEnabled(true);
      setIsMoving(true);
      setTrackIndex((currentTrackIndex) => currentTrackIndex + 1);
    }, 8000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [trackIndex, isMoving, pageCount]);

  if (activityItems.length === 0) {
    return null;
  }

  return (
    <section className="courses-section" id="courses">
      <div className="courses-section__container">
        <div className="courses-section__heading">
          <h2>رویدادها و دوره‌ها</h2>

          <span className="courses-section__line" />

          <CoursesSliderControls
            slides={activitySlides}
            activePage={activePage}
            isMoving={isMoving}
            pageCount={pageCount}
            onPrevious={showPreviousPage}
            onNext={showNextPage}
            onSelectPage={showSelectedPage}
          />
        </div>

        <div className="courses-section__viewport">
          <div
            className={`courses-section__track ${
              transitionEnabled
                ? ""
                : "courses-section__track--without-transition"
            }`}
            style={{
              transform: `translate3d(-${trackIndex * 100}%, 0, 0)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {loopSlides.map((slide, slideIndex) => (
              <div
                className="courses-section__page"
                key={`activity-slide-${slideIndex}`}
              >
                {slide.map((activity) => (
                  <ActivityCard
                    key={`${slideIndex}-${activity.type}-${activity.id}`}
                    item={activity}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="courses-section__footer">
          <ViewAllButton to="/events" />
        </div>
      </div>
    </section>
  );
}

export default CoursesSection;
