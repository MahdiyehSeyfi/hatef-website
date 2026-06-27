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

function CoursesSliderControls({
  slides,
  activePage,
  isMoving,
  pageCount,
  onPrevious,
  onNext,
  onSelectPage,
}) {
  return (
    <div className="courses-section__controls">
      <button
        type="button"
        className="courses-section__arrow"
        onClick={onPrevious}
        disabled={isMoving || pageCount <= 1}
        aria-label="اسلاید قبلی رویدادها و دوره‌ها"
      >
        <SliderArrow direction="previous" />
      </button>

      <div
        className="courses-section__dots"
        aria-label="انتخاب اسلاید رویدادها و دوره‌ها"
      >
        {slides.map((slide, pageIndex) => {
          const isActive = pageIndex === activePage;

          return (
            <button
              key={`activity-dot-${pageIndex}`}
              type="button"
              className={`courses-section__dot ${
                isActive ? "courses-section__dot--active" : ""
              }`}
              onClick={() => onSelectPage(pageIndex)}
              disabled={isMoving}
              aria-label={`نمایش اسلاید ${pageIndex + 1}`}
              aria-current={isActive ? "true" : undefined}
            />
          );
        })}
      </div>

      <button
        type="button"
        className="courses-section__arrow"
        onClick={onNext}
        disabled={isMoving || pageCount <= 1}
        aria-label="اسلاید بعدی رویدادها و دوره‌ها"
      >
        <SliderArrow direction="next" />
      </button>
    </div>
  );
}

export default CoursesSliderControls;
