import { useEffect, useMemo, useState } from "react";
import bannerImage from "../../assets/images/banner.png";
import "./CoursesSection.css";

const courses = [
  {
    id: 1,
    title: "دوره جامع مدیریت سبز",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
  {
    id: 2,
    title: "دوره مدیریت پروژه‌های فناورانه",
    startDate: "۱۴۰۵/۰۵/۱۵",
    instructor: "سارا احمدی",
    organizer: "معاونت پژوهشی دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: 3,
    title: "دوره توسعه کسب‌وکارهای دانش‌بنیان",
    startDate: "۱۴۰۵/۰۶/۲۰",
    instructor: "محمد کریمی",
    organizer: "دانشکده کارآفرینی دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: 4,
    title: "دوره طراحی مدل کسب‌وکار فناورانه",
    startDate: "۱۴۰۵/۰۶/۲۵",
    instructor: "مریم حیدری",
    organizer: "مرکز رشد دانشگاه تهران",
    status: "به‌زودی",
  },
  {
    id: 5,
    title: "دوره آموزش تجاری‌سازی فناوری",
    startDate: "۱۴۰۵/۰۷/۱۰",
    instructor: "علی رضایی",
    organizer: "مرکز نوآوری دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: 6,
    title: "دوره مدیریت محصولات فناورانه",
    startDate: "۱۴۰۵/۰۷/۱۵",
    instructor: "نگار محمدی",
    organizer: "دانشکده مدیریت دانشگاه تهران",
    status: "به‌زودی",
  },
  {
    id: 7,
    title: "دوره ارزیابی طرح‌های دانش‌بنیان",
    startDate: "۱۴۰۵/۰۸/۰۵",
    instructor: "حسین اکبری",
    organizer: "معاونت علمی دانشگاه تهران",
    status: "ثبت‌نام فعال",
  },
  {
    id: 8,
    title: "دوره توسعه بازار محصولات نوآورانه",
    startDate: "۱۴۰۵/۰۸/۱۲",
    instructor: "زهرا مرادی",
    organizer: "مرکز کارآفرینی دانشگاه تهران",
    status: "به‌زودی",
  },
];

const courseSlides = [
  courses.slice(0, 4),
  courses.slice(2, 6),
  courses.slice(4, 8),
];

function SliderArrow({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`courses-section__arrow-icon courses-section__arrow-icon--${direction}`}
    >
      <path
        d="M8.5 5.5 15 12l-6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CourseCard({ course }) {
  return (
    <article className="course-card">
      <a href="#course-details" className="course-card__image-wrapper">
        <img
          className="course-card__image"
          src={bannerImage}
          alt={course.title}
        />

        <span className="course-card__status">{course.status}</span>
      </a>

      <div className="course-card__content">
        <a href="#course-details" className="course-card__title">
          {course.title}
        </a>

        <dl className="course-card__details">
          <div>
            <dt>شروع از:</dt>
            <dd>{course.startDate}</dd>
          </div>

          <div>
            <dt>مدرس:</dt>
            <dd>{course.instructor}</dd>
          </div>

          <div>
            <dt>برگزارکننده:</dt>
            <dd>{course.organizer}</dd>
          </div>
        </dl>

        <a href="#course-details" className="course-card__button">
          مشاهده دوره
        </a>
      </div>
    </article>
  );
}

function CoursesSection() {
  const pageCount = courseSlides.length;

  const loopSlides = useMemo(
    () => [courseSlides[pageCount - 1], ...courseSlides, courseSlides[0]],
    [pageCount],
  );

  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  const activePage = (trackIndex - 1 + pageCount) % pageCount;

  const moveTo = (nextIndex) => {
    if (isMoving) {
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
    const timer = window.setTimeout(() => {
      if (!isMoving) {
        showNextPage();
      }
    }, 8000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [trackIndex, isMoving]);

  return (
    <section className="courses-section" id="courses">
      <div className="courses-section__container">
        <div className="courses-section__heading">
          <h2>دوره‌های توانمندسازی</h2>

          <span className="courses-section__line" />

          <div className="courses-section__controls">
            <button
              type="button"
              className="courses-section__arrow"
              onClick={showPreviousPage}
              aria-label="اسلاید قبلی دوره‌ها"
            >
              <SliderArrow direction="previous" />
            </button>

            <div
              className="courses-section__dots"
              aria-label="انتخاب اسلاید دوره‌ها"
            >
              {courseSlides.map((slide, pageIndex) => {
                const isActive = pageIndex === activePage;

                return (
                  <button
                    key={`course-dot-${pageIndex}`}
                    type="button"
                    className={`courses-section__dot ${
                      isActive ? "courses-section__dot--active" : ""
                    }`}
                    onClick={() => showSelectedPage(pageIndex)}
                    aria-label={`نمایش اسلاید ${pageIndex + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  />
                );
              })}
            </div>

            <button
              type="button"
              className="courses-section__arrow"
              onClick={showNextPage}
              aria-label="اسلاید بعدی دوره‌ها"
            >
              <SliderArrow direction="next" />
            </button>
          </div>
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
                key={`course-slide-${slideIndex}`}
              >
                {slide.map((course) => (
                  <CourseCard
                    key={`${slideIndex}-${course.id}`}
                    course={course}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="courses-section__footer">
          <a href="#all-courses" className="courses-section__view-all">
            مشاهده همه
            <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default CoursesSection;
