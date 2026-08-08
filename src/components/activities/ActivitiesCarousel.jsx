import { useEffect, useMemo, useState } from "react";
import ActivityCard from "./ActivityCard";
import Button from "../ui/Button/Button";
import IconButton from "../ui/IconButton/IconButton";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import "./ActivitiesCarousel.css";

const cardsPerPage = 4;

function createPages(items) {
  const pages = [];

  for (let index = 0; index < items.length; index += cardsPerPage) {
    pages.push(items.slice(index, index + cardsPerPage));
  }

  return pages;
}

function SliderArrow({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`activity-carousel__arrow-icon activity-carousel__arrow-icon--${direction}`}
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

function ActivitiesCarousel({
  title,
  items,
  viewAllPath,
  viewAllLabel = "مشاهده همه",
}) {
  const pages = useMemo(() => createPages(items), [items]);
  const [activePage, setActivePage] = useState(0);

  const pageCount = pages.length;
  const shouldShowViewAll = Boolean(viewAllPath);

  const showNextPage = () => {
    setActivePage((currentPage) => {
      return (currentPage + 1) % pageCount;
    });
  };

  const showPreviousPage = () => {
    setActivePage((currentPage) => {
      return (currentPage - 1 + pageCount) % pageCount;
    });
  };

  useEffect(() => {
    if (pageCount <= 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActivePage((currentPage) => {
        return (currentPage + 1) % pageCount;
      });
    }, 7000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activePage, pageCount]);

  useEffect(() => {
    setActivePage(0);
  }, [items]);

  if (pageCount === 0) {
    return null;
  }

  return (
    <section className="activity-carousel">
      <SectionHeader
        title={title}
        className="activity-carousel__heading"
        action={
          pageCount > 1 ? (
            <div className="activity-carousel__controls">
              <IconButton
                type="button"
                variant="outline"
                size="md"
                className="activity-carousel__arrow"
                onClick={showPreviousPage}
                aria-label="اسلاید قبلی"
              >
                <SliderArrow direction="previous" />
              </IconButton>

              <div
                className="activity-carousel__dots"
                aria-label={`انتخاب اسلاید ${title}`}
              >
                {pages.map((page, pageIndex) => {
                  const isActive = pageIndex === activePage;

                  return (
                    <button
                      key={`${title}-dot-${pageIndex}`}
                      type="button"
                      className={`activity-carousel__dot ${
                        isActive ? "activity-carousel__dot--active" : ""
                      }`}
                      onClick={() => setActivePage(pageIndex)}
                      aria-label={`نمایش اسلاید ${pageIndex + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    />
                  );
                })}
              </div>

              <IconButton
                type="button"
                variant="outline"
                size="md"
                className="activity-carousel__arrow"
                onClick={showNextPage}
                aria-label="اسلاید بعدی"
              >
                <SliderArrow direction="next" />
              </IconButton>
            </div>
          ) : null
        }
      />

      <div className="activity-carousel__viewport">
        <div
          className="activity-carousel__track"
          style={{
            transform: `translate3d(-${activePage * 100}%, 0, 0)`,
          }}
        >
          {pages.map((page, pageIndex) => (
            <div
              className="activity-carousel__page"
              key={`${title}-page-${pageIndex}`}
            >
              {page.map((item) => (
                <ActivityCard item={item} key={item.id} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {shouldShowViewAll && (
        <div className="activity-carousel__footer">
          <Button
            to={viewAllPath}
            variant="outline"
            size="sm"
            trailingIcon="←"
            className="activity-carousel__view-all"
          >
            {viewAllLabel}
          </Button>
        </div>
      )}
    </section>
  );
}

export default ActivitiesCarousel;
