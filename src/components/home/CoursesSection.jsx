import { useEffect, useMemo, useState } from "react";

import ViewAllButton from "../common/ViewAllButton";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import ActivityCard from "../activities/ActivityCard";
import CoursesSliderControls from "../activities/CoursesSliderControls";

import {
  getPublicCourseItems,
  getPublicEventItems,
} from "../../services/publicActivityService";

import "./CoursesSection.css";

const HOME_ACTIVITY_SLIDE_COUNT = 3;
const CARDS_PER_SLIDE = 4;
const HOME_ACTIVITY_ITEM_LIMIT = HOME_ACTIVITY_SLIDE_COUNT * CARDS_PER_SLIDE;

const STATUS_PRIORITY = {
  registering: 1,
  ongoing: 2,
  "coming-soon": 3,
  past: 4,
};

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

function normalizeDigits(value) {
  return String(value || "").replace(/[۰-۹]/g, (digit) => {
    return PERSIAN_DIGITS_MAP[digit] || digit;
  });
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

function getActivityStatusPriority(item = {}) {
  return STATUS_PRIORITY[item.status] || 5;
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

function getActivityUniqueKey(item = {}) {
  return `${item.type || "activity"}-${item.id || item.slug || item.title}`;
}

function sortLatestActivities(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstTime = getActivityTimeValue(firstItem);
    const secondTime = getActivityTimeValue(secondItem);

    if (firstTime !== secondTime) {
      return secondTime - firstTime;
    }

    return (
      getActivityStatusPriority(firstItem) -
      getActivityStatusPriority(secondItem)
    );
  });
}

function getHomeActivityItems() {
  const eventItems = getPublicEventItems();
  const courseItems = getPublicCourseItems();

  const allItems = [...eventItems, ...courseItems];
  const seenKeys = new Set();

  return sortLatestActivities(allItems)
    .filter((item) => item && item.title)
    .filter((item) => {
      const key = getActivityUniqueKey(item);

      if (seenKeys.has(key)) {
        return false;
      }

      seenKeys.add(key);
      return true;
    })
    .slice(0, HOME_ACTIVITY_ITEM_LIMIT);
}

function createActivitySlides(items) {
  const slides = [];

  for (let index = 0; index < items.length; index += CARDS_PER_SLIDE) {
    slides.push(items.slice(index, index + CARDS_PER_SLIDE));
  }

  return slides;
}

function CoursesSection() {
  const [activityItems, setActivityItems] = useState(() =>
    getHomeActivityItems(),
  );

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

  const restoreTransition = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setIsMoving(false);
      });
    });
  };

  const refreshActivityItems = () => {
    setActivityItems(getHomeActivityItems());
    setTransitionEnabled(false);
    setIsMoving(false);
    setTrackIndex(1);
    restoreTransition();
  };

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
    window.addEventListener("storage", refreshActivityItems);
    window.addEventListener("focus", refreshActivityItems);
    window.addEventListener(
      "hatef-public-activity-change",
      refreshActivityItems,
    );
    window.addEventListener(
      "hatef-instructor-activity-change",
      refreshActivityItems,
    );

    return () => {
      window.removeEventListener("storage", refreshActivityItems);
      window.removeEventListener("focus", refreshActivityItems);
      window.removeEventListener(
        "hatef-public-activity-change",
        refreshActivityItems,
      );
      window.removeEventListener(
        "hatef-instructor-activity-change",
        refreshActivityItems,
      );
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
        <SectionHeader
          title="رویدادها و دوره‌ها"
          className="courses-section__heading"
          action={
            <CoursesSliderControls
              slides={activitySlides}
              activePage={activePage}
              isMoving={isMoving}
              pageCount={pageCount}
              onPrevious={showPreviousPage}
              onNext={showNextPage}
              onSelectPage={showSelectedPage}
            />
          }
        />

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
