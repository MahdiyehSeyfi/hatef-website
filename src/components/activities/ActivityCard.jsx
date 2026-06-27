import { Link } from "react-router";

import "./ActivityCard.css";

function ActivityCard({ item, activity }) {
  const currentItem = item || activity;

  if (!currentItem) {
    return null;
  }

  return (
    <article className="activity-card">
      <Link
        to={currentItem.path}
        className="activity-card__media"
        aria-label={`مشاهده ${currentItem.title}`}
      >
        <img
          className="activity-card__image"
          src={currentItem.image}
          alt={currentItem.title}
        />

        <span className="activity-card__status">{currentItem.status}</span>
      </Link>

      <div className="activity-card__content">
        <Link to={currentItem.path} className="activity-card__title">
          {currentItem.title}
        </Link>

        <dl className="activity-card__details">
          <div>
            <dt>{currentItem.firstMetaLabel}</dt>
            <dd>{currentItem.startDate}</dd>
          </div>

          <div>
            <dt>{currentItem.type === "event" ? "ارائه‌دهنده:" : "مدرس:"}</dt>
            <dd>{currentItem.instructor}</dd>
          </div>

          <div>
            <dt>برگزارکننده:</dt>
            <dd>{currentItem.organizer}</dd>
          </div>
        </dl>

        <Link to={currentItem.path} className="activity-card__button">
          {currentItem.buttonLabel}
        </Link>
      </div>
    </article>
  );
}

export default ActivityCard;
